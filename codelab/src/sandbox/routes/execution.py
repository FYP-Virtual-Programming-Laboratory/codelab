from fastapi import APIRouter, Depends
from typing import Annotated
from src.models import ExerciseSubmission, Tasks
from src.sandbox.services import (
    cancle_queued_task_service,
    create_exercise_submission_serivce,
    create_task_execution_service,
    get_exercise_submission_by_id_service,
    get_task_by_id_service, 
    get_tasks_queue_list_service,
)


router = APIRouter()


@router.post('/{session_external_id}/tasks/')
def create_task_executions(
    task_execution: Annotated[Tasks, Depends(create_task_execution_service)]
) -> Tasks:
    return task_execution


@router.get('/{session_external_id}/tasks/')
def list_tasks_in_execution_queue(
    tasks: Annotated[list[Tasks], Depends(get_tasks_queue_list_service)]
) -> list[Tasks]:
    """List all tasks in the execution queue."""
    return tasks


@router.get('/{session_external_id}/tasks/{task_id}/')
def get_execution_task(
    task: Annotated[Tasks, Depends(get_task_by_id_service)]
) -> Tasks:
    """Get details of a task."""
    return task


@router.delete('/{session_external_id}/tasks/{task_id}/')
def cancle_execution_task(
    task: Annotated[Tasks, Depends(cancle_queued_task_service)]
) -> Tasks:
    """Cancel a task from the execution queue."""
    return task


@router.post('/{session_external_id}/submission/')
def create_exercise_submission(
    submission: Annotated[ExerciseSubmission, Depends(create_exercise_submission_serivce)]
) -> ExerciseSubmission:
    """Create a new exercise submission."""
    return submission


@router.get('/{session_external_id}/submission/{submission_id}/')
def get_exercise_submission(
    submission: Annotated[ExerciseSubmission, Depends(get_exercise_submission_by_id_service)]
) -> ExerciseSubmission:
    """Get details of an exercise submission."""
    return submission

