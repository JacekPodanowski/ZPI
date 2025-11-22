# System Wyspecjalizowanych Agentów AI

## Przegląd

System AI został podzielony na dwa wyspecjalizowane agenty, każdy z dedykowanym promptem i odpowiedzialnością:

### 1. **SiteEditorAgent** (`studio_editor`)
**Plik:** `BACKEND/api/ai_services_new.py`

**Odpowiedzialności:**
- Edycja konfiguracji strony (`template_config`)
- Zmiany wyglądu: kolory, czcionki, layouty
- Edycja treści: teksty, tytuły, opisy
- Struktura strony: dodawanie/usuwanie modułów
- Multimedia: obrazy, linki, przyciski CTA

**Format odpowiedzi:**
```json
{
  "status": "success",
  "site": { /* kompletna konfiguracja */ },
  "explanation": "Opis zmian"
}
```

lub

```json
{
  "status": "clarification",
  "question": "Pytanie do użytkownika"
}
```

**Użycie:**
```python
from api.ai_services_new import get_site_editor_agent

agent = get_site_editor_agent()
result = agent.process_task(
    user_prompt="zmień kolor tła na ciemny",
    site_config={...},
    context={"context_type": "studio_editor", "currentPageId": "home"},
    chat_history=[...]
)
```

---

### 2. **EventsManagerAgent** (`studio_events`)
**Plik:** `BACKEND/api/ai_services_new.py`

**Odpowiedzialności:**
- Tworzenie wydarzeń przez API
- Edycja wydarzeń
- Usuwanie wydarzeń
- **NIE edytuje** `template_config`!

**Format odpowiedzi:**
```json
{
  "status": "api_call",
  "endpoint": "/api/v1/big-events/",
  "method": "POST",
  "body": {
    "site": 1,
    "title": "Wycieczka w góry",
    "start_date": "2026-07-10",
    "end_date": "2026-07-15",
    "max_participants": 15,
    "price": "500.00",
    "status": "published"
  },
  "explanation": "Tworzę wydarzenie..."
}
```

**Użycie:**
```python
from api.ai_services_new import get_events_manager_agent

agent = get_events_manager_agent()
result = agent.process_task(
    user_prompt="dodaj wycieczkę w góry 10-15 lipca",
    context={"context_type": "studio_events", "site_id": 1},
    chat_history=[...]
)
```

---

## Integracja w `tasks.py`

Task `execute_complex_ai_task` automatycznie wybiera właściwego agenta na podstawie `context_type`:

```python
if context_type == 'studio_events':
    agent_service = get_events_manager_agent()
    result = agent_service.process_task(user_prompt, context, chat_history)
else:
    agent_service = get_site_editor_agent()
    result = agent_service.process_task(user_prompt, site_config, context, chat_history)
```

---

## Typy statusów odpowiedzi

| Status | Znaczenie | Agent |
|--------|-----------|-------|
| `success` | Zmiany wprowadzone do site config | SiteEditor |
| `clarification` | Potrzebne więcej informacji | Oba |
| `api_call` | Instrukcje wywołania API | EventsManager |
| `error` | Błąd przetwarzania | Oba |

---

## Frontend Integration

**AIChatPanel.jsx** automatycznie obsługuje wszystkie typy statusów:

- `success` → Aktualizuje site config w edytorze
- `clarification` → Wyświetla pytanie użytkownikowi
- `api_call` → **Automatycznie wykonuje wywołanie API** i odświeża listę eventów

```javascript
if (result.status === 'api_call') {
  const apiResponse = await apiClient({
    method: result.method.toLowerCase(),
    url: result.endpoint,
    data: result.body
  });
  // Wyświetl sukces i odśwież listę
  window.dispatchEvent(new CustomEvent('big-event-created', {
    detail: apiResponse.data
  }));
}
```

---

## Historia Konwersacji

Oba agenty mają dostęp do ostatnich 5 wiadomości z historii konwersacji:

```python
chat_history = [
    {
        'user_message': "dodaj wydarzenie wycieczka",
        'ai_response': "Jaka data i lokalizacja?",
        'created_at': "2025-11-22T10:00:00Z"
    },
    # ...
]
```

Agenty wykorzystują tę historię do:
- Kontynuacji wątku rozmowy
- Rozpoznawania potwierdzeń ("tak", "ok")
- Unikania powtarzania pytań

---

## Model Danych: Agent & ChatHistory

