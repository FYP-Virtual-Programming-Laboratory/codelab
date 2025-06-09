#!/bin/sh
# Exit script on error or uninitialized variables
set -o errexit
set -o nounset

: "${CELERY_DEFAULT_QUEUE:=default}"
: "${CELERY_EXECUTION_QUEUE:=build}"

# Ensure logs appear in Docker by running Celery in the foreground
celery -A src.worker.celery_app multi start 2 \
    --loglevel=INFO \
    --pidfile=/var/run/celery/%n.pid \
    --logfile=/codelab/logs/%n.log \
    -Q:1 "${CELERY_EXECUTION_QUEUE}" \
    -Q "${CELERY_DEFAULT_QUEUE}"


# Keep the container running
# create a log file if it doesn't exist
touch /codelab/logs/celery.log
tail -f /codelab/logs/*.log
