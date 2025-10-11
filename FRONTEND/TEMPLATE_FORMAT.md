# Format szablonu strony (.json)

## Opis
Ten plik opisuje format JSON używany do zapisu i wczytywania szablonów stron w edytorze.

## Struktura pliku

```json
{
  "version": "1.0",
  "timestamp": "2025-10-11T12:00:00.000Z",
  "config": {
    "name": "Nazwa szablonu",
    "pages": {
      "home": { ... },
      "about": { ... },
      "calendar": { ... },
      "contact": { ... }
    }
  },
  "siteStructure": "multi-page | single-page",
  "animations": {
    "enabled": true,
    "style": "smooth | fade | slide | none"
  }
}
```

## Sekcja `config.pages`

Każda strona ma następującą strukturę:

```json
{
  "id": "home",
  "name": "Strona Główna",
  "path": "/",
  "modules": [
    {
      "id": "hero",
      "name": "Strona Główna",
      "enabled": true,
      "order": 0,
      "config": { ... }
    }
  ]
}
```

## Moduły bazowe

### Hero Section (Strona główna)
```json
{
  "id": "hero",
  "name": "Strona Główna",
  "enabled": true,
  "order": 0,
  "config": {
    "title": "Witaj w Świecie Wellness",
    "subtitle": "Odkryj harmonię ciała i umysłu",
    "bgColor": "rgb(228, 229, 218)",
    "textColor": "rgb(30, 30, 30)",
    "backgroundImage": ""
  }
}
```

### About Section (O Mnie)
```json
{
  "id": "about",
  "name": "O Mnie",
  "enabled": true,
  "order": 0,
  "config": {
    "title": "O Mnie",
    "description": "Opis...",
    "imageUrl": "",
    "avatar": "",
    "bgColor": "rgb(228, 229, 218)"
  }
}
```

### Calendar Section (Kalendarz)
```json
{
  "id": "calendar",
  "name": "Kalendarz",
  "enabled": true,
  "order": 0,
  "config": {
    "title": "Zarezerwuj Termin",
    "color": "rgb(146, 0, 32)",
    "bgColor": "rgb(255, 255, 255)",
    "minInterval": 15,
    "allowIndividual": true,
    "allowGroup": true
  }
}
```

### Contact Section (Kontakt)
```json
{
  "id": "contact",
  "name": "Kontakt",
  "enabled": true,
  "order": 0,
  "config": {
    "email": "kontakt@wellness.pl",
    "phone": "+48 123 456 789",
    "bgColor": "rgb(255, 255, 255)"
  }
}
```

## Moduły Expert Mode

### Text Module
```json
{
  "id": "unique-id",
  "type": "text",
  "name": "Tekst",
  "enabled": true,
  "order": 0,
  "config": {
    "content": "Treść tekstu",
    "fontSize": "16px",
    "textColor": "rgb(30, 30, 30)",
    "align": "left | center | right",
    "layout": "block | inline"
  }
}
```

### Button Module
```json
{
  "id": "unique-id",
  "type": "button",
  "name": "Przycisk",
  "enabled": true,
  "order": 0,
  "config": {
    "text": "Kliknij",
    "link": "https://...",
    "bgColor": "rgb(146, 0, 32)",
    "textColor": "rgb(228, 229, 218)",
    "align": "left | center | right",
    "layout": "block | inline"
  }
}
```

### Gallery Module
```json
{
  "id": "unique-id",
  "type": "gallery",
  "name": "Galeria",
  "enabled": true,
  "order": 0,
  "config": {
    "style": "grid | masonry | slideshow | fade | carousel",
    "columns": 3,
    "images": [
      {
        "url": "https://...",
        "caption": "Opis zdjęcia"
      }
    ]
  }
}
```

### Spacer Module
```json
{
  "id": "unique-id",
  "type": "spacer",
  "name": "Odstęp",
  "enabled": true,
  "order": 0,
  "config": {
    "height": "2rem"
  }
}
```

### Container Module
```json
{
  "id": "unique-id",
  "type": "container",
  "name": "Kontener",
  "enabled": true,
  "order": 0,
  "config": {
    "direction": "horizontal | vertical",
    "gap": "1rem",
    "align": "start | center | end",
    "justify": "start | center | end | between | around",
    "wrap": true,
    "children": [
      {
        "type": "text | button | gallery | spacer",
        "config": { ... }
      }
    ]
  }
}
```

## Eksport i Import

### Eksport
1. Kliknij przycisk "📤 Eksportuj" w górnym menu
2. Plik JSON zostanie automatycznie pobrany

### Import
1. Kliknij przycisk "📥 Importuj" w górnym menu
2. Wybierz plik `.json` z szablonu
3. Szablon zostanie załadowany do edytora

## Wersjonowanie

Każdy wyeksportowany plik zawiera:
- `version`: Wersja formatu (aktualnie "1.0")
- `timestamp`: Data i czas eksportu
- Pełną konfigurację strony

## Uwagi

- Kolory są zapisywane w formacie `rgb(r, g, b)`
- URL-e obrazków mogą być względne lub bezwzględne
- Kolejność modułów jest określana przez pole `order`
- Moduły można włączać/wyłączać poprzez pole `enabled`
