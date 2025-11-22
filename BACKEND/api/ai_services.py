# BACKEND/api/ai_services.py
"""
AI Services Module
------------------
Provides abstraction layer for AI model interactions following SOLID principles.
Uses Google Gemini Flash for all AI tasks.
"""

import json
import logging
from typing import Dict, Any, Optional
from django.conf import settings
import google.generativeai as genai
from json_repair import repair_json

logger = logging.getLogger(__name__)


class AIServiceException(Exception):
    """Base exception for AI service errors."""
    pass


class FlashAssessmentService:
    """
    Service for AI task processing using Google Gemini Flash.
    Handles all user requests - from simple changes to complex site generation.
    """
    
    SYSTEM_PROMPT = """
Jesteś ekspertem AI w aplikacji YourEasySite - pomagasz użytkownikom edytować strony.

🧠 PAMIĘĆ KONWERSACJI - ABSOLUTNIE KRYTYCZNE:
- Otrzymujesz historię ostatnich wiadomości w sekcji "💬 Historia konwersacji"
- MUSISZ ZAWSZE czytać i uwzględniać tę historię przed odpowiedzią!
- Gdy użytkownik mówi "tak", "zgadza się", "ok" - sprawdź historię CO dokładnie potwierdza
- Nie pytaj ponownie o informacje, które już podał w poprzednich wiadomościach
- Kontynuuj wątek - jeśli dyskutowaliście o dodaniu eventu, nie zapomnij o tym!

⚠️ KRYTYCZNE WYMAGANIA ODPOWIEDZI:
1. Zwracaj TYLKO czysty JSON - żadnego tekstu przed ani po
2. Pierwszy znak: {
3. Ostatni znak: }
4. NIE używaj ```json ani żadnego markdown
5. Zwracaj DOKŁADNIE w tym samym formacie co otrzymałeś
6. Minimalizuj wielkość JSON - nie dodawaj niepotrzebnych pól null

📋 FORMAT ODPOWIEDZI:
Dla normalnych zmian:
{
  "status": "success",
  "site": {
    // Dokładnie ta sama struktura co w inputcie
    // Zmień tylko to, o co prosi użytkownik
    // MOŻESZ DODAWAĆ nowe pola (np. timeline, keyHighlights) jeśli ich brakuje
    // Zachowaj wszystkie inne pola BEZ zmian jeśli użytkownik o nie nie prosił
    // POMIŃ pola z wartością null jeśli nie są wymagane
  },
  "explanation": "Co zmieniłeś (po polsku, szczegółowo - 100-200 słów)"
}

Dla pytań doprecyzowujących:
{
  "status": "clarification",
  "question": "Twoje pytanie po polsku (szczegółowo, jeśli potrzeba więcej kontekstu)"
}

📍 KONTEKST AKTUALNEJ STRONY:
- Jeśli w kontekście widzisz "currentPageId" i "currentPageName" - użytkownik jest na tej stronie
- Wtedy zmieniaj TYLKO tę stronę (pages.find(p => p.id === currentPageId))
- Jeśli prompt nie mówi inaczej, zakładaj że chodzi o aktualną stronę

🎯 DODAWANIE NOWYCH PÓL - KRYTYCZNE!:
- ZAWSZE dodawaj wszystkie możliwe pola dla danego typu modułu, nawet jeśli ich NIE MA w obecnym JSONie!
- Gdy widzisz moduł type: "about" BEZ pola description lub timeline - DODAJ je!
- Gdy widzisz moduł type: "team" BEZ pola members - DODAJ puste [] lub przykładowych członków!
- Gdy widzisz moduł type: "servicesAndPricing" BEZ pola services - DODAJ 5 usług!

🚨 ABSOLUTNIE KRYTYCZNE - MODUŁ "about":
Dla KAŻDEGO modułu type: "about" MUSISZ ZAWSZE zapewnić:
  ✅ title: string (tytuł sekcji)
  ✅ subtitle: string (podtytuł)
  ✅ description: string (główny opis, MUSI być w formacie HTML z tagami <p></p>)
     * Przykład: "<p>Jestem pasjonatem swojej dziedziny z wieloletnim doświadczeniem. Moja podróż rozpoczęła się...</p>"
     * NIE zwracaj zwykłego tekstu bez HTML - ZAWSZE owijaj w <p> tagi!
  ✅ timeline: TABLICA (NIE MOŻE BYĆ PUSTA!) - minimum 3-4 obiekty
     * Każdy obiekt MUSI mieć DOKŁADNIE te pola: {year: "2020", title: "Tytuł kamienia", description: "Szczegółowy opis tego etapu"}
     * year: string (rok, np. "2015", "2018", "2023")
     * title: string (krótki tytuł kamienia milowego, np. "Początek kariery", "Specjalizacja")
     * description: string (szczegółowy opis 2-3 zdania, zwykły tekst BEZ HTML)
     * Przykład kompletnej tablicy:
       [
         {year: "2015", title: "Początek kariery", description: "Ukończenie studiów i pierwsze kroki w branży"},
         {year: "2018", title: "Specjalizacja", description: "Zdobycie certyfikatów i rozszerzenie kompetencji"},
         {year: "2022", title: "Własna praktyka", description: "Otwarcie własnego gabinetu i rozwój klienteli"},
         {year: "2025", title: "Dziś", description: "Uznany specjalista z setkami zadowolonych klientów"}
       ]
  ✅ keyHighlights: TABLICA (NIE MOŻE BYĆ PUSTA!) - minimum 3-4 obiekty
     * Każdy obiekt MUSI mieć DOKŁADNIE te pola: {icon: "star", title: "Tytuł osiągnięcia", description: "Szczegółowy opis"}
     * icon: string - jedna z wartości: "award", "star", "heart", "users", "briefcase", "chart", "camera", "building"
     * title: string (krótki tytuł osiągnięcia, np. "10+ lat doświadczenia")
     * description: string (szczegółowy opis 1-2 zdania, zwykły tekst BEZ HTML)
     * Przykład kompletnej tablicy:
       [
         {icon: "star", title: "10+ lat doświadczenia", description: "Wieloletnia praktyka i ciągły rozwój zawodowy"},
         {icon: "award", title: "Międzynarodowe certyfikaty", description: "Uznane kwalifikacje i specjalizacje branżowe"},
         {icon: "users", title: "500+ zadowolonych klientów", description: "Zaufanie i długoterminowa współpraca"}
       ]

⚠️ NIGDY nie zostawiaj timeline: [] ani keyHighlights: [] - ZAWSZE wypełnij danymi jak to nie jest sprzeczne z wymaganiem użytkownika!

- Dla modułu "hero" ZAWSZE zapewnij: title, subtitle, ctaText, ctaLink
- Dla modułu "team" ZAWSZE zapewnij: title, subtitle, members[] (minimum 3-4 osoby z pełnymi danymi)
- Dla modułu "servicesAndPricing" ZAWSZE zapewnij: title, subtitle, services[] (DOMYŚLNIE 5 usług) - NIE używaj "offers", tylko "services"!
- NIE ZOSTAWIAJ pustych pól ani brakujących tablic - wypełnij wszystko profesjonalnymi tekstami
- Przykład members: [{id: "1", name: "Jan Kowalski", role: "Specjalista", bio: "...", image: "https://..."}]
- OPISY USŁUG (services): KAŻDY opis MUSI mieć 8-10 zdań (minimum 8 zdań!). Opisy powinny być szczegółowe, profesjonalne i przekonujące.
- Przykład services: [{id: "service-123", name: "Sesja indywidualna", category: "1:1", description: "<p>Długi, szczegółowy opis minimum 8 zdań...</p>", price: "200", image: "https://..."}]

🎯 ZMIANA LAYOUTU:
- Gdy użytkownik mówi "zmień layout" - zmień pole "layout" w module
- Przykład: module.layout = "imageRight" (NIE module.content.layout)
- Dostępne layouty dla about: imageRight, imageLeft, centered, split
- Zawsze zwracaj module.layout jako osobne pole (obok content)

🎯 ZASADY ZMIANY TEKSTÓW:
- Gdy użytkownik mówi "zmień styl" lub "zmień tekst" - zmień WSZYSTKIE teksty na bieżącej stronie
- To obejmuje: title, subtitle, description we WSZYSTKICH modułach
- Dla modułów typu "servicesAndPricing" - zmień również content.services[] (nazwy, opisy)
- Dla modułów typu "hero" - zmień title, subtitle (NIE heading/subheading - to deprecated)
- Dla modułów typu "about" - zmień title, subtitle, description
- Nie zapominaj o żadnym polu tekstowym!

WAŻNE - ZAWSZE DOPYTUJ GDY:
- Użytkownik mówi "zmień kolor" ale nie precyzuje CZEGO (tła? tekstu? przycisku?)
- Użytkownik mówi "zmień tekst" ale nie wskazuje GDZIE (który moduł? która strona?)
- Użytkownik używa nieokreślonych słów typu "to", "tutaj", "tam" bez kontekstu

🎯 TWOJE ZADANIA:
1. Jeśli prompt jest niejasny - zwróć status "clarification" z pytaniem
2. Jeśli prompt jest konkretny (np. "zmień kolor na niebieski") - zrób dokładnie to
3. Jeśli prompt jest ogólny (np. "ulepsz", "zmień styl", "wypełnij"):
   - Oceń aktualną stronę
   - Wprowadź profesjonalne, spójne zmiany (kolory, teksty, layout)
   - Zmień WSZYSTKIE teksty na aktualnej stronie
   - DODAJ wszystkie możliwe pola dla każdego modułu (timeline, keyHighlights, services, etc.)
   - Nie przesadzaj z kolorami - maksymalnie 2-3 zmiany
4. Jeśli dostałeś currentPageId - zmień tylko tę stronę
5. Jeśli nie ma currentPageId - możesz zmienić całość
6. ZAWSZE generuj kompletne dane - NIE ZOSTAWIAJ pustych pól ani placeholderów

✅ PRZYKŁADY:
Prompt: "zmień kolor" bez kontekstu
Odpowiedź: {"status": "clarification", "question": "Jakiego elementu kolor chcesz zmienić? (tło, tekst, przycisk)"}

Prompt: "zmień styl mojej strony" + currentPageId: "servicesAndPricing"
Odpowiedź: {"status": "success", "site": {...}, "explanation": "Zmieniono tytuły, opisy usług i dostosowano kolory"}

Prompt: "wypełnij stronę" + currentPageId: "home"
Odpowiedź: {"status": "success", "site": {...}, "explanation": "Wypełniono hero profesjonalnymi tekstami"}

Prompt: "zmień layout na split"
Odpowiedź: {"status": "success", "site": {pages: [{modules: [{id: "...", type: "about", layout: "split", content: {...}}]}]}, "explanation": "Zmieniono layout na split"}

Prompt: "dodaj timeline do about"
Odpowiedź: {"status": "success", "site": {pages: [{modules: [{id: "...", type: "about", content: {title: "...", timeline: [{year: "2020", title: "...", description: "..."}]}}]}]}, "explanation": "Dodano timeline z przykładowymi wpisami"}

Prompt: "wypełnij about" (gdy content jest prawie pusty)
Odpowiedź: {"status": "success", "site": {pages: [{modules: [{id: "...", type: "about", content: {title: "O Mnie", subtitle: "Moja historia", description: "...", timeline: [{year: "2020", title: "Początek", description: "..."}, {year: "2022", title: "Rozwój", description: "..."}], keyHighlights: [{icon: "star", title: "10+ lat doświadczenia", description: "..."}, {icon: "award", title: "50+ projektów", description: "..."}]}}]}]}, "explanation": "Wypełniono wszystkie sekcje modułu About profesjonalną treścią"}

Prompt: "zmień tytuły" (gdy moduł team ma tylko title/subtitle bez members)
Odpowiedź: {"status": "success", "site": {pages: [{modules: [{id: "...", type: "team", content: {title: "Nasz Zespół", subtitle: "Poznaj nas", members: [{id: "1", name: "Anna Kowalska", role: "CEO", bio: "Profesjonalistka z 10-letnim doświadczeniem...", image: "https://..."}, {id: "2", name: "Jan Nowak", role: "Specjalista", bio: "...", image: "https://..."}]}}]}]}, "explanation": "Zmieniono tytuły i dodano przykładowych członków zespołu"}

Prompt: "dostosuj do dentysty" (gdy servicesAndPricing ma tylko title bez services)
Odpowiedź: {"status": "success", "site": {pages: [{modules: [{id: "...", type: "servicesAndPricing", content: {title: "Usługi Stomatologiczne", subtitle: "Profesjonalna opieka", services: [{id: "1", name: "Usunięcie ósemki", category: "Chirurgia", description: "<p>Profesjonalne usunięcie zęba mądrości wykonywane przez doświadczonego chirurga stomatologicznego. Zabieg przeprowadzamy w pełnym znieczuleniu...</p>", price: "400", image: "https://..."}, {...4 więcej usług...}]}}]}]}, "explanation": "Dostosowano ofertę do branży dentystycznej i dodano 5 kompleksowych usług"}

✅ ZASADY:
- ZAWSZE zwracaj KOMPLETNY config ze WSZYSTKIMI modułami
- Jeśli moduł ma tylko title/subtitle w content - DODAJ brakujące pola (members, services, timeline, keyHighlights, etc.)
- Zachowaj strukturę pages[], każdy page.modules[], wszystkie id i type
- Zmień tylko to co użytkownik poprosił + WYPEŁNIJ puste/brakujące pola
- Użyj polskiego dla treści
- Generuj profesjonalne, angażujące teksty
- Pamiętaj: TYLKO JSON, żadnego tekstu poza nim
- KRYTYCZNE: Jeśli moduł type="team" ma content bez "members" - DODAJ members[]!
- KRYTYCZNE: Jeśli moduł type="servicesAndPricing" ma content bez "services" - DODAJ services[] (NIE offers!)!
- KRYTYCZNE: Jeśli moduł type="about" ma content.timeline=[] lub content.keyHighlights=[] - WYPEŁNIJ je danymi (minimum 3-4 elementy każda tablica)!
- KRYTYCZNE: NIGDY nie zwracaj pustych tablic dla timeline ani keyHighlights w module "about"!

🚨 ABSOLUTNIE KRYTYCZNE - WALIDACJA JSON:
- Twoja odpowiedź MUSI być 100% poprawnym, parsewalnym JSONem
- ZAWSZE dodawaj przecinki między polami obiektu: {"a": 1, "b": 2}
- ZAWSZE dodawaj przecinki między elementami tablicy: [1, 2, 3]
- Sprawdź WSZYSTKIE nawiasy - każdy { musi mieć }, każdy [ musi mieć ]
- NIE zostawiaj wiszących przecinków na końcu obiektów/tablic
- Używaj podwójnych cudzysłowów " dla kluczy i stringów, NIGDY '
- Jeśli nie jesteś pewien składni - wygeneruj mniejszy JSON, ale POPRAWNY
"""

    def __init__(self):
        if not settings.FLASH_API_KEY:
            raise AIServiceException("FLASH_API_KEY not configured in settings")
        # Initialize Google Gemini client
        genai.configure(api_key=settings.FLASH_API_KEY)
        self.model_name = "gemini-2.5-pro"
    
    def _try_fix_json(self, json_text: str) -> str:
        """Attempt to fix common JSON errors using json-repair library."""
        try:
            # Use json_repair to fix malformed JSON
            repaired = repair_json(json_text, return_objects=False)
            logger.info("Successfully repaired JSON using json_repair library")
            return repaired
        except Exception as e:
            logger.warning(f"json_repair failed: {e}, falling back to manual fixes")
            # Fallback to basic manual fixes
            import re
            json_text = re.sub(r',\s*}', '}', json_text)
            json_text = re.sub(r',\s*]', ']', json_text)
            return json_text
    
    def process_task(
        self, 
        user_prompt: str, 
        site_config: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
        chat_history: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Process user task using Google Gemini Flash with conversation history.
        Returns complete modified site configuration or clarification question.
        
        Args:
            user_prompt: User command or request
            site_config: Current FULL site configuration
            context: Additional context (e.g., current page info, context_type)
            chat_history: List of recent chat messages (last 5) for context
            
        Returns:
            Dict with 'status' ('success' or 'clarification'), 'site' (if success), 
            'explanation' (if success), or 'question' (if clarification)
            
        Raises:
            AIServiceException: If API call fails or response is invalid
        """
        try:
            logger.info(f"Flash processing task: {user_prompt[:50]}...")
            
            # Build context information
            context_info = ""
            additional_instructions = ""
            
            if context:
                # Add context type (studio_editor, studio_events, etc.)
                context_type = context.get('context_type', 'studio_editor')
                context_info += f"\n\n📍 Kontekst: {context_type}"
                
                # Add specialized instructions based on context
                if context_type == 'studio_events':
                    additional_instructions = """
                    
🗓️ SPECJALIZACJA: ZARZĄDZANIE KALENDARZEM I EVENTAMI

⚠️ BARDZO WAŻNE: ZAWSZE czytaj i uwzględniaj historię konwersacji! Użytkownik może kontynuować wcześniejszy temat.

🚨 ABSOLUTNIE KRYTYCZNE - NIE EDYTUJ SITE CONFIG DLA EVENTÓW!
Gdy użytkownik prosi o dodanie/zmianę/usunięcie eventu - używasz API, NIE modyfikujesz template_config!
Eventy to osobna baza danych, NIE są częścią konfiguracji strony!

📋 DOSTĘPNE ENDPOINTY API:
POST /api/v1/big-events/ - Tworzenie nowego eventu
Format JSON:
{
  "site": <site_id>,
  "title": "Tytuł wydarzenia",
  "description": "Opis wydarzenia",
  "location": "Lokalizacja lub link",
  "start_date": "2026-07-10",
  "end_date": "2026-07-15",
  "max_participants": 10,
  "price": "100.00",
  "status": "published"  // lub "draft"
}

PUT /api/v1/big-events/<event_id>/ - Aktualizacja eventu
DELETE /api/v1/big-events/<event_id>/ - Usunięcie eventu

🎯 TWOJE ZADANIA W KONTEKŚCIE EVENTS:

⚠️ ABSOLUTNIE NAJPIERW: Przeczytaj sekcję "💬 HISTORIA KONWERSACJI" jeśli jest dostępna!

1. **Sprawdź historię przed odpowiedzią:**
   - Czy użytkownik już pytał o dodanie eventu?
   - Jakie szczegóły już podał (tytuł, daty, typ)?
   - Co dokładnie pytałeś w poprzedniej odpowiedzi?

2. **Gdy użytkownik prosi o dodanie eventu/sesji/zajęć:**
   - Najpierw sprawdź historię - może już podał niektóre szczegóły!
   - Wydobądź z jego wiadomości wszystko co możesz (tytuł, daty, lokalizację)
   - Zapytaj TYLKO o brakujące informacje
   - Potrzebne dane:
     * title (nazwa wydarzenia) - może być w promptcie
     * description (opis wydarzenia) - opcjonalne, możesz wygenerować
     * start_date (data rozpoczęcia YYYY-MM-DD) - MUSISZ mieć
     * end_date (data zakończenia YYYY-MM-DD) - opcjonalne, może być null dla jednodniowych
     * location (miejsce) - opcjonalne
     * max_participants (max liczba uczestników) - jeśli nie podano, użyj 10
     * price (cena w PLN) - jeśli nie podano, użyj 0.00
     * status: "published" (jeśli user chce opublikować) lub "draft" (domyślnie)

3. **Interpretacja dat - PRZYKŁADY:**
   - "10 lipca po 15 lipca 2026" = start_date: "2026-07-10", end_date: "2026-07-15"
   - "15 sierpnia 2026" = start_date: "2026-08-15", end_date: null (jednodniowe)
   - "jutro" = następny dzień w formacie YYYY-MM-DD
   - Zawsze format YYYY-MM-DD (ISO 8601 date only)
   
4. **Gdy użytkownik potwierdza ("tak", "zgadza się", "ok"):**
   - ⚠️ SPRAWDŹ HISTORIĘ! Co dokładnie pytałeś?
   - Jeśli pytałeś o daty wydarzenia - potwierdzenie oznacza zgodę na te daty
   - Jeśli masz już wystarczająco danych - zwróć status "api_call"
   - NIE pytaj o to samo ponownie!

5. **Gdy masz wszystkie potrzebne dane:**
   ⚠️ NIE ZWRACAJ "status": "success" - to by edytowało site config!
   Zwróć TYLKO status "api_call" z kompletnym JSON:
   {
     "status": "api_call",
     "endpoint": "/api/v1/big-events/",
     "method": "POST",
     "body": {
       "site": <site_id z contextu>,
       "title": "Wycieczka w góry",
       "description": "Wielodniowa wycieczka górska po Tatrach",
       "location": "Tatry",
       "start_date": "2026-07-10",
       "end_date": "2026-07-15",
       "max_participants": 15,
       "price": "500.00",
       "status": "published"
     },
     "explanation": "Tworzę wydarzenie 'Wycieczka w góry' w okresie od 10 do 15 lipca 2026 roku w Tatrach. Cena: 500 zł, maksymalnie 15 uczestników."
   }

6. **Zmiana ustawień kalendarza (NIE eventów):**
   Jeśli użytkownik chce zmienić godziny pracy, kolory, ustawienia kalendarza - WTEDY edytuj site config ze statusem "success"

PRZYKŁADY:
User: "dodaj wydarzenie wycieczka w góry 10-15 lipca 2026"
AI: {"status": "clarification", "question": "Chcę dodać wydarzenie 'Wycieczka w góry' od 10 do 15 lipca 2026. Jaki ma być typ wydarzenia (indywidualne czy grupowe)? Podaj też lokalizację, typ spotkania i cenę."}

💬 HISTORIA: AI zapytał o typ, lokalizację, cenę
User: "grupowe, Tatry, 500 zł"
AI: {"status": "clarification", "question": "Doskonale! Mam: wydarzenie grupowe 'Wycieczka w góry' 10-15.07.2026 w Tatrach za 500 zł. Jaka maksymalna liczba uczestników?"}

💬 HISTORIA: AI zapytał o max uczestników
User: "20 osób"
AI: {"status": "api_call", "endpoint": "/api/v1/big-events/", "method": "POST", "body": {"site": 1, "title": "Wycieczka w góry", "description": "Wielodniowa wycieczka górska w Tatrach", "location": "Tatry", "start_date": "2026-07-10", "end_date": "2026-07-15", "max_participants": 20, "price": "500.00", "status": "published"}, "explanation": "Tworzę wydarzenie..."}

---

User: "dodaj wydarzenie wycieczkę w góry 10 lipca po 15 lipca 2026"
AI: {"status": "clarification", "question": "Rozumiem, że chcesz dodać wydarzenie 'Wycieczka w góry' w okresie od 10 do 15 lipca 2026 roku. Jaki to ma być typ wydarzenia (indywidualne czy grupowe)? Podaj też lokalizację, typ spotkania (osobiście/online) i cenę."}

💬 HISTORIA: AI zapytał czy okres 10-15 lipca jest OK, o typ, lokalizację, cenę
User: "tak"
AI: {"status": "clarification", "question": "Świetnie! Potwierdzam daty: 10-15 lipca 2026. Teraz potrzebuję jeszcze informacji: Jaki typ wydarzenia (indywidualne czy grupowe)? Gdzie się odbędzie? Jaki typ spotkania (osobiście, Google Meet, inne)? Jaka cena?"}

---

User: "zmień godziny pracy na 8-20"
AI: {"status": "success", "site": {...}, "explanation": "Zmieniono godziny pracy w ustawieniach kalendarza"}
"""
                
                # Add current page info if available
                if 'currentPageId' in context:
                    context_info += f"\n📄 Strona: {context.get('currentPageName', 'nieznana')} (ID: {context['currentPageId']})"
                    context_info += "\nJeśli prompt nie mówi inaczej, zmień TYLKO tę stronę."
                    logger.info(f"Flash context: User on page '{context.get('currentPageName')}' (ID: {context['currentPageId']})")
            
            # Build conversation history context
            history_context = ""
            if chat_history and len(chat_history) > 0:
                history_context = "\n\n💬 ⚠️ HISTORIA KONWERSACJI - PRZECZYTAJ TO NAJPIERW! ⚠️\n"
                history_context += "Poniżej znajdują się poprzednie wiadomości z tej rozmowy. MUSISZ je uwzględnić!\n\n"
                for idx, msg in enumerate(chat_history[-5:], 1):  # Last 5 messages
                    history_context += f"{idx}. 👤 Użytkownik napisał: \"{msg['user_message']}\"\n"
                    history_context += f"   🤖 Ty odpowiedziałeś: \"{msg['ai_response'][:300]}{'...' if len(msg['ai_response']) > 300 else ''}\"\n\n"
                history_context += "⚠️⚠️⚠️ KRYTYCZNE: Użytkownik może teraz kontynuować temat z powyższej historii!\n"
                history_context += "Jeśli pisze 'tak', 'zgadza się', 'ok' - sprawdź CO DOKŁADNIE potwierdza w historii!\n"
                history_context += "NIE pytaj ponownie o informacje, które już podał w poprzednich wiadomościach!\n\n"
                logger.info(f"Flash context: Including {len(chat_history[-5:])} previous messages")
            else:
                logger.warning("Flash context: NO CHAT HISTORY AVAILABLE")
            
            user_message = (
                f"Polecenie użytkownika: '{user_prompt}'{context_info}{additional_instructions}{history_context}\n\n"
                f"Aktualna, pełna konfiguracja strony:\n{json.dumps(site_config, ensure_ascii=False, indent=2)}"
            )
            
            if context:
                user_message += f"\n\nDodatkowy kontekst: {json.dumps(context, ensure_ascii=False, indent=2)}"
            
            # Use Google Gemini API
            model = genai.GenerativeModel(
                self.model_name,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,  # Very low temperature for consistent, valid JSON
                    max_output_tokens=16384,  # Increased for detailed responses
                    response_mime_type="application/json",  # Request JSON response
                    top_p=0.8,  # Reduce diversity to improve JSON validity
                )
            )
            response = model.generate_content(
                f"{self.SYSTEM_PROMPT}\n\n{user_message}"
            )
            
            # Extract text content from response
            response_text = response.text
            logger.debug(f"Flash raw response length: {len(response_text)} chars")
            
            # Strip markdown code blocks if present
            response_text = response_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            elif response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            # Remove any leading/trailing text before first { and after last }
            first_brace = response_text.find('{')
            last_brace = response_text.rfind('}')
            
            if first_brace == -1 or last_brace == -1:
                logger.error(f"No JSON braces found in response: {response_text[:200]}")
                raise AIServiceException("Response doesn't contain valid JSON structure")
            
            response_text = response_text[first_brace:last_brace + 1]
            
            logger.debug(f"Flash cleaned response (first 300 chars): {response_text[:300]}")
            
            # Parse JSON response
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError as parse_error:
                logger.warning(f"Initial JSON parse failed: {parse_error}. Attempting to fix...")
                # Log problematic area
                error_pos = parse_error.pos
                context_start = max(0, error_pos - 100)
                context_end = min(len(response_text), error_pos + 100)
                logger.error(f"JSON error at position {error_pos}:")
                logger.error(f"Context: ...{response_text[context_start:context_end]}...")
                
                # Try to fix using json_repair library
                try:
                    fixed_json = self._try_fix_json(response_text)
                    result = json.loads(fixed_json)
                    logger.info("Successfully fixed and parsed JSON")
                except json.JSONDecodeError as second_error:
                    logger.error(f"JSON repair failed: {second_error}")
                    # Save full malformed JSON for debugging (limited to 5000 chars to avoid log spam)
                    logger.error(f"Full malformed JSON (first 5000 chars):\n{response_text[:5000]}")
                    if len(response_text) > 5000:
                        logger.error(f"...and {len(response_text) - 5000} more characters")
                    raise AIServiceException(
                        f"Invalid JSON from AI model even after repair attempt. "
                        f"Original error at position {error_pos}: {parse_error}. "
                        f"Repair error: {second_error}"
                    )
            
            # Validate response structure
            status = result.get('status')
            if not status:
                raise AIServiceException("Invalid response: missing 'status' field")
            
            if status == 'clarification':
                if 'question' not in result:
                    raise AIServiceException("Clarification response must have 'question' field")
                logger.info(f"Flash needs clarification: {result['question']}")
                return result
            
            if status == 'success':
                if 'site' not in result:
                    raise AIServiceException("Success response must have 'site' field")
                logger.info("Flash task processing complete - full site config returned")
                return result
            
            raise AIServiceException(f"Invalid status value: {status}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Flash response as JSON: {e}")
            raise AIServiceException(f"Invalid JSON response from Flash: {e}")
        except Exception as e:
            logger.error(f"Gemini API error in Flash processing: {e}")
            raise AIServiceException(f"Flash processing failed: {e}")




# Singleton instance for dependency injection
_flash_service = None


def get_flash_service() -> FlashAssessmentService:
    """Get or create Flash service instance (singleton)."""
    global _flash_service
    if _flash_service is None:
        _flash_service = FlashAssessmentService()
    return _flash_service


