# from pydantic import BaseModel, BeforeValidator, ValidationError
from typing import Annotated

from pydantic import AfterValidator, BaseModel, model_validator
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
