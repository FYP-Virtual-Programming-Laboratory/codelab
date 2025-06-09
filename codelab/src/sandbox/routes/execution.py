from fastapi import APIRouter, Depends
from typing import Annotated
from src.models import ExerciseSubmission, Task
from src.sandbox.services import (
    cancle_queued_exercise_submission_service,
    cancle_queued_task_service,
    create_exercise_submission_service,
    create_task_execution_service,
    get_exercise_submission_by_id_service,
    get_task_by_id_service, 
    get_tasks_queue_list_service,
)


router = APIRouter()


@router.post('/{session_id}/tasks/')
def create_task_executions(
    task_execution: Annotated[Task, Depends(create_task_execution_service)]
) -> Task:
    return task_execution


@router.get('/{session_id}/tasks/')
def list_tasks_in_execution_queue(
    tasks: Annotated[list[Task], Depends(get_tasks_queue_list_service)]
) -> list[Task]:
    """List all tasks in the execution queue."""
    return tasks


@router.get('/{session_id}/tasks/{task_id}/')
def get_execution_task(
    task: Annotated[Task, Depends(get_task_by_id_service)]
) -> Task:
    """Get details of a task."""
    return task


@router.delete('/{session_id}/tasks/{task_id}/')
def cancle_execution_task(
    task: Annotated[Task, Depends(cancle_queued_task_service)]
) -> Task:
    """Cancel a task from the execution queue."""
    return task


@router.post('/{session_id}/submission/')
def create_exercise_submission(
    submission: Annotated[ExerciseSubmission, Depends(create_exercise_submission_service)]
) -> ExerciseSubmission:
    """Create a new exercise submission."""
    return submission


@router.get('/{session_id}/submission/{submission_id}/')
def get_exercise_submission(
    submission: Annotated[ExerciseSubmission, Depends(get_exercise_submission_by_id_service)]
) -> ExerciseSubmission:
    """Get details of an exercise submission."""
    return submission


@router.delete('/{session_id}/submission/{submission_id}/')
def cancle_exercise_submission(
    submission: Annotated[ExerciseSubmission, Depends(cancle_queued_exercise_submission_service)]
) -> ExerciseSubmission:
    """Cancel an exercise submission."""
    return submission


