import csv
import secrets
from datetime import timedelta
from typing import Annotated
from uuid import UUID
from fastapi import Depends, Body, File, Path, UploadFile, status
from src.core.dependecies import require_db_session, require_admin
from sqlmodel import Session, select
from src.core.exceptions import APIException
from src.core.schemas import APIErrorCodes
from pydantic import EmailStr, ValidationError
from src.core.config import settings
from src.models import (
    Admin,
    SessionEnrollment, 
    Student,
    Exercise, 
    ExerciseEvaluationFlag, 
    LanguageImage, 
    Session as WorkflowSession, 
    SessionReasourceConfig, 
    TestCase,
)
from src.schemas import (
    ImageStatus, 
    SessionEnrollmentMethod, 
    SessionInitializationStage, 
    SessionStatus,
)
from src.session.schemas import (
    SessionCollaborationSchema,
    SessionContentConfigurationSchema, 
    SessionCreationDetailSchema, 
    SessionCreationSchema,
    SessionEnrollmentSchema, 
    SessionInitializationSchema,
    SessionResourceConfigurationSchema,
)


# ------------------------------------------------------------
# session initialization stages progress thus:
#  1. session creation
#  2. content configuration
#  3. resource configuration
#  4. collaboration configuration
#  5. enrollment configuration
# ------------------------------------------------------------


def get_session_by_id_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session_id: Annotated[UUID, Path()],
) -> WorkflowSession:
    """Get a session by its id."""
    session = db_session.get(WorkflowSession, session_id)

    if not session:
        raise APIException(
            status_code=status.HTTP_404_NOT_FOUND,
            message="Session not found",
            error_code=APIErrorCodes.NOT_FOUND,
        )
    return session


def get_session_in_creation_state_service(
    admin: Annotated[Admin, Depends(require_admin)],
    session: Annotated[WorkflowSession, Depends(get_session_by_id_service)],
) -> WorkflowSession:
    """Get the current state of the session creation process."""

    # check that session is in creating status
    if session.status != SessionStatus.creating:
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Session is not in creation state.",
            error_code=APIErrorCodes.BAD_REQUEST,
        )

    if session.admin_id != admin.id:
        raise APIException(
            status_code=status.HTTP_403_FORBIDDEN,
            message="You are not authorized to access this resource.",
            error_code=APIErrorCodes.FORBIDDEN,
        )

    return session


def initialize_session_state_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    session_data: Annotated[SessionInitializationSchema, Body()],
) -> SessionCreationSchema:
    """Initialize the creation of a new session."""

    # check that language image exists and is available
    language_image = db_session.get(
        LanguageImage, 
        session_data.language_image_id,
    )

    if not language_image:
        raise APIException(
            status_code=status.HTTP_404_NOT_FOUND,
            message="Language image not found",
            error_code=APIErrorCodes.NOT_FOUND,
        )

    if language_image.status != ImageStatus.available:
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Language image is not available. Please rebuild the image first and try again.",
            error_code=APIErrorCodes.BAD_REQUEST,
        )

    session = Session(
        admin_id=admin.id,
        title=session_data.title,
        description=session_data.description,
        language_image_id=session_data.language_image_id,
        start_time=session_data.session_start_time,
        end_time=(
            session_data.session_end_time 
            if session_data.session_end_time else
            session_data.session_start_time + timedelta(hours=session_data.session_duration)
        ),
        initialization_state="",
    )

    db_session.add(session)
    db_session.commit()

    return SessionCreationSchema(
        stage=SessionInitializationStage.content_configuration,
        session_details=SessionCreationDetailSchema.model_validate(session)
    )


def configure_session_content_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    session: Annotated[WorkflowSession, Depends(get_session_in_creation_state_service)],
    session_data: Annotated[SessionContentConfigurationSchema, Body()],
) -> SessionCreationSchema:
    """Configure the content of the session."""
    
    # before adding new content delete existing content
    # This is to avoid having dublicate content and it allows the user the
    # optiion of going back and editing the content.

    db_session.exec(
        select(ExerciseEvaluationFlag).where(ExerciseEvaluationFlag.exercise_id.in_(
            select(Exercise.id).where(Exercise.session_id == session.id)
        ))
    ).delete()
    db_session.exec(
        select(Exercise).where(Exercise.session_id == session.id)
    ).delete()
    db_session.exec(
        select(TestCase).where(TestCase.exercise_id.in_(
            select(Exercise.id).where(Exercise.session_id == session.id)
        ))
    ).delete()

    # create exercises, evaluation flags and test cases
    exercises_to_create = []
    evaluation_flags_to_create = []
    test_cases_to_create = []

    for exercise_data in session_data.exercises:
        exercise = Exercise(
            session_id=session.id,
            question=exercise_data.question,
            instructions=exercise_data.instructions,
            score_percentage=exercise_data.score_percentage,
        )
        exercises_to_create.append(exercise)

        for test_case_data in exercise_data.test_cases:
            test_case = TestCase(
                exercise_id=exercise.id,
                title=test_case_data.title,
                visible=test_case_data.visible,
                test_input=test_case_data.test_input,
                expected_output=test_case_data.expected_output,
                score_percentage=test_case_data.score_percentage,
            )
            test_cases_to_create.append(test_case)

        for evaluation_flag_data in exercise_data.evaluation_flags:
            evaluation_flag = ExerciseEvaluationFlag(
                exercise_id=exercise.id,
                flag=evaluation_flag_data.flag,
                visible=evaluation_flag_data.visible,
                score_percentage=evaluation_flag_data.score_percentage,
            )
            evaluation_flags_to_create.append(evaluation_flag)

    # commit the changes
    db_session.add_all(exercises_to_create)
    db_session.add_all(test_cases_to_create)
    db_session.add_all(evaluation_flags_to_create)

    # update session initialization stage
    session.initialization_stage = SessionInitializationStage.resource_configuration
    db_session.add(session)
    db_session.commit()

    return SessionCreationSchema(
        stage=session.initialization_stage,
        session_details=SessionCreationDetailSchema.model_validate(session)
    )


