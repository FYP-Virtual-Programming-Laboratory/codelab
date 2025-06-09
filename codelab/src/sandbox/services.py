from typing import Annotated
from uuid import UUID

from fastapi import Body, Depends, HTTPException, Path
from sqlmodel import Session, col, func, select, update

from src.core.dependecies import (
    require_admin, 
    require_admin_or_student, 
    require_db_session, 
    require_student,
)
from src.models import (
    Exercise,
    ExerciseSubmission,
    Group,
    LanguageImage,
    SessionEnrollment,
    Task,
    Student,
    Admin,
)
from src.models import Session as WorkflowSession
from src.sandbox.schemas import (
    CreateExcerciseExecutionSchema,
    CreateLanguageImageSchema,
    CreateTaskExecutionSchema,
    UpdateLanguageSchema,
)
from src.sandbox.tasks import build_language_image_task, program_execution_queue
from src.schemas import ImageStatus, TaskStatus
from src.utils import CeleryHelper
from src.core.exceptions import APIException
from src.core.schemas import APIErrorCodes
from fastapi import status


def create_new_langauge_image_service(
    admin: Annotated[Admin, Depends(require_admin)],
    db_session: Annotated[Session, Depends(require_db_session)],
    image_data: Annotated[CreateLanguageImageSchema, Body()],
) -> LanguageImage:
    """Create a new language image."""

    if CeleryHelper.is_being_executed(["build_language_image_task"]):
        raise HTTPException(
            status_code=400,
            detail="Unbale to trigger language build as a build is in progress",
        )

    image = LanguageImage(
        **image_data.model_dump(),
        status=ImageStatus.created,
        created_by_id=admin.id,
    )

    db_session.add(image)
    db_session.commit()
    db_session.refresh(image)

    # enqueue a celery task to build the image asynchronously
    build_language_image_task.delay(image_id=image.id)
    return image


def list_language_image_services(
    _: Annotated[Admin, Depends(require_admin)],
    db_session: Annotated[Session, Depends(require_db_session)],
) -> list[LanguageImage]:
    """List all language images."""
    return db_session.exec(
        select(LanguageImage).order_by(col(LanguageImage.created_at))
    ).all()


def get_language_image_by_id_service(
    _: Annotated[Admin, Depends(require_admin)],
    db_session: Annotated[Session, Depends(require_db_session)],
    image_id: Annotated[UUID, Path()],
) -> LanguageImage:
    """Get a language image by its ID."""
    language_image = db_session.exec(
        select(LanguageImage).where(LanguageImage.id == image_id)
    ).first()

    if not language_image:
        raise HTTPException(status_code=404, detail="Language image not found")

    return language_image


def update_language_image_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
    data: Annotated[UpdateLanguageSchema, Body()],
) -> LanguageImage:
    """Update a language image."""

    # check that the user is the creator of the language image
    if (
        language_image.created_by_id != admin.id 
        and language_image.created_by_id is not None
    ):
        raise APIException(
            message='You are not allowed to update a custom language image you did not create.',
            error_code=APIErrorCodes.FORBIDDEN,
            status_code=status.HTTP_403_FORBIDDEN,
        )

    update_data = data.model_dump(exclude_unset=True)

    fields_that_trigger_rebuild = [
        "base_image",
        "file_extension",
        "compile_file_extension",
        "entrypoint_script",
        "requires_compilation" "compilation_command",
        "requires_compilation",
        "default_execution_command",
    ]
    needs_rebuild = bool(
        set(update_data.keys()).intersection(fields_that_trigger_rebuild)
    )

    update_data.update(
        status=ImageStatus.scheduled_for_rebuild
        if needs_rebuild
        else language_image.status
    )

    language_image.sqlmodel_update(update_data)

    db_session.add(language_image)
    db_session.commit()
    db_session.refresh(language_image)
    return language_image


def delete_language_image_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
) -> LanguageImage:
    """Detete a language image."""

    # check that the user is the creator of the language image
    if (
        language_image.created_by_id != admin.id 
        and language_image.created_by_id is not None
    ):
        raise APIException(
            message='You are not allowed to delete a custom language image you did not create.',
            error_code=APIErrorCodes.FORBIDDEN,
            status_code=status.HTTP_403_FORBIDDEN,
        )

    language_image.status = ImageStatus.scheduled_for_deletion
    db_session.add(language_image)
    db_session.commit()
    db_session.refresh(language_image)
    return language_image


