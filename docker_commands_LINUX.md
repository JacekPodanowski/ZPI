# Wyłącz
docker compose down 

# Wyłącz z usunięciem bazy:
docker compose down -v --remove-orphans

# Włącz :
docker compose up --build

# Włącz w tle:
docker compose up --build -d

# Rebuild :
docker compose build --no-cache

# ---> Viewer <---
docker compose --profile viewer up --build

# Wyświetl logi
docker compose logs -f                      

# wyczyść całą pamięć docera
docker system prune -a --volumes


# migracje
docker compose exec backend python manage.py migrate

# backup bazy do json
docker compose exec backend python manage.py dumpdata > backup_bazy.json

# wykonaj testy
docker compose exec backend python manage.py test api

