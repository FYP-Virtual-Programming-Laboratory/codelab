from pydantic import BaseModel, PositiveInt


class ContainerConfig(BaseModel):
    cpu_time_limit: PositiveInt
    memory_limit: PositiveInt
    process_limit: PositiveInt
    max_file_size: PositiveInt
    enable_network: bool
