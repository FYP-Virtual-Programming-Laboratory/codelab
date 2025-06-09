import os
from src.external.schemas import CodeRepository
from src.models import ExerciseSubmission, Task, TestCase
from src.sandbox.executor.task import TaskExecutor
from src.sandbox.executor.submission import SubmissionExecutor
from src.sandbox.executor.base import BaseExecutor
from src.sandbox.ochestator.container import ContainerBuilderErrors
from src.sandbox.ochestator.schemas import ContainerConfig
from src.schemas import DatabaseExecutionResult
from src.models import Session, LanguageImage
from src.core.config import settings
from src.log import logger
from docker.errors import APIError


class ExecutionFailedError(Exception):
    
    def __init__(self, error_message: str) -> None:
        super().__init__(error_message)


class ResourceManager:

    def _get_container_config(self, session: Session) -> ContainerConfig:
        """Calculate the container configuration based on the given session configuration."""

        session_config = session.configuration
        container_config = ContainerConfig(
            cpu_time_limit_minutes=session_config.cpu_time_limit / 60,
            memory_limit_kb=session_config.memory_limit,
            max_processes=session_config.max_processes_and_or_threads,
            enable_network=session_config.enable_network
        )

        return container_config

    def _compilation_command(
        self,
        entry_file_path: str,
        language_image: LanguageImage,
    ) -> tuple[str, str]:
        """Get the compilation command based on the given language image."""
        
        assert language_image.requires_compilation == True

        if '<output_filename>' in language_image.compilation_command:
            compile_filename = (
                f"CompiledProgram.{language_image.compile_file_extension}"
            )
        else:
            compile_filename = entry_file_path.replace(
                language_image.file_extension,
                language_image.compile_file_extension,
            )

        compile_command = language_image.compilation_command.replace(
            "<filename>", entry_file_path
        ).replace("<output_filename>", compile_filename)
        
        return compile_command, compile_filename

    def _execution_command(
        self,
        entry_file_path: str,
        language_image: LanguageImage,
    ) -> str:
        """Get execution command."""
        
        return language_image.default_execution_command.replace(
            "<filename>", entry_file_path
        )

    def _execute_program(
        self,
        entry_file_path: str,
        language_image: LanguageImage,
        available_test_cases: list[TestCase],
        executor: BaseExecutor,
    ) -> list[DatabaseExecutionResult]:
        """Execute the program."""
    
        execution_command = self._execution_command(
            entry_file_path=entry_file_path,
            language_image=language_image,
        )

        # first things first attempt to compile the program
        if language_image.requires_compilation:
            compile_command, compile_filename = self._compilation_command(
                language_image=language_image,
                entry_file_path=entry_file_path,
            ) 
            execution_command = self._execution_command(
                entry_file_path=compile_filename,
                language_image=language_image,
            )
            
            try:
                result = executor.run(command=compile_command, is_compilation=True)
            except (Exception, APIError) as error:
                raise ExecutionFailedError(error_message=str(error)) from error

            if result.state != 'success':
                return [
                    DatabaseExecutionResult(
                        **result.model_dump(),
                        test_case_id=test_case.id,
                    )
                    for test_case in available_test_cases
                ] if available_test_cases else [
                    DatabaseExecutionResult(
                        **result.model_dump(),
                    )
                ]

        try:
            # after compilation run the program for each test case
            results = []
            if available_test_cases:
                for test_case in available_test_cases:
                    results.append(
                        DatabaseExecutionResult(
                            **executor.run(
                                command=execution_command,
                                std_in=test_case.test_input,
                            ).model_dump(exclude=['test_case_id']),
                            test_case_id=test_case.id,
                        )
                    )
            else:
                results.append(
                    DatabaseExecutionResult(
                        **executor.run(command=execution_command).model_dump()
                    ) 
                )
        except (Exception, APIError) as error:
            raise ExecutionFailedError(error_message=str(error)) from error

        return results

    def _execute_task(
        self, 
        task: Task, 
        code_repository: CodeRepository
    ) -> list[DatabaseExecutionResult]:
        """Execute a task."""
        
        session = task.exercise.session
        language_image = session.language_image
        container_config = self._get_container_config(session)
        available_test_cases = [
            test_case
            for test_case in task.exercise.test_cases
            if test_case.visible
        ]

        session_id = str(session.id)
        executor_id =  str(task.student_id if task.student_id else task.group_id)
        try:
            executor = TaskExecutor(
                task=task,
                workdir=f"/{executor_id}",
                mount_dir=os.path.join(settings.TESTING_DIR, session_id, executor_id),
                container_config=container_config,
                code_repository=code_repository,
            )
        except ContainerBuilderErrors as error:
            logger.error(
                'src::sandbox::manger::ResourceManager::_execute_task:: '
                f'Container build failed with error: {error.error_message}',
                extra={
                    'task_id': str(task.id),
                    'exit_code': error.exit_code,
                }
            )
            raise ExecutionFailedError(error_message=error.error_message) from error

        return self._execute_program(
            entry_file_path=task.entry_file_path,
            language_image=language_image,
            available_test_cases=available_test_cases,
            executor=executor,
        )

    def _execute_submission(
        self, 
        submission: ExerciseSubmission,
        code_repository: CodeRepository,
    ) -> list[DatabaseExecutionResult]:
        """Execute an exercise submission."""

        session = submission.exercise.session
        language_image = session.language_image
        container_config = self._get_container_config(session)
        available_test_cases = submission.exercise.test_cases

        session_id = str(session.id)
        executor_id =  str(submission.student_id if submission.student_id else submission.group_id)
        try:
            executor = SubmissionExecutor(
                submission=submission,
                workdir=f"/{executor_id}",
                mount_dir=os.path.join(settings.SUBMISSION_DIR, session_id, executor_id),
                container_config=container_config,
                code_repository=code_repository,
            )
        except ContainerBuilderErrors as error:
            logger.error(
                'src::sandbox::manger::ResourceManager::_execute_submission:: '
                f'Container build failed with error: {error.error_message}',
                extra={
                    'submission_id': str(submission.id),
                    'exit_code': error.exit_code,
                }
            )
            raise ExecutionFailedError(error_message=error.error_message) from error

        return self._execute_program(
            entry_file_path=submission.entry_file_path,
            language_image=language_image,
            available_test_cases=available_test_cases,
            executor=executor,
        )

    def execute(
        self, 
        code_repository: CodeRepository,
        request: Task | ExerciseSubmission, 
    ) -> list[DatabaseExecutionResult]:
        """Execute a given task or exercise submission."""
        
        if isinstance(request, Task):
            print('EXECUTING AS TASK')
            return self._execute_task(request, code_repository=code_repository)

        print('EXECUTING AS SUBMISSION')
        return self._execute_submission(request, code_repository=code_repository)
