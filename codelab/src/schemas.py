from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field, PositiveFloat


class SessionStatus(StrEnum):
    creating = "creating"
    created = "created"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


class SessionEnrollmentMethod(StrEnum):
    link = "link"
    bulk_upload = "bulk_upload"
    manual_invite = "manual_invite"


class SessionInitializationStage(StrEnum):
    content_configuration = "content_configuration"
    collaboration_configuration = "collaboration_configuration"
    resource_configuration = "resource_configuration"
    enrollment = "enrollment"
    confirmation = "confirmation"


class ImageStatus(StrEnum):
    created = "created"
    building = "building"
    build_succeeded = "build_succeeded"
    build_failed = "build_failed"
    testing = "testing"
    testing_failed = "testing_failed"
    scheduled_for_prune = "scheduled_for_prune"
    scheduled_for_rebuild = "scheduled_for_rebuild"
    scheduled_for_deletion = "scheduled_for_deletion"
    available = "available"
    unavailable = "unavailable"
    failed = "failed"


class TaskStatus(StrEnum):
    queued = "queued"
    executing = "executing"
    executed = "executed"
    dropped = "dropped"
    cancelled = "cancelled"


class DatabaseExecutionResult(BaseModel):
    test_case_id: str
    std_in: str | None = Field(default=None)
    exit_code: int
    expended_time: PositiveFloat
    std_out: str | None = Field(default=None)
    std_err: str | None = Field(default=None)
    state: Literal[
        "success",
        "failed",
        "timed_out",
        "cancelled",
        "killed",
        "unknown",
    ]
    failed_execution: bool
    failed_compilation: bool | None = Field(default=None)


class EvaluationFlag(StrEnum):
    execution = "execution"
    compilation = "compilation"
    code_quality = "code_quality"
