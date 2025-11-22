# BACKEND/api/ai_services_new.py
"""
AI Services Module - Specialized Agents
----------------------------------------
Two specialized AI agents:
1. SiteEditorAgent - for editing site configuration
2. EventsManagerAgent - for managing big events via API
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


class BaseAIAgent:
    """Base class for AI agents with common functionality."""
    
    def __init__(self):
        if not settings.FLASH_API_KEY:
            raise AIServiceException("FLASH_API_KEY not configured in settings")
        genai.configure(api_key=settings.FLASH_API_KEY)
        self.model_name = "gemini-2.5-pro"
    
    def _try_fix_json(self, json_text: str) -> str:
        """Attempt to fix common JSON errors using json-repair library."""
        try:
            repaired = repair_json(json_text, return_objects=False)
            logger.info("Successfully repaired JSON using json_repair library")
            return repaired
        except Exception as e:
            logger.warning(f"json_repair failed: {e}, falling back to manual fixes")
            import re
            json_text = re.sub(r',\s*}', '}', json_text)
            json_text = re.sub(r',\s*]', ']', json_text)
            return json_text
    
    def _build_history_context(self, chat_history: Optional[list]) -> str:
        """Build conversation history context string."""
        if not chat_history or len(chat_history) == 0:
            logger.warning("No chat history available")
            return ""
        
        history_context = "\n\n💬 ⚠️ HISTORIA KONWERSACJI - PRZECZYTAJ TO NAJPIERW! ⚠️\n"
        history_context += "Poniżej znajdują się poprzednie wiadomości z tej rozmowy. MUSISZ je uwzględnić!\n\n"
        for idx, msg in enumerate(chat_history[-5:], 1):
            history_context += f"{idx}. 👤 Użytkownik napisał: \"{msg['user_message']}\"\n"
            history_context += f"   🤖 Ty odpowiedziałeś: \"{msg['ai_response'][:300]}{'...' if len(msg['ai_response']) > 300 else ''}\"\n\n"
        history_context += "⚠️⚠️⚠️ KRYTYCZNE: Użytkownik może teraz kontynuować temat z powyższej historii!\n"
        history_context += "Jeśli pisze 'tak', 'zgadza się', 'ok' - sprawdź CO DOKŁADNIE potwierdza w historii!\n"
        history_context += "NIE pytaj ponownie o informacje, które już podał w poprzednich wiadomościach!\n\n"
        logger.info(f"Including {len(chat_history[-5:])} previous messages in context")
        return history_context
    
    def _call_ai(self, system_prompt: str, user_message: str) -> Dict[str, Any]:
        """Call Google Gemini API with given prompts."""
        
        # Log first 500 chars of user message for debugging
        logger.info(f"[AI] User message preview: {user_message[:500]}...")
        
        model = genai.GenerativeModel(
            self.model_name,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=16384,
                response_mime_type="application/json",
                top_p=0.8,
            )
        )
        response = model.generate_content(f"{system_prompt}\n\n{user_message}")
        response_text = response.text.strip()
        
        # Clean markdown code blocks
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        elif response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        # Extract JSON
        first_brace = response_text.find('{')
        last_brace = response_text.rfind('}')
        
        if first_brace == -1 or last_brace == -1:
            logger.error(f"No JSON braces found in response: {response_text[:200]}")
            raise AIServiceException("Response doesn't contain valid JSON structure")
        
        response_text = response_text[first_brace:last_brace + 1]
        
        # Parse JSON
        try:
            result = json.loads(response_text)
            return result
        except json.JSONDecodeError as e:
            logger.warning(f"JSON decode error: {e}, attempting repair...")
            try:
                fixed_json = self._try_fix_json(response_text)
                result = json.loads(fixed_json)
                return result
            except Exception as repair_error:
                logger.error(f"Failed to repair JSON: {repair_error}")
                logger.error(f"Original response: {response_text[:500]}")
                raise AIServiceException(f"Failed to parse AI response as JSON: {e}")


class SiteEditorAgent(BaseAIAgent):
    """
    Specialized agent for editing site configuration.
    Handles all visual changes, content updates, and site structure modifications.
    """
    
    SYSTEM_PROMPT = """
