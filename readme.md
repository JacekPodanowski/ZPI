Główne zadanie to zbudować frontend apliakcji w katalogu `FRONTEND`
Można używać mojej strony z `site_frontend` jako szablonów, wyciągać z niej moduły itd

# Wszytsktkie instrukcje są w `Insturctions.md`
    Część 1 - Wstęp po polsku, wizja projektu i opis ekranów
    Część 2 - Szczegółowy opis techniczny po angielsku

# Robić branche :
    Najlepiej małe i tematyczne np: HomePage
    Nie pracować na mainie, powoduje to problemy.

# Przed uruchomieniem upewinj się że masz 4 pliki .env :
    1 w katalogu ZPI
    2 w ZPI/BACKEND
    3 w ZPI/FRONTEND
    4 w ZPI/site_frontend (opcjonalnie)

Każdy folder ma plik `.env.example` z którego należy skopiować wszytsko i zrobić `.env`

# do uruchomiaia używać docera :
    docker-compose up --build
    lub
    docker-compose up --build -d   (w tle, nie zawala konsoli logami)

# docer uruchaminia:
    Frontend edytora na   localhost:4000
    Backend na            localhost:8000
    Api backendu na       http://localhost:8000/api/v1/

# hot realod :
    jak coś zmnienicie po paru sekundach odświerzcie strone i powinno być (jak nie to patrz na logi)
    na FRONTENDZIE jest hot-realod
    na BACKENDZIE jest hot-realod

# Technologie
    Używane technologie zostały opisane w pliku Technology_Stack.md


Wszytskie dokładniejsze informacje można znaleść w plikach, jak sie nie uda to piszcie na grupie.