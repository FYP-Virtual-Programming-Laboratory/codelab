from enum import Enum


class LifeCycleEvent(Enum):
    """
    Enum for the different types of events that can be triggered in the system.

    Attributes: \n
        SESSION_CREATED: Event triggered when a session is created.
        SESSION_ENDED: Event triggered when a session is ended.
        INDIVIDUAL_SUBMISSION: Event triggered when an individual submission is made before session ends.
        STUDENT_JOIN: Event triggered when a student joins a session.
    """

    SESSION_CREATED = "session_created"
    STUDENT_JOIN = "student_join"
    INDIVIDUAL_SUBMISSION = "individual_submission"
    SESSION_ENDED = "session_ended"