### Agent
```python
class Agent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(PlatformUser, on_delete=models.CASCADE)
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    context_type = models.CharField(max_length=50, choices=ContextType.choices)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
```

**ContextType choices:**
- `studio_editor` → SiteEditorAgent
- `studio_events` → EventsManagerAgent

### ChatHistory
```python
class ChatHistory(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    user = models.ForeignKey(PlatformUser, on_delete=models.CASCADE)
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    user_message = models.TextField()
    ai_response = models.TextField()
    status = models.CharField(max_length=50)  # success, clarification, api_call
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## Przykładowe Scenariusze

### Scenariusz 1: Edycja strony
```
User: "zmień kolor przycisku na czerwony"
Context: {context_type: "studio_editor", currentPageId: "home"}
→ SiteEditorAgent
→ Status: success, zwraca pełny site config z czerwonym przyciskiem
```

### Scenariusz 2: Dodanie wydarzenia (z historią)
```
User: "dodaj wycieczkę w góry 10-15 lipca 2026"
Context: {context_type: "studio_events", site_id: 1}
→ EventsManagerAgent
→ Status: clarification, "Jaka lokalizacja i cena?"

User: "Tatry, 500 zł"
Context: {context_type: "studio_events", site_id: 1}
History: ["dodaj wycieczkę...", "Jaka lokalizacja..."]
→ EventsManagerAgent
→ Status: api_call, endpoint: POST /api/v1/big-events/
```

### Scenariusz 3: Potwierdzenie
```
User: "dodaj warsztat jutro"
→ EventsManagerAgent
→ Status: clarification, "Jaka cena i max uczestników?"

User: "tak"
History: ["dodaj warsztat jutro", "Jaka cena..."]
→ EventsManagerAgent sprawdza historię
→ Status: clarification, "Proszę podać cenę i liczbę uczestników"
   (NIE traktuje "tak" jako odpowiedzi, bo nie było pytania tak/nie)
```

---

## Rozszerzanie Systemu

### Dodanie nowego typu agenta:

1. Utwórz nową klasę dziedziczącą po `BaseAIAgent`
2. Zdefiniuj `SYSTEM_PROMPT` z wyspecjalizowanymi instrukcjami
3. Implementuj metodę `process_task()`
4. Dodaj factory function (np. `get_new_agent()`)
5. Rozszerz logikę w `tasks.py`:

```python
if context_type == 'studio_new_context':
    agent_service = get_new_agent()
    result = agent_service.process_task(...)
```

6. Dodaj nowy `ContextType` w modelu `Agent`:

```python
class ContextType(models.TextChoices):
    STUDIO_EDITOR = 'studio_editor', 'Studio Editor'
    STUDIO_EVENTS = 'studio_events', 'Studio Events'
    NEW_CONTEXT = 'studio_new', 'New Context'  # ← DODAJ
```

---

## Best Practices

1. **Separacja odpowiedzialności**: Każdy agent ma jasno określony zakres działania
2. **Nie duplikuj promptów**: Jeśli funkcjonalność dotyczy dwóch agentów, rozważ refaktoryzację
3. **Testuj z historią**: Zawsze testuj scenariusze z co najmniej 2-3 wymianami wiadomości
4. **Loguj wszystko**: Używaj `logger.info()` do śledzenia przepływu między agentami
5. **Waliduj odpowiedzi**: Frontend powinien obsługiwać wszystkie możliwe statusy

---

## Troubleshooting

### Problem: Agent nie pamięta historii
**Rozwiązanie**: Sprawdź czy `chat_history` jest przekazywana w `process_task()` i czy `agent_id` jest prawidłowe w kontekście.

### Problem: EventsManagerAgent zwraca "success" zamiast "api_call"
**Rozwiązanie**: Sprawdź prompt - musi mieć instrukcję "NIGDY nie zwracaj status: success dla eventów".

### Problem: Niewłaściwy agent jest wybierany
**Rozwiązanie**: Sprawdź wartość `context_type` w kontekście - musi być zgodna z `Agent.ContextType.choices`.

---

## Migracja ze Starego Systemu

Stary system (`ai_services.py` z `FlashAssessmentService`) został zastąpiony. 

**Usunięte:**
- `get_flash_service()`
- `FlashAssessmentService.process_task()` z conditional logic

**Dodane:**
- `get_site_editor_agent()`
- `get_events_manager_agent()`
- `BaseAIAgent` z shared functionality

Wszystkie istniejące wywołania zostały zaktualizowane w `tasks.py`.