def configure_session_resource_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    session: Annotated[WorkflowSession, Depends(get_session_in_creation_state_service)],
    session_data: Annotated[SessionResourceConfigurationSchema, Body()],
) -> SessionCreationSchema:
    """Configure the resource of the session."""
    
    # delete previous reasource configuration
    db_session.exec(
        select(SessionReasourceConfig).where(SessionReasourceConfig.session_id == session.id)
    ).delete()

    # create new reasource configuration
    reasource_configuration = SessionReasourceConfig(
        session_id=session.id,
        **session_data.model_dump(),
    )

    # update session initialization stage
    session.initialization_stage = SessionInitializationStage.collaboration_configuration
    db_session.add(session)
    db_session.commit()

    return SessionCreationSchema(
        stage=session.initialization_stage,
        session_details=SessionCreationDetailSchema.model_validate(session)
    )


def configure_session_collaboration_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    session: Annotated[WorkflowSession, Depends(get_session_in_creation_state_service)],
    session_data: Annotated[SessionCollaborationSchema, Body()],
) -> SessionCreationSchema:
    """Configure the collaboration of the session."""

    session.sqlmodel_update(**session_data.model_dump())

    # update session initialization stage
    session.initialization_stage = SessionInitializationStage.enrollment_configuration
    db_session.add(session)
    db_session.commit()

    return SessionCreationSchema(
        stage=session.initialization_stage,
        session_details=SessionCreationDetailSchema.model_validate(session)
    )


def _extract_enrollment_data_from_csv(
    csv_file: UploadFile,
) -> list[EmailStr]:
    """Extract the enrollment data from the CSV file.

    Validates that the CSV has a header 'email' and each row contains a valid email.
    """

    csv_file.file.seek(0)
    csv_reader = csv.DictReader(csv_file.file)
    if 'email' not in csv_reader.fieldnames:
        raise ValueError("CSV file must contain a header named 'email'.")

    enrollment_data = []
    for i, row in enumerate(csv_reader, start=1):  # start=1 to account for header row
        email = row.get('email', '').strip()
        if not email:
            raise ValueError(f"Missing email in row {i}.")
        try:
            validated_email = EmailStr(email)
        except ValidationError:
            raise ValueError(f"Invalid email '{email}' in row {i}.")
        enrollment_data.append(validated_email)

    return enrollment_data


def configure_session_enrollment_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    session: Annotated[WorkflowSession, Depends(get_session_in_creation_state_service)],
    session_data: Annotated[SessionEnrollmentSchema, Body()],
    csv_file: Annotated[
        UploadFile | None, 
        File(description="The CSV file containing the enrollment data.",),
    ],
) -> SessionCreationSchema:
    """Configure the enrollment of the session."""

    if session_data.enrollment_method == SessionEnrollmentMethod.bulk_upload:
        if csv_file is None:
            raise APIException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="CSV file is required when enrollment method is bulk upload.",
                error_code=APIErrorCodes.INVALID_ENROLLMENT_DATA,
            )

        try:
            # extract the enrollment data from the csv file
            enrollment_data = _extract_enrollment_data_from_csv(csv_file)
        except ValueError as error:
            raise APIException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Invalid enrollment data. Ensure csv matches the required format.",
                error_code=APIErrorCodes.INVALID_ENROLLMENT_DATA,
                detail={"reason": str(error)},
            ) from error

        # create student and session enrollment records from each email
        for email in set(enrollment_data):
            # first check if student already exists
            student = db_session.exec(
                select(Student).where(Student.email == email)
            ).first()

            if not student:
                # create new student
                student = Student(email=email)
                db_session.add(student)

            # create session enrollment record
            session_enrollment = SessionEnrollment(
                session_id=session.id,
                student_id=student.id,
            )
            db_session.add(session_enrollment)

    if session_data.manual_invite_emails:
        for email in set(session_data.manual_invite_emails):
            # first check if student already exists
            student = db_session.exec(
                select(Student).where(Student.email == email)
            ).first()

            if not student:
                # create new student
                student = Student(email=email)
                db_session.add(student)

            # create session enrollment record
            session_enrollment = SessionEnrollment(
                session_id=session.id,
                student_id=student.id,
            )
            db_session.add(session_enrollment)

    # update session initialization stage and enrollment id
    session.enrollment_id = secrets.token_urlsafe(10)
    session.initialization_stage = SessionInitializationStage.confirmation
    db_session.add(session)
    db_session.commit()

    return SessionCreationSchema(
        stage=session.initialization_stage,
        session_details=SessionCreationDetailSchema.model_validate(session)
    )


def confirm_session_creation_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    session: Annotated[WorkflowSession, Depends(get_session_in_creation_state_service)],
) -> WorkflowSession:
    """Confirm the creation of the session."""
    
    # check that session is in confirmation stage
    if session.initialization_stage != SessionInitializationStage.confirmation:
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Session is not in confirmation stage.",
            error_code=APIErrorCodes.BAD_REQUEST,
        )
    
    # mark session as created
    session.status = SessionStatus.created
    db_session.add(session)
    db_session.commit()

    # TODO: Trigger session created lifecycle event, here to notify other VPL services
    return session
