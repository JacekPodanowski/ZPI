# Zadania są na Jirze

# Opis projektu w `.github/copilot-instructions.md`

# Szybkie małe zmiany 
    Branche najlepiej małe i tematyczne np: HomePage
    Jak działa to wrzucać na Maina
    Main powinien być akutalny

# Przed uruchomieniem upewinj się że masz 3 pliki .env :
    1 w katalogu ZPI
    2 w ZPI/BACKEND
    3 w ZPI/FRONTEND

Każdy folder ma plik `.env.example` z którego należy skopiować wszytsko i zrobić `.env`

# Do uruchomiaia używać docera :
    docker-compose up --build

# Docer uruchaminia:
    Frontend  na          localhost:3000
    Backend na            localhost:8000
    Api backendu na       http://localhost:8000/api/v1/

# Hot-reload
    Wszystko działa w trybie deweloperskim
    Zmiany w kodzie od razu automatycznie się ładują
    Jeśli nie widzisz zmian, sprawdź logi

# Komendy do docera są w `docer_commands.md`