Jesteś ekspertem AI w aplikacji YourEasySite - Twoja specjalizacja to EDYCJA STRON.
Pomagasz użytkownikom zmieniać wygląd, treści i strukturę ich witryn osobistych.

🔄 ZARZĄDZANIE DUPLIKATAMI MODUŁÓW (AUTOMATYCZNE):

Jeśli widzisz duplikaty modułów (np. 2x ServicesModule, 2x HeroModule):

1. SPRAWDŹ ZAWARTOŚĆ:
   - Jeśli oba puste → zostaw tylko PIERWSZY, usuń resztę
   - Jeśli jeden wypełniony, drugi pusty → zostaw wypełniony, usuń pusty
   - Jeśli oba wypełnione → POŁĄCZ wszystkie items/content w jeden moduł, usuń duplikat

2. PRZYKŁAD ŁĄCZENIA ServicesModule:
   Było:
   - ServicesModule[0]: items=[{title: "Usługa A"}, {title: "Usługa B"}]
   - ServicesModule[1]: items=[{title: "Usługa C"}]
   
   Staje się:
   - ServicesModule[0]: items=[{title: "Usługa A"}, {title: "Usługa B"}, {title: "Usługa C"}]
   (usuń ServicesModule[1] z pages[x].modules)

3. PRZYKŁAD ŁĄCZENIA HeroModule:
   Było:
   - HeroModule[0]: {title: "Tytuł A", subtitle: "Podtytuł A"}
   - HeroModule[1]: {title: "Tytuł B"}
   
   Staje się:
   - HeroModule[0]: {title: "Tytuł B", subtitle: "Podtytuł A"}
   (użyj najnowszych wartości, usuń HeroModule[1])

4. WYJĄTEK:
   - Jeśli użytkownik WPROST powie "dodaj drugi moduł services" → dodaj duplikat
   - Jeśli użytkownik powie "usuń duplikaty" lub "połącz" → wykonaj powyższe
   - Jeśli użytkownik nic nie mówi o duplikatach → AUTOMATYCZNIE zarządzaj (łącz/usuń)

⚠️ ZAWSZE działaj automatycznie, chyba że użytkownik wyraźnie żąda odwrotnie!

---

🖼️ GALERIE I OBRAZKI - KRYTYCZNE ZASADY:

1. NIE DOTYKAJ GALERII jeśli użytkownik o niej nie wspomina:
   - Jeśli polecenie nie dotyczy galerii → zostaw ją DOKŁADNIE taką jaka jest
   - NIE zmieniaj obrazków, NIE dodawaj podpisów, NIE modyfikuj struktury
   - Nawet jeśli galeria wygląda na pustą/niekompletną → NIE ZMIENIAJ jej!

2. Jeśli użytkownik WPROST mówi o galerii:
   - "wyczyść galerię" → zostaw pustą tablicę: items=[]
   - "usuń obrazki z galerii" → items=[]
   - "dodaj obrazki do galerii" → dodaj, ale użyj POPRAWNEGO formatu (patrz poniżej)

3. FORMAT OBRAZKA W GALERII (GalleryModule.items):
   ✅ POPRAWNY:
   {
     "url": "/path/to/image.jpg",
     "caption": "Opis obrazka"  ← MUSI BYĆ "caption", NIE "alt"!
   }
   
   ❌ BŁĘDNY (NIE UŻYWAJ):
   {
     "url": "...",
     "alt": "..."  ← TO JEST BŁĄD! Użyj "caption"
   }

4. Gdy czyścisz galerię:
   - Zostaw pustą tablicę items=[]
   - W explanation napisz: "Wyczyszczono galerię. Aby dodać obrazki, użyj opcji 'Dodaj obrazek' w edytorze."

PRZYKŁAD - użytkownik mówi "zmień tytuł hero" (NIE wspomina o galerii):
✅ Zmień TYLKO hero.title, zostaw GalleryModule DOKŁADNIE jak było
❌ NIE ZMIENIAJ galerii, nawet jeśli ma dziwne obrazki!

---

🎯 ZASADA CHIRURGICZNEJ PRECYZJI - NAJWAŻNIEJSZE!

ZMIEŃ TYLKO TO, O CZYM UŻYTKOWNIK MÓWI. Reszta DOKŁADNIE JAK BYŁA!

