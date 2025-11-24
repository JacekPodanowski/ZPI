#!/bin/sh

# Zakończ skrypt natychmiast, jeśli jakakolwiek komenda się nie powiedzie
set -e

# --- ZADANIA KONFIGURACYJNE ---
echo "--- Entrypoint: Applying database migrations..."
python manage.py migrate --no-input
echo "--- Entrypoint: Migrations complete."

echo "--- Entrypoint: Collecting static files..."
python manage.py collectstatic --no-input --clear
echo "--- Entrypoint: Static files collected."

echo "--- Entrypoint: Ensuring initial admin user exists..."
python manage.py create_initial_superuser
echo "--- Entrypoint: Admin user check complete."

echo "--- Entrypoint: Loading initial Terms of Service..."
python manage.py load_initial_terms
echo "--- Entrypoint: Terms of Service loaded."

echo "--- Entrypoint: Creating default showcase site (YourEasySite_Demo)..."
python manage.py create_default_site
echo "--- Entrypoint: Default showcase site ready."

echo "--- Entrypoint: Creating mock sites for superuser..."
python manage.py create_mock_sites
echo "--- Entrypoint: Mock sites creation complete."

echo "--- Entrypoint: Initializing default email templates..."
python manage.py init_email_templates
echo "--- Entrypoint: Email templates initialization complete."

echo "--- Entrypoint: Loading DEV email templates (all templates for testing)..."
python manage.py load_dev_email_templates
echo "--- Entrypoint: DEV email templates loaded."

echo "--- Entrypoint: Setup tasks complete. ---"