def cancle_language_image_delation_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
) -> LanguageImage:
    """Cancel the deletion of a language image."""

    # check that the user is the creator of the language image
    if (
        language_image.created_by_id != admin.id 
        and language_image.created_by_id is not None
    ):
        raise APIException(
            message='You are not allowed to cancel the deletion of a custom language image you did not create.',
            error_code=APIErrorCodes.FORBIDDEN,
            status_code=status.HTTP_403_FORBIDDEN,
        )

    if language_image.status != ImageStatus.scheduled_for_deletion:
        return language_image

    language_image.status = ImageStatus.scheduled_for_rebuild
    db_session.add(language_image)
    db_session.commit()

    return language_image


def retry_language_image_build_service(
    _: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
) -> LanguageImage:
    """Retry building a language image."""

    # check that the user is the creator of the language image
    if (
        language_image.created_by_id != admin.id 
        and language_image.created_by_id is not None
    ):
        raise APIException(
            message='You are not allowed to retry building a custom language image you did not create.',
            error_code=APIErrorCodes.FORBIDDEN,
            status_code=status.HTTP_403_FORBIDDEN,
        )

    if CeleryHelper.is_being_executed(["build_language_image_task"]):
        raise APIException(
            message="Unable to trigger language build as a build is in progress",
            error_code=APIErrorCodes.LANGUAGE_IMAGE_BUILD_IN_PROGRESS,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    build_language_image_task.delay(image_id=language_image.id)
    return language_image


def prune_langauge_image_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    _: Annotated[Admin, Depends(require_admin)],
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
) -> LanguageImage:
    """Prune a language image."""
    language_image.status = ImageStatus.scheduled_for_prune
    db_session.add(language_image)
    db_session.commit()
    return language_image


def prune_all_language_images_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    _: Annotated[bool, Depends(require_admin)],
) -> None:
    """Prune all language images."""
    db_session.exec(
        update(LanguageImage)
        .where(LanguageImage.status != ImageStatus.unavailable)
        .values(status=ImageStatus.scheduled_for_prune)
    )
    db_session.commit()


