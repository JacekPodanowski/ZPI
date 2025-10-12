# Wyłącz
docker compose down 

# Wyłącz z usunięciem bazy:
docker compose down -v --remove-orphans

# Włącz :
docker compose up --build

# Włącz w tle:
docker compose up --build -d

# Wyświetl logi (z czego):
docker compose logs -f                      
docker compose logs -f backend
docker compose logs -f frontend

# wyczyść całą pamięć docera (czasem nawet 30 GB)
docker system prune -a --volumes

# backup bazy do json
docker compose exec backend python manage.py dumpdata > backup_bazy.json

# wykonaj testy
docker compose exec backend python manage.py test api

