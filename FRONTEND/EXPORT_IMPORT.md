# 📦 Eksport i Import Szablonów

## Szybki Start

### 🔼 Eksport Szablonu

1. W edytorze kliknij przycisk **"📤 Eksportuj"** w górnym menu
2. Pojawi się okno z podsumowaniem szablonu
3. Wybierz opcję:
   - **"📥 Pobierz plik"** - pobierz plik `.json` na dysk
   - **"📋 Kopiuj JSON"** - skopiuj JSON do schowka

### 🔽 Import Szablonu

1. Kliknij przycisk **"📥 Importuj"** w górnym menu
2. Wybierz plik `.json` z szablonu
3. Szablon zostanie automatycznie załadowany do edytora

## Co zawiera eksportowany plik?

Plik JSON zawiera **kompletną konfigurację strony**:

- ✅ Wszystkie sekcje (Hero, O Mnie, Kalendarz, Kontakt)
- ✅ Treści i ustawienia każdej sekcji
- ✅ Kolory tła i tekstu
- ✅ Obrazki i linki
- ✅ Strukturę strony (single-page / multi-page)
- ✅ Ustawienia animacji
- ✅ Moduły Expert Mode (jeśli używane)

## Przykładowy plik

Zobacz `example-template.json` w folderze FRONTEND

## Format pliku

Szczegółowy opis formatu znajduje się w `TEMPLATE_FORMAT.md`

## Zastosowania

### 🔄 Backup i Wersjonowanie
Eksportuj szablon regularnie, aby mieć kopię zapasową swojej pracy.

### 📤 Udostępnianie
Wyeksportowany plik możesz wysłać innym osobom - wystarczy, że zaimportują go w edytorze.

### 🔀 Migracja
Przenoś konfigurację między różnymi instalacjami edytora.

### 🧪 Testowanie
Eksperymentuj z różnymi wersjami - zawsze możesz wrócić do poprzedniej wersji importując zapisany plik.

## Nazwa pliku

Eksportowany plik ma format:
```
[nazwa-szablonu]-[data].json
```

Przykład:
```
wellness-template-2025-10-11.json
```

## Uwagi

- 💾 Plik JSON jest czytelny dla człowieka - możesz go edytować w edytorze tekstu
- ⚠️ Zachowaj ostrożność edytując ręcznie - błędy składni JSON uniemożliwią import
- 🔐 Plik nie zawiera wrażliwych danych - można go bezpiecznie udostępniać