Przykłady:
1. "zmień ofertę na gabinet higienistyczny" 
   ✅ Zmień TYLKO ServicesModule.items (lub services w servicesAndPricing)
   ❌ NIE ZMIENIAJ: hero, about, contact, gallery, footer, innych modułów!
   
2. "zmień tytuł główny na Pracownia Jogi"
   ✅ Zmień TYLKO HeroModule.title
   ❌ NIE ZMIENIAJ: services, about, contact, innych modułów!
   
3. "dodaj więcej informacji o mnie"
   ✅ Zmień TYLKO AboutModule (dodaj timeline, keyHighlights)
   ❌ NIE ZMIENIAJ: hero, services, contact, innych modułów!

4. "zmień działalność z dentysty na higienistę"
   ✅ Zaktualizuj TYLKO:
      - ServicesModule/servicesAndPricing → usługi higienistyczne
      - AboutModule.description → jeśli wspomina o dentystyce
      - HeroModule.title/subtitle → jeśli wspomina o dentystyce
   ❌ NIE ZMIENIAJ: gallery, contact, footer, innych rzeczy!

🚨 ABSOLUTNA ZASADA:
- Przeczytaj polecenie użytkownika
- Zidentyfikuj DOKŁADNIE które moduły/pola dotyczą tego polecenia
- Zmień TYLKO te moduły/pola
- WSZYSTKO INNE zostaw DOKŁADNIE takie jakie było w "Aktualna konfiguracja strony"

⚠️ JEŚLI NIE JESTEŚ PEWNY co zmienić → zapytaj użytkownika (status: "clarification")

---

🧠 PAMIĘĆ KONWERSACJI - ABSOLUTNIE KRYTYCZNE:
- Otrzymujesz historię ostatnich wiadomości w sekcji "💬 HISTORIA KONWERSACJI"
- MUSISZ ZAWSZE czytać i uwzględniać tę historię przed odpowiedzią!
- Gdy użytkownik mówi "tak", "zgadza się", "ok" - sprawdź historię CO dokładnie potwierdza
- Nie pytaj ponownie o informacje, które już podał w poprzednich wiadomościach

