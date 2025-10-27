## Szybki start Windows
```bash
python -m venv venv_local

venv_local\Scripts\activate
lub 
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
venv_local\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Komendy dla systemu Linux/Mac
```bash
python3 -m venv venv_local
source venv_local/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
## API w pigułce

Interfejs REST służy do obsługi trzech typów użytkowników platformy YourEasySite: administratorów, twórców witryn oraz klientów rezerwujących sesje.

Rdzeń API obejmuje pięć zasobów:

- **Auth** – JWT (`/api/v1/token/`, `/api/v1/token/refresh/`) oraz rejestracja Google/dedykowana.
- **Platform users** – zarządzanie właścicielami kont (`/api/v1/users/`).
- **Sites** – konfiguracja stron oraz ich wersji (`/api/v1/sites/`).
- **Clients** – klienci przypisani do konkretnych witryn (`/api/v1/clients/`).
- **Events & bookings** – kalendarz twórców oraz rezerwacje klientów (`/api/v1/events/`, `/api/v1/bookings/`).

Każdy endpoint wymaga JWT chyba że wskazano inaczej. Uprawnienia egzekwuje `IsOwnerOrStaff`, dzięki czemu właściciel witryny widzi wyłącznie swoje zasoby.

### Dokumentacja interaktywna

- `GET /api/schema/` – surowy plik OpenAPI (YAML/JSON).
- `GET /api/docs/` – Swagger UI.
- `GET /api/redoc/` – Redoc.