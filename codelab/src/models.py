import uuid
from datetime import datetime

from pydantic import EmailStr, JsonValue, PositiveFloat, PositiveInt
from sqlmodel import (
    JSON,
    TIMESTAMP,
    Column,
    Field,
    Relationship,
    SQLModel,
    UniqueConstraint,
    func,
    Text,
)

from src.schemas import (
    DatabaseExecutionResult,
    EvaluationFlag,
    ImageStatus,
    SessionEnrollmentMethod,
    SessionInitializationStage,
    TaskStatus,
    SessionStatus,
)


class BaseModel(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    created_at: datetime = Field(
        nullable=False,
        # SQLModel does not have an overload for this but it'll work in SQLAlchemy
        sa_type=TIMESTAMP(),  # type: ignore
        sa_column_kwargs={"server_default": func.now()},
    )

    updated_at: datetime | None = Field(
        default=None,
        nullable=True,
        # SQLModel does not have an overload for this but it'll work in SQLAlchemy
        sa_type=TIMESTAMP(),  # type: ignore
        sa_column_kwargs={"onupdate": func.now()},
    )


class LanguageImage(BaseModel, table=True):
    """This model represents a language image on the system."""

    name: str
    version: str
    description: str
    base_image: str
    docker_image_id: str | None
    status: ImageStatus

    created_by_id: uuid.UUID | None = Field(foreign_key="admin.id", nullable=True)
    created_by: 'Admin' = Relationship(sa_relationship_kwargs={"lazy": "select"})

    build_logs: JsonValue | None = Field(default=None, sa_column=Column(JSON))
    push_logs: JsonValue | None = Field(default=None, sa_column=Column(JSON))

    failure_message: str | None = Field(
        description="Error message if the image build or push failed.",
        nullable=True,
    )

    test_build: bool
    file_extension: str = Field(
        description="Extension of files to be executed on this container.",
    )
    build_test_file_content: str | None = Field(
        max_length=5000,
        description=(
            "Content of the test file. If provided, the file will be"
            "uploaded and used to test the language build."
        ),
        nullable=True,
    )
    build_test_std_in: str | None = Field(
        description=(
            "Standard input for the build test file. "
            "If provided, it will be used as the standard input while testing the image build."
        ),
        nullable=True,
    )
    build_test_std_out: str | None = Field(
        description="Standard output from build test",
        nullable=True,
    )

    requires_compilation: bool = Field(
        description=(
            "Whether this language image requires compilation before running"
            "programs. If True, submitted programs will be compiled first before execution."
        ),
        default=False,
    )
    compile_file_extension: str | None = Field(
        description="Extension of compiled files to be executed.",
        nullable=True,
    )
    compilation_command: str | None = Field(
        description=(
            "Command used to compile programs that will be ran on this container."
            "This command is used in absence of compilation commands supplied when"
            "Requesting a program compilation"
            "Example `gcc '<filename.c>' -o '<output_filename>'`"
            "Note it must match this structuring."
        ),
        nullable=True,
    )

    default_execution_command: str = Field(
        description=(
            "Command used to execute programs that will be ran on this container."
            "This command is used in absence of execution commands suppplied when"
            "Requesting a program execution"
            "Example `python '<filename.py>'`"
            "Note it must match this structture."
        ),
    )

    entrypoint_script: str | None = Field(
        max_length=5000,
        description=(
            "A `sh` script to run when creating containers from this image"
            "Script may include installing required package and dependencies."
        ),
        nullable=True,
    )

    image_size: str | None
    image_architecture: str | None

    class Config:
        arbitrary_types_allowed = True


class Admin(BaseModel, table=True):
    """This model represents a VPL admin."""

    first_name: str
    last_name: str
    password: str
    is_active: bool = Field(default=True)
    last_login: datetime | None = Field(default=None)

    is_super_admin: bool = Field(
        default=False, 
        description="Whether the admin is a super admin i.e the first admin and can create other admins.",
    )
    created_by_id: uuid.UUID | None = Field(foreign_key="admin.id", nullable=True)
    created_by: 'Admin' = Relationship(sa_relationship_kwargs={"lazy": "select"})


class Student(BaseModel, table=True):
    """This model represents a student."""
    docker_container_id: str | None = Field(default=None)
    
    first_name: str | None = Field(default=None)
    last_name: str | None = Field(default=None)
    matric_number: str | None = Field(default=None)
    email: EmailStr

    group_id: uuid.UUID | None = Field(foreign_key="group.id", nullable=True)
    group: 'Group' = Relationship(sa_relationship_kwargs={"lazy": "select"})


class SessionEnrollment(BaseModel, table=True):
    """This model represents a VPL session enrollment."""
    
    session_id: uuid.UUID = Field(foreign_key="session.id")
    session: 'Session' = Relationship(sa_relationship_kwargs={"lazy": "select"})

    email: EmailStr = Field(description="The email of the enrollment.", nullable=True)
    student_id: uuid.UUID | None = Field(
        foreign_key="student.id", 
        nullable=True, 
        default=None,
        description="The student ID of the enrollment.",
    )
    student: Student = Relationship(sa_relationship_kwargs={"lazy": "select"})

    group_id: uuid.UUID | None = Field(
        foreign_key="group.id", 
        nullable=True, 
        default=None,
        description="The group ID to add the student too.",
    )
    group: 'Group' = Relationship(sa_relationship_kwargs={"lazy": "select"})
    is_group_leader: bool = Field(
        default=False, 
        description="Whether the student is the group leader.",
    )


class Session(BaseModel, table=True):
    """This model represents a VPL session."""
    
    admin_id: uuid.UUID = Field(foreign_key="admin.id")
    admin: Admin = Relationship(sa_relationship_kwargs={"lazy": "select"})
    status: SessionStatus = Field(default=SessionStatus.creating, sa_column=Column(type_=Text()))
    initialization_stage: SessionInitializationStage = Field(sa_column=Column(type_=Text()))

    # session metadata
    title: str = Field(description="The title of the session.")
    description: str = Field(description="The description of the session.")

    # session duration
    duration: PositiveInt = Field(default=3, description="The duration of the session in hours.")
    start_time: datetime | None = Field(default=None, description="The time the session should start.")
    end_time: datetime | None = Field(default=None, description="The time the session should end.")    

    # session status
    status: SessionStatus = Field(default=SessionStatus.creating, sa_column=Column(type_=Text()))

    # collaboration settings
    collaboration_enabled: bool = Field(default=False, description="Whether collaboration is enabled for the session.")
    collaboration_group_size: PositiveInt = Field(default=3, description="The size of the collaboration group.")
    # TODO: update this so admin can add students to groups manually when set to False
    collaboration_group_open: bool = Field(
        default=False, 
        description=(
            "Whether the collaboration group is open for students to join "
            "i.e if True, students can join the group by themselves"
            "and if False, the system will add the student to random groups."
        ),
    )

    # enrollment settings
    enrollment_method: SessionEnrollmentMethod = Field(
        default=SessionEnrollmentMethod.link,
        description="The method of enrollment for the session.",
        sa_column=Column(type_=Text()),
    )
    enrollment_link_ttl: PositiveInt = Field(default=30, description="The time to live of the enrollment link in minutes.")
    enrollment_id: str | None = Field(
        default=None, 
        description="The enrollment ID of the session.",
        nullable=True,
        index=True,
    )

    # resource configuration
    language_image_id: uuid.UUID = Field(foreign_key="languageimage.id")
    language_image: LanguageImage = Relationship(sa_relationship_kwargs={"lazy": "select"})
    configuration: 'SessionReasourceConfig' = Relationship(back_populates="session", sa_relationship_kwargs={"lazy": "select"})


class SessionReasourceConfig(BaseModel, table=True):
    """This model represents a VPL session configuration."""

    session_id: uuid.UUID = Field(foreign_key="session.id")
    session: Session = Relationship(
        sa_relationship_kwargs={"lazy": "select"},
    )

    max_queue_size: PositiveInt = Field(
        default=15,
        description="The maximum number of tasks allowed for a students to submit at a time.",
    )

    max_number_of_runs: PositiveInt = Field(
        default=10,
        description="The maximum number of tasks allowed for a students to run in a session.",
    )

    wall_time_limit: PositiveInt = Field(
        default=10,
        description="The maximum number of seconds allowed for a student to run a program.",
    )

    cpu_time_limit: PositiveInt = Field(
        default=10,
        description="The maximum number of CPU seconds allowed for a student to run a program.",
    )

    memory_limit: PositiveInt = Field(
        default=1024 * 1024 * 10,  # 10MB
        description="The maximum number of KB allowed for a student to use for their program.",
    )

    max_processes_and_or_threads: PositiveInt = Field(
        default=10,
        description="The maximum number of processes or threads allowed for a student program to create.",
    )

    enable_network: bool = Field(
        default=False,
        description="Whether to allow network access for a student program.",
    )


class Group(BaseModel, table=True):
    """This model represents a VPL student group. i.e group of student working together on a submission."""

    docker_container_id: str | None = Field(default=None)

    session_id: uuid.UUID = Field(foreign_key="session.id")
    session: Session = Relationship(sa_relationship_kwargs={"lazy": "select"})

    # group metadata
    name: str = Field(max_length=100, nullable=False)


class Exercise(BaseModel, table=True):
    session_id: uuid.UUID = Field(foreign_key="session.id")
    session: Session = Relationship(sa_relationship_kwargs={"lazy": "select"})

    # exercise metadata
    question: str = Field(max_length=10000, nullable=False)
    instructions: str | None = Field(max_length=10000, nullable=True)
    score_percentage: PositiveFloat = Field(
        description="The score percentage of the exercise in the total session score.",
    )

    # exercise settings
    evaluation_flags: list['ExerciseEvaluationFlag'] = Relationship(
        back_populates='exercise',
        sa_relationship_kwargs={"lazy": "select"},
    )

    # exercise test cases
    test_cases: list['TestCase'] = Relationship(
        back_populates='exercise',
        sa_relationship_kwargs={"lazy": "select"},
    )


class TestCase(BaseModel, table=True):
    """
    This model represents a VPL exercise test case.

    A test case is a set of input and expected output.
    It is used to test the student's solution.

    A test case can be visible or hidden to the student.
    If it is visible, the student can see the test case and its expected output.
    """

    exercise_id: uuid.UUID = Field(foreign_key="exercise.id")
    exercise: Exercise = Relationship(
        back_populates='test_cases',
        sa_relationship_kwargs={"lazy": "select"},
    )

    title: str
    visible: bool = Field(
        default=True, 
        description="Whether the test case is visible to the student.",
    )

    test_input: str
    expected_output: str
    score_percentage: PositiveFloat = Field(
        description="The score percentage of the test case in the total score.",
    )


class ExerciseEvaluationFlag(BaseModel, table=True):
    """
    This model represents a VPL exercise evaluation flag.
    
    An evaluation flag represents a category of evaluation.
    It is used to evaluate the student's solution.

    For example, an successful execution can be an evaluation flag.
    Some evaluation flags are scored by the system i.e (successful execution / compilation) 
    while other are scored by AI (code quality).
    """

    exercise_id: uuid.UUID = Field(foreign_key="exercise.id")
    exercise: 'Exercise' = Relationship(sa_relationship_kwargs={"lazy": "select"})

    flag: EvaluationFlag | str = Field(
        description="The evaluation flag for the exercise.",
        sa_column=Column(type_=Text()),
    )
    visible: bool = Field(
        default=True, 
        description="Whether the evaluation flag is visible to the student.",
    )
    score_percentage: PositiveFloat = Field(
        description="The score percentage of the evaluation flag in the total score.",
    )


class Task(BaseModel, table=True):
    """
    This model represents a VPL student / group task i.e student's submission.
    A task is a submission from the student / group before they make a final submission for grading.
    """

    celery_task_id: str | None = Field(default=None)
    entry_file_path: str = Field(description="The entry file of the submitted program.")

    exercise_id: uuid.UUID = Field(foreign_key="exercise.id")
    exercise: Exercise = Relationship(sa_relationship_kwargs={"lazy": "select"})

    student_id: uuid.UUID | None = Field(foreign_key="student.id")
    student: Student = Relationship(sa_relationship_kwargs={"lazy": "select"})

    group_id: uuid.UUID | None = Field(foreign_key="group.id")
    group: Group = Relationship(sa_relationship_kwargs={"lazy": "select"})

    execution_logs: list[JsonValue] = Field(default_factory=list, sa_column=Column(JSON))

    status: TaskStatus = Field(default=TaskStatus.queued)
    results: list[DatabaseExecutionResult] | None = Field(
        default=None, sa_column=Column(JSON)
    )

    class Config:
        arbitrary_types_allowed = True


class ExerciseSubmission(BaseModel, table=True):
    """
    This model represents a VPL student / group execercise submission.
    """

    celery_task_id: str | None = Field(default=None)

    entry_file_path: str = Field(
        description="The filename of the submitted program.",
    )

    exercise_id: uuid.UUID = Field(foreign_key="exercise.id")
    exercise: Exercise = Relationship(sa_relationship_kwargs={"lazy": "select"})

    student_id: uuid.UUID | None = Field(foreign_key="student.id")
    student: Student = Relationship(sa_relationship_kwargs={"lazy": "select"})

    group_id: uuid.UUID | None = Field(foreign_key="group.id")
    group: Group = Relationship(sa_relationship_kwargs={"lazy": "select"})

    # grading results
    graded: bool = Field(default=False, description="Whether the submission has been graded.")
    total_score: PositiveFloat | None = Field(default=None, description="The total score of the submission.")
    auto_generated_feedback: str | None = Field(
        max_length=5000, 
        nullable=True, 
        description="The auto generated feedback added by AI to the submission.",
    )
    manual_feedback: str | None = Field(
        max_length=5000, 
        nullable=True, 
        description="The manual feedback added by the admin to the submission.",
    )

    # task status
    status: TaskStatus = Field(
        default=TaskStatus.queued,
        sa_column=Column(type_=Text()),
        description="The status of the submission.",
    )

    # test case results
    test_case_results: list['TestCaseResult'] = Relationship(
        back_populates='submission',
        sa_relationship_kwargs={"lazy": "select"},
    )

    # evaluation flag results
    evaluation_flag_results: list['EvaluationFlagResult'] = Relationship(
        back_populates='submission',
        sa_relationship_kwargs={"lazy": "select"},
    )


class TestCaseResult(BaseModel, table=True):
    """
    This model represents a VPL student / group test case result.
    """

    submission_id: uuid.UUID = Field(foreign_key="exercisesubmission.id")
    submission: ExerciseSubmission = Relationship(
        back_populates='test_case_results',
        sa_relationship_kwargs={"lazy": "select"},
    )

    test_case_id: uuid.UUID = Field(foreign_key="testcase.id")
    test_case: TestCase = Relationship(sa_relationship_kwargs={"lazy": "select"})

    passed: bool
    execution_result: DatabaseExecutionResult = Field(
        sa_column=Column(JSON),
        description="The execution result of the test case.",
    )
    adjusted: bool = Field(
        default=False,
        description="Whether the score has been adjusted by the admin.",
    )

    auto_generated_feedback: str | None = Field(
        max_length=5000, 
        nullable=True, 
        description="The auto generated feedback added by AI to the test case.",
    )
    manual_feedback: str | None = Field(
        max_length=5000, 
        nullable=True, 
        description="The manual feedback added by the admin to the test case.",
    )

    class Config:
        arbitrary_types_allowed = True


class EvaluationFlagResult(BaseModel, table=True):
    """
    This model represents a VPL student / group evaluation flag result.
    """

    submission_id: uuid.UUID = Field(foreign_key="exercisesubmission.id")
    submission: ExerciseSubmission = Relationship(
        back_populates='evaluation_flag_results',
        sa_relationship_kwargs={"lazy": "select"}
    )
    
    evaluation_flag_id: uuid.UUID = Field(foreign_key="evaluationflag.id")
    evaluation_flag: EvaluationFlag = Relationship(sa_relationship_kwargs={"lazy": "select"})
    
    passed: bool
    score: PositiveFloat | None = Field(default=None)
    adjusted: bool = Field(
        default=False,
        description="Whether the score has been adjusted by the admin.",
    )

