
class PullRepositoryException(Exception):
    """Exception for when a repository cannot be pulled."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)
