# Uruchamianie w różnych trybach

## Tryb Development (lokalny, bez nginx)

Bezpośredni dostęp do usług:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **Admin:** http://localhost:8000/admin

```powershell
# Ustaw MODE=development w .env, następnie:
docker-compose -f docker-compose.dev.yml up -d

# Lub jedną komendą:
docker-compose -f docker-compose.dev.yml up -d --build
```

## Tryb Deployment (z nginx + SSL)

Wszystko przez nginx na portach 80/443:
- **Frontend:** https://yourdomain.com
- **Backend API:** https://yourdomain.com/api

```powershell
# Ustaw MODE=deployment w .env, następnie:
docker-compose -f docker-compose.yml up -d

# Lub jedną komendą:
docker-compose -f docker-compose.yml up -d --build
```

## Szybkie przełączanie

```powershell
# Zatrzymaj aktualny stack
docker-compose down

# Uruchom w trybie development
docker-compose -f docker-compose.dev.yml up -d

# LUB uruchom w trybie deployment
docker-compose -f docker-compose.yml up -d
```

## Różnice między trybami

| Aspekt | Development | Deployment |
|--------|------------|------------|
| Nginx | ❌ Nie używany | ✅ Reverse proxy + SSL |
| Frontend | Port 3000 | Port 80/443 (przez nginx) |
| Backend | Port 8000 | Port 80/443 (przez nginx) |
| Hot reload | ✅ Włączony | ❌ Build production |
| SSL | ❌ | ✅ Let's Encrypt |
