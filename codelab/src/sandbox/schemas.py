from datetime import datetime
from typing import Annotated, Any
from uuid import UUID

from pydantic import (
    AfterValidator,
    BaseModel,
    FilePath,
    NewPath,
    JsonValue,
    model_validator,
    field_serializer,
)
from typing_extensions import Self


def _ensure_base_image_is_aphine_based(value: str) -> str:
    """Ensure that the language base image is a alphine based image."""
    if "alpine" not in value:
        raise ValueError("Base image must be a Alpine-based image.")

    return value


def _validate_compilation_command_structure(value: str | None) -> str | None:
    """Validate the structure of compilation command."""

    if value is None:
        return value

    if "<filename>" not in value:
        raise ValueError(
            "Compilation command must contain placeholders for filename and output filename."
            "Example: `gcc '<filename>' -o '<output_filename>'`"
            "OR javac '<filename>"
        )

    return value


def _validate_execution_command_structure(value: str) -> str:
    """Validate the structure of execution command."""

    if value is None:
        return value

    if "<filename>" not in value:
        raise ValueError(
            "Execution command must contain placeholder for filename."
            "Example: `python '<filename>'`"
        )

    return value


class CreateLanguageImageSchema(BaseModel):
    name: str
    version: str
    description: str

    base_image: Annotated[str, AfterValidator(_ensure_base_image_is_aphine_based)]

    test_build: bool
    file_extension: str
    compile_file_extension: str | None = None
    build_test_file_content: str | None = None
    build_test_std_in: str | None = None

    requires_compilation: bool
    compilation_command: Annotated[
        str | None, AfterValidator(_validate_compilation_command_structure)
    ] = None

    default_execution_command: Annotated[
        str, AfterValidator(_validate_execution_command_structure)
    ]
    entrypoint_script: str | None = None

    @model_validator(mode="after")
    def validate_build_test_details(self) -> Self:
        if self.test_build and (not self.build_test_file_content):
            raise ValueError(
                "When test_build is True, build_test_file_content must be provided."
            )

        return self

    @model_validator(mode="after")
    def validate_compilation_details(self) -> Self:
        if self.requires_compilation and (
            not self.compilation_command or not self.compile_file_extension
        ):
            raise ValueError(
                "When requires_compilation is True, compilation_command and compile_file_extension must be provided."
            )

        return self


class UpdateLanguageSchema(BaseModel):
    name: str | None = None
    version: str | None = None
    description: str | None = None
    base_image: str | None = None
    test_build: bool | None = None
    file_extension: str | None = None
    compile_file_extension: str | None = None
    build_test_file_content: str | None = None
    build_test_std_in: str | None = None
    build_test_std_out: str | None = None
    requires_compilation: bool | None = None
    compilation_command: str | None = None
    default_execution_command: str | None = None
    entrypoint_script: str | None = None


class LanguageImagePublicShcema(BaseModel):
    id: UUID
    name: str
    version: str
    status: str
    description: str
    base_image: str
    docker_image_id: str | None
    build_logs: JsonValue | None
    push_logs: JsonValue | None
    failure_message: str | None
    test_build: bool
    file_extension: str
    compile_file_extension: str | None
    build_test_file_content: str | None
    build_test_std_in: str | None
    build_test_std_out: str | None
    requires_compilation: bool
    compilation_command: str | None
    default_execution_command: str
    entrypoint_script: str | None
    image_size: str | None
    image_architecture: str | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        arbitrary_types_allowed = True


class CreateTaskExecutionSchema(BaseModel):
    excercise_id: UUID
    entry_file_path: NewPath


class CreateExcerciseExecutionSchema(BaseModel):
    group_id: UUID | None = None
    excercise_id: UUID
    entry_file_path: NewPath
    

class ExecutionLogSchema(BaseModel):
    timestamp: datetime
    message: str
    
    @field_serializer('timestamp')
    def serialize_timestamp(self, timestamp: datetime, _info: Any) -> str:
        return timestamp.strftime("%Y-%m-%dT%H:%M:%S.%f")
