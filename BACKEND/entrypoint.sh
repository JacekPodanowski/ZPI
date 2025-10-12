#!/bin/sh

echo "--- Entrypoint: Applying database migrations..."
python manage.py migrate --noinput
echo "--- Entrypoint: Migrations complete."

echo "--- Entrypoint: Collecting static files..."
python manage.py collectstatic --noinput
echo "--- Entrypoint: Static files collected."

echo "--- Entrypoint: Ensuring initial admin user exists..."
python manage.py create_initial_superuser
echo "--- Entrypoint: Admin user check complete."

echo "--- Entrypoint: Launching application command: $@"
exec "$@"