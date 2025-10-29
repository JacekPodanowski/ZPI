# Generowanie wykresu bazy
docker-compose exec backend python manage.py graph_models -a -o my_models.png

##      ---HOSTED---

# Wyłącz
docker-compose -f docker-compose.HOSTED.yml down 


# Włącz :
docker-compose -f docker-compose.HOSTED.yml up --build

# Włącz w tle:
docker-compose -f docker-compose.HOSTED.yml up --build -d


# Rebuild :
docker-compose -f docker-compose.HOSTED.yml build --no-cache


# ---> Viewer <---
docker-compose -f docker-compose.HOSTED.yml --profile viewer up --build


# Wyświetl logi
docker-compose -f docker-compose.HOSTED.yml logs -f



##      ---LOCAL---
==============================================================================================================

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

# ---> Viewer <---
docker-compose --profile viewer up --build

# Wyświetl logi
docker-compose logs -f                      



## ---DODATEK---
==========================================================================

# wyczyść całą pamięć dockera
docker system prune -a --volumes

# migracje
docker-compose exec backend python manage.py migrate

# backup bazy do json
docker-compose exec backend python manage.py dumpdata > backup_bazy.json

# wykonaj testy
docker-compose exec backend python manage.py test apizrob