def get_session_by_id_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session_id: Annotated[UUID, Path()],
) -> WorkflowSession:
    """Get a session by its external ID."""
    session = db_session.exec(
        select(WorkflowSession).where(WorkflowSession.id == session_id)
    ).first()

    if not session:
        raise APIException(
            message='Session not found.',
            error_code=APIErrorCodes.NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return session


def get_active_session_by_id_service(
    session: Annotated[WorkflowSession, Depends(get_session_by_id_service)],
) -> WorkflowSession:
    """Get an active session by its external ID."""
    if not session.is_active:
        raise APIException(
            message='Session is not active.',
            error_code=APIErrorCodes.SESSION_INACTIVE,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    return session


def get_task_by_id_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session: Annotated[WorkflowSession, Depends(get_active_session_by_id_service)],
    user: Annotated[Student | Admin, Depends(require_admin_or_student)],
    task_id: Annotated[UUID, Path()],
) -> Task:
    """Get a task by its ID."""

    user_args = []

    if isinstance(user, Student):
        # if the user is a student, we need to check that the task belongs to the student
        user_args.append(col(Task.student_id) == user.id)
    elif isinstance(user, Admin):
        # if the user is an admin, we need to check that the task belongs to the admins session
        user_args.append(col(WorkflowSession.admin_id) == user.id)

    task = db_session.exec(
        select(Task)
        .join(Exercise, Task.exercise_id == Exercise.id)
        .join(WorkflowSession, Exercise.session_id == WorkflowSession.id)
        .where(
            col(Task.id) == task_id,
            col(WorkflowSession.id) == session.id,
            *user_args,
        )
    ).first()

    if not task:
        raise APIException(
            message='Task not found.',
            error_code=APIErrorCodes.NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return task


def get_queued_task_by_id_service(
    task: Annotated[Task, Depends(get_task_by_id_service)],
) -> Task:
    """Get a queued task by its ID."""
    if task.status != TaskStatus.queued:
        raise APIException(
            message='Task is not in queue.',
            error_code=APIErrorCodes.TASK_NOT_IN_QUEUE,
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return task


def get_tasks_queue_list_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session: Annotated[WorkflowSession, Depends(get_active_session_by_id_service)],
    user: Annotated[Student | Admin, Depends(require_admin_or_student)],
) -> list[Task]:
    """Get tasks queue list for a session."""

    user_args = []

    if isinstance(user, Student):
        user_args.append(col(Task.student_id) == user.id)
    elif isinstance(user, Admin):
        user_args.append(col(WorkflowSession.admin_id) == user.id)

    return db_session.exec(
        select(Task)
        .join(Exercise, Task.exercise_id == Exercise.id)
        .join(WorkflowSession, Exercise.session_id == WorkflowSession.id)
        .where(
            col(WorkflowSession.id) == session.id,
            col(Task.status).in_(
                [
                    TaskStatus.queued,
                    TaskStatus.executing,
                ]
            ),
            *user_args,
        )
    ).all()


def create_task_execution_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session: Annotated[WorkflowSession, Depends(get_active_session_by_id_service)],
    student: Annotated[Student, Depends(require_student)],
    task_data: Annotated[CreateTaskExecutionSchema, Body()],
) -> Task:
    """Create a new task execution."""

    # check that the queue has space to take the new task
    if (
        db_session.exec(
            select(func.count(col(Task.id)))
            .join(Exercise, Task.exercise_id == Exercise.id)
            .join(WorkflowSession, Exercise.session_id == WorkflowSession.id)
            .where(
                col(WorkflowSession.id) == session.id,
                col(Task.status).in_(
                    [
                        TaskStatus.queued,
                        TaskStatus.executing,
                    ]
                )
            )
        ).first()
        >= session.configuration.max_queue_size
    ):
        raise APIException(
            message="Queue is full, please try again later",
            error_code=APIErrorCodes.TASK_QUEUE_FULL,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # get excercise
    excercise = db_session.exec(
        select(Exercise).where(
            Exercise.id == task_data.excercise_id,
            Exercise.session_id == session.id,
        )
    ).first()

    if not excercise:
        raise APIException(
            message="Excercise not found.",
            error_code=APIErrorCodes.NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
        )

    # check if the student has exceeded their task execution threshold for this session
    # we only count tasks that are in queue or where successfully executed
    if (
        (db_session.exec(
            select(func.count(col(Task.id)))
            .join(Exercise, Task.exercise_id == Exercise.id)
            .join(WorkflowSession, Exercise.session_id == WorkflowSession.id)
            .where(
                col(Task.student_id) == student.id,
                col(WorkflowSession.id) == session.id,
            )
        ).first() or 0) >= session.configuration.max_number_of_runs
    ):
        raise APIException(
            message="Student has exceeded their task execution threshold for this session",
            error_code=APIErrorCodes.TASK_EXECUTION_THRESHOLD_EXCEEDED,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # check that the student does not have a task currently executing or pending
    if db_session.exec(
        select(Task)
        .join(Exercise, Task.exercise_id == Exercise.id)
        .join(WorkflowSession, Exercise.session_id == WorkflowSession.id)
        .where(
            col(Task.student_id) == student.id,
            col(WorkflowSession.id) == session.id,
            col(Task.status).in_(
                [
                    TaskStatus.executing,
                    TaskStatus.queued,
                ]
            ),
        )
    ).first():
        raise APIException(
            message="Student already has a task in execution queue",
            error_code=APIErrorCodes.TASK_ALREADY_IN_QUEUE,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # create the task and set its status to queued
    task = Task(
        status=TaskStatus.queued,
        student_id=student.id,
        exercise_id=excercise.id,
        entry_file_path=str(task_data.entry_file_path),
    )

    # wait a bit for the request to be done before sending the task to the queue
    celery_result = program_execution_queue.apply_async(
        countdown=5,
        kwargs={'task_id': task.id},
    )

    if celery_result:
        task.celery_task_id = celery_result.id

    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    return task


def cancle_queued_task_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    task: Annotated[Task, Depends(get_queued_task_by_id_service)],
    user: Annotated[Student | Admin, Depends(require_admin_or_student)],
) -> Task:
    """Cancel a queued task."""

    if isinstance(user, Student) and task.student_id != user.id:
        raise APIException(
            message="Task not found.",
            error_code=APIErrorCodes.NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
        )

    task.status = TaskStatus.cancelled
    db_session.add(task)
    db_session.commit()

    # attempt to cancel the tasks celery process if it exists
    celery_result = program_execution_queue.AsyncResult(task.celery_task_id)
    if celery_result:
        celery_result.revoke(terminate=True)

    return task


def create_exercise_submission_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session: Annotated[WorkflowSession, Depends(get_session_by_id_service)],
    submission_data: Annotated[CreateExcerciseExecutionSchema, Body()],
    student: Annotated[Student, Depends(require_student)],
) -> ExerciseSubmission:
    """Create a new exercise submission."""
    group: Group | None = None

    # ensure that the session is a collaboration session
    if session.collaboration_enabled and submission_data.group_id is None:
        raise APIException(
            message="This session is a collaboration session, you must submit as a group.",
            error_code=APIErrorCodes.FORBIDDEN,
            status_code=status.HTTP_403_FORBIDDEN,
        )

    if submission_data.group_id:
        group_details = db_session.exec(
            select(Group, SessionEnrollment.is_group_leader)
            .join(SessionEnrollment, Group.id == SessionEnrollment.group_id)
            .where(
                SessionEnrollment.student_id == student.id,
                Group.id == submission_data.group_id,
                Group.session_id == session.id,
            )
        ).first()

        if not group_details:
            raise APIException(
                message="Group not found.",
                error_code=APIErrorCodes.NOT_FOUND,
                status_code=status.HTTP_404_NOT_FOUND,
            )

        group, is_group_leader = group_details

        if not is_group_leader:
            raise APIException(
                message="You are not allowed to submit on behalf of your group.",
                error_code=APIErrorCodes.FORBIDDEN,
                status_code=status.HTTP_403_FORBIDDEN,
            )

    # get excercise
    excercise = db_session.exec(
        select(Exercise).where(
            Exercise.id == submission_data.excercise_id,
            Exercise.session_id == session.id,
        )
    ).first()

    if not excercise:
        raise APIException(
            message="Excercise not found.",
            error_code=APIErrorCodes.NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
        )

    # check that we dont have a queued exercise submission from this group / student
    if db_session.exec(
        select(ExerciseSubmission).where(
            ExerciseSubmission.group_id == (group.id if group else None),
            ExerciseSubmission.student_id == (student.id if student else None),
            ExerciseSubmission.status.in_(
                [
                    TaskStatus.queued,
                    TaskStatus.executing,
                    TaskStatus.executed,
                ]
            ),
        )
    ).first():
        raise APIException(
            message="ExerciseSubmission for student or group already in queue.",
            error_code=APIErrorCodes.TASK_ALREADY_IN_QUEUE,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # create the submission
    submission = ExerciseSubmission(
        student_id=student.id if student else None,
        group_id=group.id if group else None,
        exercise_id=excercise.id,
        status=TaskStatus.queued,
        entry_file_path=str(submission_data.entry_file_path),
    )

    # send execercise submission into queue to be executed
    celery_result = program_execution_queue.apply_async(
        countdown=5,
        kwargs={'submission_id': submission.id},
    )

    if celery_result:
        submission.celery_task_id = celery_result.id

    db_session.add(submission)
    db_session.commit()
    db_session.refresh(submission)


    return submission


def get_exercise_submission_by_id_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session: Annotated[WorkflowSession, Depends(get_session_by_id_service)],
    user: Annotated[Student | Admin, Depends(require_admin_or_student)],
    submission_id: Annotated[UUID, Path()],
) -> ExerciseSubmission:
    """Get an exercise submission by its ID."""

    user_args = []

    if isinstance(user, Student):
        user_args.append(col(ExerciseSubmission.student_id) == user.id)
    elif isinstance(user, Admin):
        user_args.append(col(WorkflowSession.admin_id) == user.id)

    submission = db_session.exec(
        select(ExerciseSubmission)
        .join(Exercise, ExerciseSubmission.exercise_id == Exercise.id)
        .join(WorkflowSession, Exercise.session_id == WorkflowSession.id)
        .where(
            ExerciseSubmission.id == submission_id,
            col(WorkflowSession.id) == session.id,
            *user_args,
        )
    ).first()

    if not submission:
        raise APIException(
            message="Submission not found.",
            error_code=APIErrorCodes.NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return submission


def cancle_queued_exercise_submission_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session: Annotated[WorkflowSession, Depends(get_session_by_id_service)],
    submission: Annotated[ExerciseSubmission, Depends(get_exercise_submission_by_id_service)],
    user: Annotated[Student | Admin, Depends(require_admin_or_student)],
) -> ExerciseSubmission:
    """Cancel a queued exercise submission."""

    if (
        isinstance(user, Student) 
        and submission.student_id is not None 
        and submission.student_id != user.id
    ):
        raise APIException(
            message="Submission not found.",
            error_code=APIErrorCodes.NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
        )

    # check that the student is the group leader
    if isinstance(user, Student) and submission.group_id is not None:
        student_enrollment = db_session.exec(
            select(SessionEnrollment)
            .where(
                SessionEnrollment.student_id == user.id,
                SessionEnrollment.session_id == session.id,
                SessionEnrollment.group_id == submission.group_id,
            )
        ).first()

        # i.e student is not part of the group
        if student_enrollment is None:
            raise APIException(
                message="Submission not found.",
                error_code=APIErrorCodes.NOT_FOUND,
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # i.e student is not the group leader
        if not student_enrollment.is_group_leader:
            raise APIException(
                message="You are not allowed to cancel this submission. You are not the group leader.",
                error_code=APIErrorCodes.FORBIDDEN,
                status_code=status.HTTP_403_FORBIDDEN,
            )

    submission.status = TaskStatus.cancelled
    db_session.add(submission)
    db_session.commit()

    # attempt to cancel the submission celery process if it exists
    celery_result = program_execution_queue.AsyncResult(submission.celery_task_id)
    if celery_result:
        celery_result.revoke(terminate=True)

    return submission
