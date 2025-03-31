from pydantic import BaseModel, Field, PositiveInt, PositiveFloat


class ContainerConfig(BaseModel):
    """Configuration for container resource limits based on ulimits."""

    cpu_time_limit_minutes: PositiveFloat = Field(
        default=5.0,  # 5 minutes
        description="Maximum CPU time in minutes a container can use (ulimit -t cpu).",
    )

    memory_limit_kb: PositiveInt = Field(
        default=1048 * 100,  # 100 MB in KB
        description="Maximum address space limit in KB (ulimit -v as).",
    )

    max_processes: PositiveInt = Field(
        default=50, description="Maximum number of processes/threads (ulimit -u nproc)."
    )

    max_file_size_kb: PositiveInt = Field(
        default=10_240,  # 10 MB in KB
        description="Maximum file size in KB that can be created (ulimit -f fsize).",
    )

    max_open_files: PositiveInt = Field(
        default=1024,
        description="Maximum number of open file descriptors (ulimit -n nofile, soft limit).",
    )

    max_open_files_hard: PositiveInt = Field(
        default=4096,
        description="Hard limit for maximum number of open file descriptors (ulimit -n nofile, hard limit).",
    )

    stack_size_kb: PositiveInt = Field(
        default=8_192,  # 8 MB in KB
        description="Maximum stack size in KB (ulimit -s stack).",
    )

    enable_network: bool = Field(
        default=True, description="Enable network access for the container."
    )


class ExecutionResult(BaseModel):
    """Execution result."""

    success: bool
    exit_code: int
    server_error: bool
    std_out: str | None = None
    std_err: str | None = None
