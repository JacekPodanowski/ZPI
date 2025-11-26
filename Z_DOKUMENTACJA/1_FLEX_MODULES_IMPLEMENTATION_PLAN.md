# 🎨 Flexible Component Tree - Plan Implementacji

## 📋 Status: W trakcie realizacji

---

## Faza 1: Foundation

### Struktura plików
- [ ] Utworzyć `FRONTEND/src/SITES/components/modules/FlexibleModule/`
- [ ] Utworzyć `FlexibleRenderer.jsx` - core rendering engine
- [ ] Utworzyć folder `atoms/`
- [ ] Utworzyć folder `layouts/`
- [ ] Utworzyć folder `ui/`
- [ ] Utworzyć folder `utils/`

### Komponenty atomowe (atoms/)
- [ ] `EditableText.jsx` - reuse existing
- [ ] `EditableImage.jsx` - reuse existing
- [ ] `EditableButton.jsx` - NEW
- [ ] `EditableVideo.jsx` - NEW
- [ ] `Spacer.jsx` - NEW
- [ ] `Divider.jsx` - NEW
- [ ] `DataSlot.jsx` - NEW (dla modułów technicznych)

### Komponenty layoutowe (layouts/)
- [ ] `Container.jsx` - flex/grid container
- [ ] `Stack.jsx` - vertical/horizontal stack
- [ ] `Grid.jsx` - grid layout

### UI & Utils
- [ ] `ui/PlaceholderCard.jsx` - "+" card dla list w trybie edycji
- [ ] `utils/styleBuilder.js` - build CSS z props
- [ ] `utils/classNameBuilder.js` - build className strings

### Walidacja
- [ ] Podstawowa walidacja struktury (max depth, required ids, type checking)
- [ ] XSS protection w sanitizer

---

## Faza 2: Patterns & AI (1 tydzień)

### Wzorce modułów
- [ ] `patterns.js` - plik dla wszystkich szablonów
- [ ] Przygotować strukturę dla szablonów z legacy modułów

### AI Integration
- [ ] Zaktualizować AI system prompt z flexible system
- [ ] Dodać instrukcje dla modułów technicznych (data-slot)
- [ ] Dodać instrukcje dla placeholder cards w trybie edycji

### Walidacja & Bezpieczeństwo
- [ ] `validator.js` - pełna walidacja (depth, types, ids)
- [ ] `sanitizer.js` - usuwanie dangerous props
- [ ] Testy z AI (10+ różnych poleceń)

---

## Faza 3: Integration & Testing

### Integracja
- [ ] Integracja z `NewEditorPage`
- [ ] Update Zustand store dla flexible modules
- [ ] Responsive handling (mobile/tablet/desktop)
- [ ] Performance optimization

### Unit Tests
- [ ] Testy atomic components
- [ ] Testy layout components
- [ ] Testy validator
- [ ] Testy sanitizer
- [ ] Testy converter (wszystkie typy legacy)

### Integration Tests
- [ ] FlexibleRenderer - nested structures
- [ ] Editing updates (text, image, button)
- [ ] AI generates valid structures
- [ ] Legacy modules convert & render

### E2E Tests
- [ ] User edits text inline
- [ ] User changes images via Pexels
- [ ] User edits button text
- [ ] AI commands produce expected results
- [ ] Mobile responsive works

---

## Faza 4: Direct Migration (⚠️ BREAKING CHANGES)

### Przygotowanie
- [ ] Pełny backup DB przed migracją
- [ ] Lista wszystkich istniejących stron development
- [ ] Komunikacja z zespołem o breaking changes

### Template Creation (PRZED usunięciem!)
- [ ] `Hero/` → Stworzyć szablon flexible (hero_centered, hero_split) + wzięć style
- [ ] `Services/` → Stworzyć szablon flexible (services_grid) + wzięć style
- [ ] `About/` → Stworzyć szablon flexible (about_centered) + wzięć style
- [ ] `Gallery/` → Stworzyć szablon flexible (gallery_grid) + wzięć style
- [ ] `Contact/` → Stworzyć szablon flexible (contact_form) + wzięć style
- [ ] `Text/` → Stworzyć szablon flexible (text_block) + wzięć style
- [ ] `Video/` → Stworzyć szablon flexible (video_embed) + wzięć style
- [ ] `FAQ/` → Stworzyć szablon flexible (faq_accordion) + wzięć style
- [ ] `Testimonials/` → Stworzyć szablon flexible (testimonials_grid) + wzięć style
- [ ] Zapisać wszystkie szablony w `patterns.js`

### Usunięcie legacy code (PO utworzeniu szablonów!)
- [ ] ✅ Zweryfikować że wszystkie szablony są w `patterns.js`
- [ ] ✅ Przetestować każdy szablon (render + edit mode)
- [ ] Usunąć `Hero/` folder
- [ ] Usunąć `Services/` folder
- [ ] Usunąć `About/` folder
- [ ] Usunąć `Gallery/` folder
- [ ] Usunąć `Contact/` folder
- [ ] Usunąć `Text/` folder
- [ ] Usunąć `Video/` folder
- [ ] Usunąć `FAQ/` folder
- [ ] Usunąć `Testimonials/` folder
- [ ] Usunąć `_descriptors.js`

### Migracja istniejących stron
- [ ] Użyć gotowych szablonów z `patterns.js` dla każdej strony
- [ ] Ręczna migracja każdej development strony na nowy format
- [ ] Testy każdej zmigrowanej strony
- [ ] Update template defaults na flexible format (użyj szablonów)

### Weryfikacja
- [ ] Bundle size reduction verified (-64%)
- [ ] Code reduction verified (-70%)
- [ ] All tests passing
- [ ] Wszystkie dev strony działają na nowym systemie

---

**Ostatnia aktualizacja:** 2025-11-25
