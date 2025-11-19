# Wizard Flow Stage Validation System

## Przegląd

System walidacji etapów (stages) dla procesu tworzenia strony. Zapewnia, że użytkownik przechodzi przez wizard w odpowiedniej kolejności i że dane są zachowywane między etapami.

## Etapy Wizard Flow

1. **CATEGORY** (`/studio/new`) - Wybór kategorii
2. **PROJECT** (`/studio/new_project`) - Konfiguracja projektu (nazwa, moduły)
3. **STYLE** (`/studio/new/style`) - Wybór stylu
4. **LOGIN** (`/studio/building-login`) - Logowanie i utworzenie strony

## Kluczowe Funkcje

### `validateStageAccess(targetStage)`
Sprawdza czy użytkownik może uzyskać dostęp do danego etapu.
- Zwraca `{ canAccess: boolean, redirectTo: string|null }`
- Przekierowuje do poprzedniego niekompletnego etapu jeśli warunki nie są spełnione

### `isStageCompleted(stage)`
Sprawdza czy etap został ukończony:
- **CATEGORY**: `wizardData.category` istnieje
- **PROJECT**: `wizardData.category`, `name`, `modules[]` istnieją
- **STYLE**: Wszystkie powyższe + `templateConfig` istnieje

### `completeStage(stage, stageData)`
Zapisuje dane etapu do localStorage i oznacza go jako ukończony.

### `clearStageAndFollowing(stage)`
Czyści dane dla bieżącego i wszystkich kolejnych etapów.
- Używane gdy użytkownik cofa się do poprzedniego etapu

### `getWizardData()` / `saveWizardData(data)` / `clearWizardData()`
Podstawowe operacje na danych w localStorage.

## Jak to działa

### 1. Wejście na stronę etapu
Każda strona w `useEffect` wywołuje `validateStageAccess()`:
```javascript
useEffect(() => {
    const validation = validateStageAccess(WIZARD_STAGES.PROJECT);
    if (!validation.canAccess) {
        navigate(validation.redirectTo, { replace: true });
        return;
    }
    // ... load wizard data
}, [navigate]);
```

### 2. Zapisywanie postępu
Gdy użytkownik kończy etap (np. klika "Dalej"):
```javascript
completeStage(WIZARD_STAGES.PROJECT, {
    name: siteName.trim(),
    modules: enabledModules
});
navigate(getStageRoute(WIZARD_STAGES.STYLE));
```

### 3. Cofanie się
Gdy użytkownik cofa się do poprzedniego etapu:
```javascript
const handleBack = () => {
    clearStageAndFollowing(WIZARD_STAGES.CATEGORY);
    navigate(getStageRoute(WIZARD_STAGES.CATEGORY));
};
```

## Przykładowe Scenariusze

### Scenariusz 1: Normalna ścieżka
1. Użytkownik wybiera kategorię → zapisuje się `category`
2. Wprowadza nazwę i moduły → zapisuje się `name`, `modules`
3. Wybiera styl → zapisuje się `templateConfig`
4. Loguje się → tworzy stronę i czyści wizard data

### Scenariusz 2: Reload na etapie 2
1. Użytkownik jest na PROJECT (wprowadził nazwę ale nie kliknął "Dalej")
2. Odświeża stronę
3. Strona odczytuje `wizardData` z localStorage
4. Przywraca `category` (z etapu 1) i czeka na dokończenie etapu 2

### Scenariusz 3: Bezpośrednie przejście do etapu 3
1. Użytkownik próbuje otworzyć `/studio/new/style` bezpośrednio
2. `validateStageAccess(STYLE)` sprawdza poprzednie etapy
3. Etap PROJECT nie jest ukończony
4. Przekierowanie do `/studio/new_project`

### Scenariusz 4: Cofnięcie z etapu 3 do 2
1. Użytkownik jest na STYLE (ukończył CATEGORY i PROJECT)
2. Klika "Wstecz"
3. `clearStageAndFollowing(PROJECT)` czyści dane etapu PROJECT i STYLE
4. Użytkownik wraca do PROJECT i musi ponownie wybrać nazwę/moduły
5. CATEGORY pozostaje zapisana

### Scenariusz 5: Rozpoczęcie od nowa
1. Użytkownik wchodzi na `/studio/new` (CATEGORY)
2. `clearStageAndFollowing(CATEGORY)` czyści wszystkie dane
3. Rozpoczyna proces od zera

## Persystencja Danych

Dane są zapisywane w `localStorage` pod kluczem:
```javascript
WIZARD_STORAGE_KEYS.ACTIVE_DRAFT = 'editor:activeNewDraft'
```

Struktura danych:
```javascript
{
    category: 'wellness',           // Etap 1
    name: 'Moja Strona',           // Etap 2
    modules: ['about', 'calendar'], // Etap 2
    templateConfig: { ... }         // Etap 3
}
```

## Walidacja dla Niezalogowanych

System działa dla niezalogowanych użytkowników:
- Wszystkie etapy (CATEGORY, PROJECT, STYLE) są dostępne bez logowania
- Dane są zapisywane w localStorage przeglądarki
- Logowanie jest wymagane tylko na ostatnim etapie (LOGIN) przed utworzeniem strony
- Po zalogowaniu dane z localStorage są używane do utworzenia strony, a następnie czyszczone

## Pliki

- `wizardStageManager.js` - Główna logika systemu
- `CategorySelectionPage.jsx` - Etap 1
- `NewProjectPage.jsx` - Etap 2
- `StyleSelectionPage.jsx` - Etap 3
- `BuildingLoginPage.jsx` - Etap 4
