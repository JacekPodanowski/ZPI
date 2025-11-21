# Wyłącz
docker-compose down 

# Wyłącz z usunięciem bazy:
docker-compose down -v --remove-orphans

# Włącz :
docker-compose up --build

# Włącz w tle:
docker-compose up --build -d

# Rebuild :
docker-compose build --no-cache

# Wyświetl logi
docker-compose logs -f                      


## ---DODATEK---
==========================================================================

# wyczyść całą pamięć dockera
docker system prune -a --volumes

# migracje cz.1
docker-compose exec backend python manage.py makemigrations

# migracje cz.2
docker-compose exec backend python manage.py migrate

# napraw migracje
docker-compose exec backend python manage.py makemigrations --merge --noinput  

# backup bazy do json
docker-compose exec backend python manage.py dumpdata > backup_bazy.json

# Generowanie wykresu bazy
docker-compose exec backend python manage.py graph_models -a -o my_models.png