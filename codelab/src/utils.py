from src.worker import celery_app


class CeleryHelper:
    """Contains helper functionalities to be used while interacting with Celery."""

    @staticmethod
    def is_being_executed(task_name: str) -> bool:
        """Returns whether the task with given task_name is already being executed.

        Args:
            task_name: Name of the task to check if it is running currently.
        Returns: A boolean indicating whether the task with the given task name is
            running currently.
        """
        active_tasks = celery_app.control.inspect().active()
        if active_tasks:
            for _, running_tasks in active_tasks.items():
                for task in running_tasks:
                    if task["name"] == task_name:
                        return True

        return False
