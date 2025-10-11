#!/bin/sh
set -e

echo "--- Entrypoint: Stosowanie migracji bazy danych..."
python manage.py migrate --noinput
echo "--- Entrypoint: Migracje zakończone."

echo "--- Entrypoint: Zbieranie plików statycznych..."

python manage.py collectstatic --noinput
echo "--- Entrypoint: Pliki statyczne zebrane."

echo "--- Entrypoint: Tworzenie superużytkownika (jeśli nie istnieje)..."
python manage.py create_initial_superuser
echo "--- Entrypoint: Proces tworzenia superużytkownika zakończony."

echo "--- Entrypoint: Uruchamianie serwera Gunicorn..."
exec "$@"