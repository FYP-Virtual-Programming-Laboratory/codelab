from enum import StrEnum


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

    unavailable = "unavailable"
    failed = "failed"
