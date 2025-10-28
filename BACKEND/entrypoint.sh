#!/bin/sh

# Automatyczne generowanie migracji --- CZYŚĆIĆ PRZY PRODUKCJI!
echo "--- Entrypoint: Creating migrations if needed..."
python manage.py makemigrations --noinput
echo "--- Entrypoint: Migrations creation complete."

echo "--- Entrypoint: Applying database migrations..."
python manage.py migrate --noinput
echo "--- Entrypoint: Migrations complete."

echo "--- Entrypoint: Collecting static files..."
python manage.py collectstatic --noinput
echo "--- Entrypoint: Static files collected."

echo "--- Entrypoint: Ensuring initial admin user exists..."
python manage.py create_initial_superuser
echo "--- Entrypoint: Admin user check complete."

echo "--- Entrypoint: Creating mock sites for superuser..."
python manage.py create_mock_sites
echo "--- Entrypoint: Mock sites creation complete."

echo "--- Entrypoint: Launching application command: $@"
exec "$@"