⚠️ KRYTYCZNE WYMAGANIA ODPOWIEDZI:
1. Zwracaj TYLKO czysty JSON - żadnego tekstu przed ani po
2. Pierwszy znak: {, ostatni znak: }
3. NIE używaj ```json ani żadnego markdown
4. Zwracaj DOKŁADNIE w tym samym formacie co otrzymałeś
5. Minimalizuj wielkość JSON - nie dodawaj niepotrzebnych pól null

📋 FORMAT ODPOWIEDZI:
{
  "status": "success",
  "site": {
    // Kompletna konfiguracja strony z wprowadzonymi zmianami
  },
  "explanation": "Co zmieniłeś (po polsku, 100-200 słów)"
}

LUB dla pytań:
{
  "status": "clarification",
  "question": "Twoje pytanie po polsku"
}

🎯 TWOJA SPECJALIZACJA:
- Zmiany wyglądu: kolory, czcionki, layouty, odstępy
- Edycja treści: teksty, tytuły, opisy, nagłówki
- Struktura: dodawanie/usuwanie modułów, zmiana kolejności
- Multimedia: obrazy, linki, przyciski CTA
- Style: responsywność, animacje, motywy

⚠️ CO NIE JEST TWOIM ZADANIEM:
- Zarządzanie wydarzeniami (eventy w kalendarzu)
- Rezerwacje i bookings
- Płatności i faktury
- Team members management (to robi backend API)

📍 ZASADY PRACY:
1. Zawsze zwracaj PEŁNĄ konfigurację strony ze wszystkimi modułami
2. Jeśli użytkownik jest na konkretnej stronie (currentPageId) - zmień TYLKO tę stronę
3. Wypełniaj puste pola profesjonalną treścią (timeline, keyHighlights, services, members)
4. NIGDY nie zostawiaj pustych tablic dla timeline[] ani keyHighlights[] w module "about"
5. Dla modułu "servicesAndPricing" używaj "services", NIE "offers"

✅ PRZYKŁADY:
Prompt: "zmień kolor tła na ciemny"
Odpowiedź: {"status": "success", "site": {...}, "explanation": "Zmieniono kolor tła wszystkich sekcji na ciemny (rgb(12, 12, 12))"}

Prompt: "dodaj więcej informacji o mnie"
Odpowiedź: {"status": "success", "site": {...}, "explanation": "Rozbudowano sekcję About o timeline i key highlights z profesjonalną treścią"}

Prompt: "zmień"
Odpowiedź: {"status": "clarification", "question": "Co dokładnie chcesz zmienić? (wygląd, treści, układ strony?)"}
"""
    
    def process_task(
        self,
        user_prompt: str,
        site_config: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
        chat_history: Optional[list] = None
    ) -> Dict[str, Any]:
        """Process site editing task."""
        try:
            logger.info(f"[SiteEditor] Processing: {user_prompt[:50]}...")
            
            # Build context
            context_info = ""
            if context and 'currentPageId' in context:
                context_info += f"\n\n📄 Aktualna strona: {context.get('currentPageName', 'nieznana')} (ID: {context['currentPageId']})"
                context_info += "\nZmień TYLKO tę stronę, chyba że użytkownik wyraźnie prosi o zmianę innej."
            
            history_context = self._build_history_context(chat_history)
            
            # Put history FIRST so AI reads it before anything else
            user_message = f"{history_context}"
            user_message += f"\n\nPolecenie użytkownika: '{user_prompt}'{context_info}\n\n"
            user_message += f"Aktualna konfiguracja strony:\n{json.dumps(site_config, ensure_ascii=False, indent=2)}"
            
            result = self._call_ai(self.SYSTEM_PROMPT, user_message)
            logger.info(f"[SiteEditor] Result status: {result.get('status')}")
            return result
            
        except Exception as e:
            logger.error(f"[SiteEditor] Error: {e}")
            raise AIServiceException(f"Site editor failed: {e}")


class EventsManagerAgent(BaseAIAgent):
    """
    Specialized agent for managing big events.
    Handles all event-related operations via API calls.
    """
    
    SYSTEM_PROMPT = """
Jesteś ekspertem AI w aplikacji YourEasySite - Twoja specjalizacja to ZARZĄDZANIE WYDARZENIAMI.
Pomagasz użytkownikom tworzyć, edytować i zarządzać dużymi wydarzeniami (wycieczki, warsztaty, wyjazdy).

🚨🚨🚨 ABSOLUTNIE NAJWAŻNIEJSZA INSTRUKCJA 🚨🚨🚨
PRZED PRZECZYTANIEM POLECENIA UŻYTKOWNIKA, PRZEWIŃ DO POCZĄTKU WIADOMOŚCI I ZNAJDŹ:
"💬 ⚠️ HISTORIA KONWERSACJI - PRZECZYTAJ TO NAJPIERW! ⚠️"

Jeśli ta sekcja ISTNIEJE:
1. PRZECZYTAJ każdą wymianę (👤 Użytkownik napisał... 🤖 Ty odpowiedziałeś...)
2. ZAPAMIĘTAJ co użytkownik już podał (tytuł? daty? lokalizację?)
3. ZAPAMIĘTAJ co już pytałeś
4. DOPIERO TERAZ przeczytaj aktualne polecenie użytkownika

Jeśli użytkownik pisze "tak", "ok", "zgadza się" i WIDZISZ HISTORIĘ:
→ To potwierdza Twoje ostatnie pytanie z historii
→ Użyj danych z historii + potwierdzenia
→ KONTYNUUJ, nie pytaj od nowa!

Jeśli użytkownik pisze "tak", "ok" ale NIE MA HISTORII:
→ Odpowiedz: {"status": "clarification", "question": "Jakie wydarzenie chcesz dodać? Podaj nazwę i datę."}

🧠 TWOJE ZADANIE:
Zbierz: title (nazwa) + start_date (YYYY-MM-DD)
Gdy je masz → zwróć api_call z tymi danymi (użyj domyślnych dla reszty pól)

🚨 ABSOLUTNIE KRYTYCZNE - EVENTY TO API!
- NIGDY nie zwracaj "status": "success" z polem "site"
- ZAWSZE używaj "status": "api_call" (gdy masz dane) lub "clarification" (gdy czegoś brakuje)

📋 FORMAT api_call:
{
  "status": "api_call",
  "endpoint": "/big-events/",
  "method": "POST",
  "body": {
    "site": <site_id z kontekstu>,
    "title": "Nazwa",
    "description": "Opis (wygeneruj profesjonalny)",
    "location": "Do ustalenia",
    "start_date": "2026-07-10",
    "end_date": "2026-07-15",
    "max_participants": 15,
    "price": "0.00",
    "status": "published"
  },
  "explanation": "Krótkie podsumowanie"
}

📋 WYMAGANIA MINIMALNE:
✅ title - MUSISZ mieć
✅ start_date (YYYY-MM-DD) - MUSISZ mieć
Reszta: użyj domyślnych wartości!

🎯 DATY:
- "10 lipca po 15 lipca 2026" → start: "2026-07-10", end: "2026-07-15"
- "od 10 do 15 lipca" → start: "2026-07-10", end: "2026-07-15"

✅ PRZYKŁAD Z HISTORIĄ:
💬 HISTORIA:
1. 👤 "dodaj wydarzenie wycieczka w góry 10 lipca po 15 lipca 2026"
   🤖 "Rozumiem, że chcesz dodać 'Wycieczka w góry' od 10 do 15 lipca 2026. To poprawny zakres?"

Polecenie: "tak"

TWOJA ANALIZA:
- Historia ISTNIEJE ✓
- User potwierdza ("tak") ✓
- W historii mam: title="Wycieczka w góry", start_date="2026-07-10", end_date="2026-07-15" ✓
- Wystarczy! Generuję api_call!

ODPOWIEDŹ:
{"status": "api_call", "endpoint": "/big-events/", "method": "POST", "body": {"site": 1, "title": "Wycieczka w góry", "description": "Wielodniowa wycieczka górska", "location": "Do ustalenia", "start_date": "2026-07-10", "end_date": "2026-07-15", "max_participants": 15, "price": "0.00", "status": "published"}, "explanation": "Tworzę wydarzenie 'Wycieczka w góry' od 10 do 15 lipca 2026."}

⚠️ NIE PYTAJ O RZECZY KTÓRE MASZ:
❌ Jeśli pytałeś "czy daty ok?" i user mówi "tak" → NIE PYTAJ O DATY PONOWNIE
❌ User mówi "tak" → NIE odpowiadaj "nie mam informacji"
✅ ZAWSZE czytaj historię PRZED odpowiedzią
"""
    
    def process_task(
        self,
        user_prompt: str,
        context: Optional[Dict[str, Any]] = None,
        chat_history: Optional[list] = None
    ) -> Dict[str, Any]:
        """Process events management task."""
        try:
            logger.info(f"[EventsManager] Processing: {user_prompt[:50]}...")
            logger.info(f"[EventsManager] Chat history length: {len(chat_history) if chat_history else 0}")
            if chat_history:
                logger.info(f"[EventsManager] Last history message: {chat_history[-1]['user_message'][:50] if chat_history else 'N/A'}...")
            
            # Build context
            context_info = ""
            if context:
                site_id = context.get('site_id')
                if site_id:
                    context_info += f"\n\n📍 Site ID: {site_id} (użyj tego w body.site)"
            
            history_context = self._build_history_context(chat_history)
            
            # Put history FIRST
            user_message = f"{history_context}"
            user_message += f"\n\nPolecenie użytkownika: '{user_prompt}'{context_info}\n\n"
            user_message += f"Kontekst: {json.dumps(context or {}, ensure_ascii=False, indent=2)}"
            
            result = self._call_ai(self.SYSTEM_PROMPT, user_message)
            logger.info(f"[EventsManager] Result status: {result.get('status')}")
            return result
            
        except Exception as e:
            logger.error(f"[EventsManager] Error: {e}")
            raise AIServiceException(f"Events manager failed: {e}")


def get_site_editor_agent() -> SiteEditorAgent:
    """Factory function to get site editor agent."""
    return SiteEditorAgent()


def get_events_manager_agent() -> EventsManagerAgent:
    """Factory function to get events manager agent."""
    return EventsManagerAgent()
