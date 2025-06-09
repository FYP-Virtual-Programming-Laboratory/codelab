from enum import StrEnum


class APIErrorCodes(StrEnum):
    """
    API error codes.

    Attributes: \n
        UNAUTHORIZED: The user is not authorized to access the resource. \n
        AUTHENTICATION_FAILED: The user authentication failed. Reason will be in the detail. \n
        FORBIDDEN: The user is not allowed to access the resource. \n

        UNAUTHORIZED_SERVICE: The VPL service is not authorized to perform this action. \n
        SERVICE_FORBIDDEN: The VPL service is not allowed to perform this action. \n
        SERVICE_AUTHENTICATION_FAILED: The VPL service authentication failed. Reason will be in the detail. \n

        LANGUAGE_IMAGE_BUILD_IN_PROGRESS: Unable to trigger language build as a build is in progress. \n

        SESSION_INACTIVE: The session is inactive. \n

        NOT_FOUND: The object was not found. \n
    """

    # User errors
    UNAUTHORIZED = "unauthorized"
    AUTHENTICATION_FAILED = "authentication_failed"
    FORBIDDEN = "forbidden"

    # VPL service errors
    UNAUTHORIZED_SERVICE = "unauthorized_service"
    SERVICE_AUTHENTICATION_FAILED = "service_authentication_failed"
    SERVICE_FORBIDDEN = "service_forbidden"

    # language image errors
    LANGUAGE_IMAGE_BUILD_IN_PROGRESS = "language_image_build_in_progress"

    # session initialization errors
    INVALID_ENROLLMENT_DATA = "invalid_enrollment_data"

    # session errors
    SESSION_INACTIVE = "session_inactive"

    # task errors
    TASK_NOT_IN_QUEUE = "task_not_in_queue"
    TASK_QUEUE_FULL = "task_queue_full"
    TASK_EXECUTION_THRESHOLD_EXCEEDED = "task_execution_threshold_exceeded"
    TASK_ALREADY_IN_QUEUE = "task_already_in_queue"

    # general object errors
    NOT_FOUND = "not_found"
    


