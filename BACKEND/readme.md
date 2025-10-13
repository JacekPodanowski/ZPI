## Szybki start

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
## common crashes
jeśli w logach backend pisze że `entyrpoint.sh` nie intnieje to trzbea zmienic zakończenie pliku z CRLF na LF.


## API w pigułce

Interfejs REST służy do obsługi trzech typów użytkowników platformy YourEasySite: administratorów, twórców witryn oraz klientów rezerwujących sesje. Rdzeń API obejmuje pięć zasobów:

- **Auth** – JWT (`/api/v1/token/`, `/api/v1/token/refresh/`) oraz rejestracja Google/dedykowana.
- **Platform users** – zarządzanie właścicielami kont (`/api/v1/users/`).
- **Sites** – konfiguracja stron oraz ich wersji (`/api/v1/sites/`).
- **Clients** – klienci przypisani do konkretnych witryn (`/api/v1/clients/`).
- **Events & bookings** – kalendarz twórców oraz rezerwacje klientów (`/api/v1/events/`, `/api/v1/bookings/`).

Każdy endpoint wymaga JWT chyba że wskazano inaczej. Uprawnienia egzekwuje `IsOwnerOrStaff`, dzięki czemu właściciel witryny widzi wyłącznie swoje zasoby.

### Dokumentacja interaktywna

Obsługę API opisuje automatycznie generowany OpenAPI 3.2 przez **drf-spectacular**:

- `GET /api/schema/` – surowy plik OpenAPI (YAML/JSON).
- `GET /api/docs/` – Swagger UI.
- `GET /api/redoc/` – Redoc.

Opis schematu koncentruje się na wielo-tenantowej architekturze i prezentuje powiązania pomiędzy użytkownikiem platformy, witryną, klientem oraz rezerwacją.