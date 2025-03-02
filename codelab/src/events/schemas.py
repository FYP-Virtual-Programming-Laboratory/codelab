from typing import Any

from pydantic import BaseModel, Field, PositiveInt, model_validator
from typing_extensions import Self

from src.events.enums import LifeCycleEvent


class TestCaseCreationSchema(BaseModel):
    external_id: str
    test_input: str
    visible: bool


class ExerciseCreationSchema(BaseModel):
    external_id: str
    test_cases: list[TestCaseCreationSchema]


class UserCreationSchema(BaseModel):
    external_id: str


class GroupCreationSchema(BaseModel):
    external_id: str
    students: list[UserCreationSchema] = Field(min_length=1)


class SessionConfigurationCreationSchema(BaseModel):
    max_queue_size: PositiveInt = Field(
        default=15,
        description="The maximum number of tasks allowed for a students to submit at a time.",
    )

    max_number_of_runs: PositiveInt = Field(
        default=10,
        description="The maximum number of tasks allowed for a students to run in a session.",
    )

    wall_time_limit: PositiveInt = Field(
        default=8,
        description="The Upper limt on max  number of seconds allowed for a student to run a program.",
    )

    cpu_time_limit: PositiveInt = Field(
        default=5,
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

    max_file_size: PositiveInt = Field(
        default=1024 * 1024 * 10,  # 10MB
        description="The maximum number of KB allowed for a student to upload for their program.",
    )

    max_stdin_size: PositiveInt = Field(
        default=1024 * 10,  # 10KB
        description="The maximum number of KB allowed for a student to upload as input for their program.",
    )

    enable_network: bool = Field(
        default=False,
        description="Whether to allow network access for a student program.",
    )


class SessionCreationEventData(BaseModel):
    exercises: list[ExerciseCreationSchema] = Field(min_length=1)
    groups: list[GroupCreationSchema] | None = None
    students: list[UserCreationSchema] | None = None
    session_config: SessionConfigurationCreationSchema | None = None
    language_image_id: str

    @model_validator(mode="after")
    def check_students_or_groups_set(self) -> Self:
        """Check that at least one of students or groups is set."""
        if not self.students and not self.groups:
            raise ValueError("At least one of students or groups must be set.")

        if self.students and self.groups:
            raise ValueError("Only one of students or groups can be set.")

        return self


class UserJoinEventData(BaseModel):
    user_external_id: str


class LifeCycleEventData(BaseModel):
    event: LifeCycleEvent
    external_session_id: str
    event_data: SessionCreationEventData | UserJoinEventData | dict[
        str, Any
    ] | None = Field(default=None)

    @model_validator(mode="after")
    def validate_event_data(self) -> Self:
        """Validate the event data based on the event type."""
        if self.event == LifeCycleEvent.SESSION_CREATED:
            if not isinstance(self.event_data, SessionCreationEventData):
                raise ValueError(
                    "Event data must be of type SessionCreationEventData for SESSION_CREATED."
                )

        if self.event == LifeCycleEvent.USER_JOIN:
            if not isinstance(self.event_data, UserJoinEventData):
                raise ValueError(
                    "Event data must be of type UserJoinEventData for USER_JOIN."
                )

        return self
