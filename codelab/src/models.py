import uuid
from datetime import datetime

from pydantic import JsonValue, PositiveInt
from sqlmodel import (
    JSON,
    TIMESTAMP,
    Column,
    Field,
    Relationship,
    SQLModel,
    UniqueConstraint,
    func,
)

from src.schemas import (
    DatabaseExecutionResult,
    ImageStatus,
    TaskStatus,
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


# VPL MODELs
# the following models are available for integration into the larger VPL system codelab is part of
# ----------------------------------------------------------------
class Session(BaseModel, table=True):
    """This model represents a VPL session."""

    external_id: str = Field(unique=True, index=True)
    is_active: bool

    language_image_id: uuid.UUID = Field(foreign_key="languageimage.id")
    language_image: LanguageImage = Relationship(
        sa_relationship_kwargs={"lazy": "select"}
    )
    configuration: 'SessionConfig' = Relationship(
        back_populates="session", sa_relationship_kwargs={"lazy": "select"}
    )


class SessionConfig(BaseModel, table=True):
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


class User(BaseModel, table=True):
    """This model represents a VPL user i.e student."""

    __table_args__ = (
        UniqueConstraint(
            "session_id",
            "external_id",
            name="session_id_unique_together_with_external_id",
        ),
    )
    external_id: str = Field(index=True)
    docker_container_id: str | None = Field(default=None)

    session_id: uuid.UUID = Field(foreign_key="session.id")
    session: Session = Relationship(sa_relationship_kwargs={"lazy": "select"})

    group_id: uuid.UUID | None = Field(foreign_key="group.id", nullable=True)
    group: 'Group' = Relationship(sa_relationship_kwargs={"lazy": "select"})


class Group(BaseModel, table=True):
    """This model represents a VPL user group. i.e group of student working together on a submission."""

    __table_args__ = (
        UniqueConstraint(
            "session_id",
            "external_id",
            name="session_id_unique_together_with_external_id",
        ),
    )

    external_id: str = Field(index=True)
    docker_container_id: str | None = Field(default=None)

    session_id: uuid.UUID = Field(foreign_key="session.id")
    session: Session = Relationship(sa_relationship_kwargs={"lazy": "select"})


class Exercise(BaseModel, table=True):
    __table_args__ = (
        UniqueConstraint(
            "session_id",
            "external_id",
            name="session_id_unique_together_with_external_id",
        ),
    )

    external_id: str = Field(index=True)
    session_id: uuid.UUID = Field(foreign_key="session.id")
    session: Session = Relationship(sa_relationship_kwargs={"lazy": "select"})
    test_cases: list['TestCase'] = Relationship(
        back_populates='exercise',
        sa_relationship_kwargs={"lazy": "select"},
    )


class TestCase(BaseModel, table=True):
    __table_args__ = (
        UniqueConstraint(
            "exercise_id",
            "external_id",
            name="exercise_id_unique_together_with_external_id",
        ),
    )

    external_id: str = Field(index=True)
    exercise_id: uuid.UUID = Field(foreign_key="exercise.id")
    exercise: Exercise = Relationship(
        back_populates='test_cases',
        sa_relationship_kwargs={"lazy": "select"},
    )
    test_input: str
    visible: bool


class Tasks(BaseModel, table=True):
    """
    This model represents a VPL user / group tasks i.e student's submission.

    This does not represent a submission from the grading service i.e(code-grade).
    Rather it represents a submission from the student before they
    make a final submission to the grading service.
    """

    celery_task_id: str | None = Field(default=None)
    entry_file_path: str = Field(description="The entry file of the submitted program.")

    exercise_id: uuid.UUID = Field(foreign_key="exercise.id")
    exercise: Exercise = Relationship(sa_relationship_kwargs={"lazy": "select"})

    user_id: uuid.UUID | None = Field(foreign_key="user.id")
    user: User = Relationship(sa_relationship_kwargs={"lazy": "select"})

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
    This model represents a VPL user / group execercise submission.

    This represents a request from the grading service to execute
    an excercise submission with all its assciated test cases.
    """

    entry_file_path: str = Field(
        description="The filename of the submitted program.",
    )

    exercise_id: uuid.UUID = Field(foreign_key="exercise.id")
    exercise: Exercise = Relationship(sa_relationship_kwargs={"lazy": "select"})

    user_id: uuid.UUID | None = Field(foreign_key="user.id")
    user: User = Relationship(sa_relationship_kwargs={"lazy": "select"})

    group_id: uuid.UUID | None = Field(foreign_key="group.id")
    group: Group = Relationship(sa_relationship_kwargs={"lazy": "select"})

    execution_logs: list[JsonValue] = Field(default_factory=list, sa_column=Column(JSON))

    status: TaskStatus = Field(default=TaskStatus.queued)
    results: list[DatabaseExecutionResult] | None = Field(
        default=None, sa_column=Column(JSON)
    )

    class Config:
        arbitrary_types_allowed = True
