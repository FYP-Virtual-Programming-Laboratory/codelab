import signal
from collections.abc import Generator
from contextlib import contextmanager

from src.worker import celery_app


class CeleryHelper:
    """Contains helper functionalities to be used while interacting with Celery."""

    @staticmethod
    def is_being_executed(tasks_name: str | list[str]) -> bool:
        """Returns whether the task with given task_name is already being executed.

        Args:
            task_name: Name of the task to check if it is running currently.
        Returns: A boolean indicating whether the task with the given task name is
            running currently.
        """
        active_tasks = celery_app.control.inspect().active()
        if active_tasks:
            for _, running_tasks in active_tasks.items():
                intersects = bool(
                    set([task["name"] for task in running_tasks]).intersection(
                        tasks_name
                    )
                )

                if intersects:
                    return True

        return False


class TimeOutException(Exception):
    pass


class TimeoutStatus:
    def __init__(self):
        self.timed_out = False


@contextmanager
def raise_timeout(timeout: int) -> Generator[None, None, TimeoutStatus]:
    # Create status object
    status = TimeoutStatus()

    # Define signal handler that sets timed_out and raises exception
    def _handler(signum, frame):
        status.timed_out = True
        raise TimeOutException()

    # Set up the signal handler and alarm
    signal.signal(signal.SIGALRM, _handler)
    signal.alarm(timeout)

    try:
        # Yield the status object to be used as 'timed_out' in the with statement
        yield status
    except TimeOutException:
        # Ensure timed_out is True (though the handler already sets it)
        status.timed_out = True
        raise  # Re-raise the exception
    finally:
        # Disable the alarm
        signal.alarm(0)
