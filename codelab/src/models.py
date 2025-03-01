from __future__ import annotations

import uuid
from datetime import datetime

from sqlmodel import (
    JSON,
    TIMESTAMP,
    Column,
    Field,
    SQLModel,
    func,
)

from src.schemas import ImageStatus


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

    build_logs: JSON | None = Field(default=None, sa_column=Column(JSON))
    push_logs: JSON | None = Field(default=None, sa_column=Column(JSON))

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

    class Config:
        arbitrary_types_allowed = True
