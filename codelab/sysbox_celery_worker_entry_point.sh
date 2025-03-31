#!/bin/sh
set -o errexit
set -o nounset

# Define the Celery queue name with a default value
: "${CELERY_DEFAULT_QUEUE:=default}"
: "${CELERY_EXECUTION_QUEUE:=build}"

# run openrc
openrc
touch /run/openrc/softlevel
service docker start

# Start Celery worker in the background, logging to file
celery -A src.worker.celery_app multi start 2 \
    --loglevel=INFO \
    --pidfile=/var/run/celery/%n.pid \
    --logfile=/codelab/logs/%n.log \
    -Q:1 "${CELERY_EXECUTION_QUEUE}" \
    -Q "${CELERY_DEFAULT_QUEUE}" &
CELERY_PID=$!

# tail logs to keep the container running
tail -f /codelab/logs/*.log
