## Szybki start Windows
```bash
# tylko jeśli go nie ma
python -m venv venv_local


Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
venv_local\Scripts\activate

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate

# BULLETPROOF BUILD: Tworzy showcase i mocki z automatyczną naprawą sekwencji
python manage.py create_initial_superuser
python manage.py create_default_site  # Tworzy showcase (ID=1)
python manage.py create_mock_sites    # Tworzy mocki (IDs 2-99) i naprawia sekwencję dla user sites (100+)
```

## Site ID Range Convention

System używa **zarezerwowanych zakresów ID** dla różnych typów stron:

```
ID 1:       "YourEasySite Demo" (showcase/preview site) - is_mock=True
IDs 2-99:   Mock/demo sites dla development i testów - is_mock=True
IDs 100+:   Prawdziwe user sites (auto-increment od 100) - is_mock=False
```

**Korzyści:**
- Łatwa identyfikacja typu strony po samym ID
- Proste filtrowanie (np. `id >= 100` dla user sites, `is_mock=True` dla test sites)
- Brak kolizji między mockami a prawdziwymi stronami
- Pierwsze 100 ID zarezerwowane dla deweloperów

**BULLETPROOF BUILD - jak to działa:**

`create_mock_sites` automatycznie wykonuje:
1. Czyści wszystkie mock sites (`is_mock=True`) i resetuje sekwencję do 1
2. Tworzy showcase site (ID=1) - patrz: `create_default_site`
3. Tworzy mock sites (dostaną IDs 2, 3, 4...)
4. Sprawdza najwyższe ID wśród user sites i ustawia sekwencję na max(100, last_user_id + 1)
5. Wyświetla podsumowanie dystrybucji

**Nigdy więcej ręcznych napraw sekwencji** - system jest bulletproof!

## Management Commands

- **create_initial_superuser** – tworzy superusera z danych środowiskowych
- **create_default_site** – tworzy profesjonalną stronę pokazową "YourEasySite_Demo" (ID=1, is_mock=True)
- **create_mock_sites** – **BULLETPROOF**: czyści mocki, tworzy showcase i mocki, naprawia sekwencję dla user sites (100+), wyświetla podsumowanie

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