FROM alpine:latest

RUN apk update && apk add \
    acl \
    bash \
    curl \
    findmnt \
    nano \
    strace \
    tree \
    libcap \
    bind-tools \
    nftables \
    curl \
    gcc \
    python3-dev \
    musl-dev \
    linux-headers \
    # to ensure we can run services on the container.
    openrc

# install docker since we are using sysbox-runc runtime to run the container
RUN apk update && apk add docker

WORKDIR /codelab/


# Install uv
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv:0.4.15 /uv /bin/uv

# Place executables in the environment at the front of the path
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#using-the-environment
ENV PATH="/codelab/.venv/bin:$PATH"

# Compile bytecode
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#compiling-bytecode
ENV UV_COMPILE_BYTECODE=1

# uv Cache
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#caching
ENV UV_LINK_MODE=copy

# Install dependencies
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#intermediate-layers
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

ENV PYTHONPATH=/codelab

COPY ./scripts /codelab/scripts

COPY ./pyproject.toml ./uv.lock ./alembic.ini /codelab/

COPY ./src /codelab/src

COPY ./celery_entry_point.sh /codelab/celery_entry_point.sh
COPY ./sysbox_celery_worker_entry_point.sh /codelab/sysbox_celery_worker_entry_point.sh
COPY ./server_entry_point.sh /codelab/server_entry_point.sh
COPY ./celery_beat_entry_point.sh /codelab/celery_beat_entry_point.sh


# Sync the project
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#intermediate-layers
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync


CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
