from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field, PositiveFloat


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
    testcase_external_id: str | None = Field(default=None)
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
