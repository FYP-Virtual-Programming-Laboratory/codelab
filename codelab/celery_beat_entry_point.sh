#!/bin/bash
set -e

echo "Starting Celery Beat..."
exec celery -A src.worker.celery_app beat --loglevel=info --schedule=/codelab/database/celerybeat-schedule
