#!/bin/sh
set -e

PIDFILE="/var/run/docker.pid"

# Clean up stale PID file if necessary.
if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    echo "Docker daemon already running with PID $PID. Exiting."
    fastapi run --workers 1 src/main.py &
    FASTAPI_PID=$!
    exit 1
  else
    echo "Stale PID file found. Removing $PIDFILE."
    rm -f "$PIDFILE"
  fi
fi

# Start Docker daemon in the background.
dockerd &
DOCKER_PID=$!

# Wait for the Docker daemon to be available.
echo "Waiting for Docker daemon to start..."
while ! docker info > /dev/null 2>&1; do
  sleep 1
done
echo "Docker daemon started."

# Start FastAPI service
# fastapi run --workers 1 src/main.py &
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload &
FASTAPI_PID=$!

# Define a cleanup function to terminate background processes.
cleanup() {
  echo "Terminating Docker daemon (PID $DOCKER_PID) and FastAPI service (PID $FASTAPI_PID)..."
  kill $DOCKER_PID $FASTAPI_PID
  wait
}

# Trap INT and TERM signals to ensure cleanup is done.
trap cleanup INT TERM SIGKILL

# Wait until one of the processes exits.
wait -n

# Once one exits, clean up the others.
cleanup
