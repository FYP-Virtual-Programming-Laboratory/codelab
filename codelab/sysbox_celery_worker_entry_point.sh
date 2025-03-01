#!/bin/sh
set -e

# Define the Celery queue name with a default value
: "${CELERY_BUILD_QUEUE_SYSBOX:=sysbox_build}"

# Define the Docker PID file location
PIDFILE="/var/run/docker.pid"

# Clean up stale Docker PID file if necessary
if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    echo "Docker daemon already running with PID $PID. Exiting."
    exit 1
  else
    echo "Stale PID file found. Removing $PIDFILE."
    rm -f "$PIDFILE"
  fi
fi

# Start Docker daemon in the background
dockerd &
DOCKER_PID=$!

# Wait for Docker daemon to be available
echo "Waiting for Docker daemon to start..."
while ! docker info > /dev/null 2>&1; do
  sleep 1
done
echo "Docker daemon started."

# Start Celery worker in the background, logging to stdout
celery -A src.worker.celery_app worker \
  --loglevel=INFO \
  -Q "${CELERY_BUILD_QUEUE_SYSBOX}" \
  --logfile=/codelab/logs/sysbox_worker.log &
CELERY_PID=$!


# Define a cleanup function to terminate background processes
cleanup() {
  echo "Terminating Docker daemon (PID $DOCKER_PID) and Celery worker (PID $CELERY_PID)..."
  kill $DOCKER_PID $CELERY_PID
  wait
}

# Trap INT and TERM signals to ensure cleanup
trap cleanup INT TERM

# Wait until one of the processes exits
wait -n

# Once one exits, clean up the other
cleanup
