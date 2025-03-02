import abc
import time

from docker.errors import APIError
from docker.models.containers import Container

from src.log import logger
from src.sandbox.ochestator.schemas import ContainerConfig, ExecutionResult
from src.schemas import DatabaseExecutionResult
from src.utils import TimeOutException, raise_timeout


class BaseExecutor(abc.ABC):  # noqa
    """Abstract bases  executor class."""

    def __init__(
        self,
        workdir: str,
        mount_dir: str,
        container_config: ContainerConfig,
        retry_limit: int = 2,
    ):
        """Construct executor to execute a task."""
        self.workdir = workdir
        self.mount_dir = mount_dir
        self.container_config = container_config
        self.container = self._get_container()
        self.retry_limit = retry_limit

    @abc.abstractmethod
    def _get_container() -> Container:
        """Get a Container to use for execution."""

    def execute_commnd(self, command: str, workdir: str) -> ExecutionResult:
        """Execute a command and return the exit status and output."""

        try:
            full_cmd = f"bash -c '{command}'"
            executon_result = self.container.exec_run(
                cmd=full_cmd,
                workdir=workdir,
                demux=True,
                tty=False,
            )
            server_error = False
        except APIError as error:
            logger.error(
                f"Failed to execute command in container {self.container.id}: {error}",
                extra={
                    "container_id": self.container.id,
                    "error": str(error),
                    "command": command,
                    "workdir": workdir,
                },
            )
            executon_result = -1, ("", "")
            server_error = True

        exit_code = executon_result[0]
        std_out = (
            executon_result[1][0].decode("utf-8")
            if executon_result[1][0] is not None
            else None
        )
        std_err = (
            executon_result[1][1].decode("utf-8")
            if executon_result[1][1] is not None
            else None
        )
        succes = True if exit_code == 0 else False

        return ExecutionResult(
            success=succes,
            std_out=std_out,
            std_err=std_err,
            exit_code=exit_code,
            server_error=server_error,
        )

    def run(
        self,
        command: str,
        is_compilation: bool = False,
        std_in: str | None = None,
        retry: int = 0,
        remove_container: bool = False,
    ) -> DatabaseExecutionResult:
        """Run task executor."""

        # first start the container
        self.container.start()

        while self.container.status != "running":
            logger.info(
                f"Waiting for container to start: status is {self.container.status}"
            )
            time.sleep(0.5)
            self.container.reload()

        # Record start time before command execution
        start_time = time.time()
        # Execute the command in the container
        try:
            with raise_timeout(
                timeout=(self.container_config.cpu_time_limit_minutes * 60)
            ):
                # Wait for the container to exit
                command = command if not std_in else f"{command} <<< {std_in}"
                execution_result = self.execute_commnd(
                    command=command, workdir=self.workdir
                )

            if execution_result.server_error and retry < self.retry_limit:
                # stop the container and retry
                logger.debug(
                    f"Server Error occured during execution: `{command}`:\nERROR\n:`{execution_result.std_err}`"
                )

                self.container.stop(timeout=5)
                return self.run(command=command, std_in=std_in, retry=retry + 1)

            end_time = time.time()
            expended_time = end_time - start_time
            self.container.stop(timeout=5)

            if remove_container:
                self.container.remove(force=True, v=True)

            return DatabaseExecutionResult(
                std_in=std_in,
                std_out=execution_result.std_out,
                std_err=execution_result.std_err,
                exit_code=execution_result.exit_code,
                state="success" if execution_result.success else "failed",
                expended_time=expended_time,
                failed_execution=not execution_result.success,
                failed_compilation=not execution_result.success
                if is_compilation
                else None,
            )

        except TimeOutException:
            end_time = time.time()
            expended_time = end_time - start_time
            logger.debug(
                f"Execution timed out for task:\n"
                f"Execution took: {expended_time} with TTL: {self.container_config.cpu_time_limit_seconds}"
            )

            if remove_container:
                self.container.remove(force=True, v=True)

            return DatabaseExecutionResult(
                std_in=std_in,
                std_out=None,
                std_err=None,
                exit_code=-1,
                state="timed_out",
                expended_time=expended_time,
                failed_execution=True,
                failed_compilation=True if is_compilation else None,
            )
