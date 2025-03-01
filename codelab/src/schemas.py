from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


class ImageStatus(StrEnum):
    created = "created"

    building = "building"
    build_succeeded = "build_succeeded"
    build_failed = "build_failed"

    pushing = "pushing"
    push_failed = "push_failed"
    pushed = "pushed"

    pulling = "pulling"
    pull_failed = "pull_failed"
    available = "available"

    testing = "testing"
    testing_failed = "testing_failed"

    scheduled_for_prune = "scheduled_for_prune"
    scheduled_for_rebuild = "scheduled_for_rebuild"
    scheduled_for_deletion = "scheduled_for_deletion"

    unavailable = "unavailable"
    failed = "failed"


class TaskStatus(StrEnum):
    queued = "queued"
    executng = "executing"
    executed = "executed"
    dropped = "dropped"


class TaskExecutionResult(BaseModel):
    std_in: str
    exit_code: int
    expended_time: int
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


class ExecerciseExecutionResult(BaseModel):
    external_test_case_id: str
    expended_time: int
    exit_code: int
    std_in: str
    std_out: str | None = Field(default=None)
    std_err: str | None = Field(default=None)
    state: Literal["success", "failed", "timed_out"]
    failed_compilation: bool | None = Field(default=None)
