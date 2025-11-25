🎨 Flexible Component Tree System
🎯 Zamysł
Obecny system modułów jest sztywny - AI może tylko zmieniać wartości w predefiniowanych layoutach. Nowy system Flexible Component Tree daje AI pełną kontrolę nad strukturą modułów poprzez drzewo komponentów atomowych, zachowując edytowalność dla użytkownika.
Kluczowa różnica:

Teraz: Moduł = stały React component → AI zmienia tylko { title: "Nowy tytuł" }
Cel: Moduł = drzewo atomów → AI może dodać drugi przycisk, zmienić layout na 3 kolumny, przebudować całą strukturę

Architektura:
javascript// Flexible structure - AI może całkowicie przebudować
structure: {
  type: 'container',
  layout: 'grid',
  columns: 2,
  children: [
    { type: 'text', tag: 'h1', value: 'Tytuł', id: 'title' },
    { type: 'image', src: '/img.jpg', id: 'img' },
    { type: 'button', text: 'CTA', link: '#', id: 'cta' }
  ]
}
```

**3 poziomy komponentów:**
1. **Atomy** (edytowalne): text, image, button, video, spacer, divider
2. **Layouty** (kontenery): container, stack, grid
3. **Wzorce** (presets dla AI): hero_centered, hero_split, services_grid

---

## ⚠️ KATEGORIE MODUŁÓW

Wszystkie moduły dzielimy na dwie kategorie:

### 🎨 **DEKORACYJNE** (Flexible - pełna swoboda AI)
Moduły, które zawierają tylko statyczną treść i można je całkowicie przebudować:
- Hero, About, Services, Gallery, Contact, Text, Video, FAQ, Testimonials, Button, Spacer

**AI może:**
- Zmieniać strukturę, layout, liczę kolumn
- Dodawać/usuwać elementy (text, image, button)
- Całkowicie przebudowywać drzewo komponentów

### ⚙️ **TECHNICZNE** (Flexible wrapper + API protection)
Moduły, które **pobierają dane z backendu** - mają **pełną edytowalność wyglądu** + **chronioną logikę API**:
- **Events** - pobiera wydarzenia z API (`fetchPublicBigEvents`, `fetchBigEvents`)
- **Calendar_Compact** - wyświetla kalendarz z wydarzeniami
- **Caldenar_Full** - pełny kalendarz z bookingami
- **Team** - pobiera członków zespołu z API (`/api/v1/public-sites/{siteId}/team/`)
- **Newsletter** - formularz zapisu (integracja z backend)
- **Blog** - pobiera wpisy z API

**🎯 NOWA ARCHITEKTURA - Moduły techniczne są w pełni edytowalne!**

Moduł techniczny = **Flexible wrapper** + **Protected data source**

```javascript
// Struktura modułu technicznego
{
  type: 'events',  // ← Typ określa źródło danych (API)
  
  // ✅ FLEXIBLE STRUCTURE - pełna edytowalność layoutu!
  structure: {
    type: 'container',
    padding: '4rem 2rem',
    bgColor: '#f5f5f5',
    children: [
      { type: 'text', tag: 'h2', value: 'Nadchodzące Wydarzenia', id: 'events-title' },
      { 
        type: 'grid',
        columns: 3,
        gap: '2rem',
        children: [
          // 🔒 PROTECTED SLOT - dane z API
          { type: 'data-slot', source: 'events', layout: 'card' }
        ]
      }
    ]
  },
  
  // 🔒 PROTECTED CONFIG - nie dotykaj!
  dataSource: {
    type: 'api',
    endpoint: 'events',
    requiresAuth: false,
    props: ['siteId', 'siteIdentifier']  // ← Automatycznie przekazywane
  }
}
```

**⚠️ KRYTYCZNE ZASADY dla modułów technicznych:**

1. **Flexible structure** - AI może zmieniać CAŁY layout (kolory, padding, kolumny, czcionki)
2. **Data slot** - specjalny typ `{ type: 'data-slot', source: 'events' }` rezerwuje miejsce na dane z API
3. **Protected dataSource** - AI NIE MOŻE zmieniać sekcji `dataSource` (endpoint, props, auth)
4. **Props automatyczne** - `siteId`, `siteIdentifier` przekazywane przez system, niewidoczne dla AI

---

## 📋 Instrukcje dla AI - Moduły Techniczne

Moduły techniczne mają **pełną edytowalność layoutu** poprzez `structure`, ale **chronioną logikę API** poprzez `dataSource`.

### Przykłady edycji:

```javascript
// ❌ NIE RÓB TEGO - usunięcie data-slot
{
  type: 'events',
  structure: {
    type: 'container',
    children: [
      { type: 'text', value: 'Events' }  // ❌ Brak data-slot - dane z API nie będą renderowane!
    ]
  }
}

// ✅ DOBRZE - zmiana layoutu + zachowanie data-slot
{
  type: 'events',
  structure: {
    type: 'container',
    padding: '6rem 3rem',  // ← Zmieniony padding
    bgColor: '#1a1a1a',    // ← Zmieniony kolor tła
    children: [
      { 
        type: 'text', 
        tag: 'h1',  // ← Zmieniony tag (h2 → h1)
        value: 'Nasze Najlepsze Wydarzenia', 
        id: 'events-title',
        style: { color: '#fff', fontSize: '3rem' }  // ← Nowy styl
      },
      { 
        type: 'grid',
        columns: 2,  // ← Zmieniona liczba kolumn (3 → 2)
        gap: '3rem',
        children: [
          { type: 'data-slot', source: 'events', layout: 'card' }  // ← ZACHOWANE!
        ]
      }
    ]
  },
  dataSource: { /* NIE DOTYKAJ */ }
}
```

### 📚 Instrukcje obsługi modułów technicznych:

**Events:**
- **API:** `fetchPublicBigEvents(siteIdentifier)` lub `fetchBigEvents()` (w edytorze)
- **Data structure:** `{ id, title, date, location, summary, images[], ctaLabel, ctaUrl }`
- **Data-slot:** `{ type: 'data-slot', source: 'events', layout: 'card'|'list'|'timeline' }`
- **Edytowalne:** padding, colors, fonts, columns, title, subtitle, filters UI
- **Chronione:** endpoint, siteId, siteIdentifier, fetching logic

**Team:**
- **API:** `/api/v1/public-sites/{siteId}/team/`
- **Data structure:** `{ id, name, role, bio, photo, email, phone }`
- **Data-slot:** `{ type: 'data-slot', source: 'team', layout: 'grid'|'list' }`
- **Edytowalne:** layout, colors, card design, spacing
- **Chronione:** API endpoint, siteId

**Calendar_Compact & Caldenar_Full:**
- **API:** Wydarzenia z systemu bookingu
- **Data-slot:** `{ type: 'data-slot', source: 'calendar' }`
- **Edytowalne:** colors, size, fonts, position
- **Chronione:** calendar logic, booking system integration

**Newsletter:**
- **API:** POST do backend (zapis subskrybenta)
- **Data-slot:** `{ type: 'data-slot', source: 'newsletter-form' }`
- **Edytowalne:** layout, texts, colors, button style
- **Chronione:** form submission logic, validation

**Blog:**
- **API:** Pobieranie wpisów z backend
- **Data-slot:** `{ type: 'data-slot', source: 'blog-posts', layout: 'grid'|'list' }`
- **Edytowalne:** post card design, layout, filters
- **Chronione:** API calls, post fetching

---

## 🎨 Tryby Edytora

Edytor działa w **dwóch trybach**:

### 1. **Podgląd Prawdziwy** (`isEditing: false`)
- Renderuje stronę dokładnie tak, jak widzi ją użytkownik końcowy
- Wszystkie dane z API są prawdziwe
- Brak UI edycyjnego (brak obramowań, hover states, placeholder cards)
- Używany do: preview przed publikacją, testy responsywności

### 2. **Tryb Edycji** (`isEditing: true`)
- Renderuje stronę + **UI edycyjne**
- Dodatkowe elementy pomocnicze:
  - **Placeholder cards z "+"** - na końcu list (oferty, team, testimonials)
  - Obramowania edytowalnych elementów (hover)
  - Tooltips z informacjami o module
  - "Add new" buttons

**🔧 Placeholder Cards - zasada:**

Dla **każdego modułu z listą elementów** (Services, Team, Testimonials, FAQ, Gallery):
- W trybie edycji (`isEditing: true`) → na końcu listy renderuj **pustą kartę z "+"**
- Kliknięcie → otwiera modal/panel do dodania nowego elementu
- Design: semi-transparent, dashed border, centered "+" icon

**Przykład - Services:**
```jsx
const ServicesGrid = ({ services, isEditing }) => (
  <Grid columns={3}>
    {services.map(service => <ServiceCard {...service} />)}
    
    {/* ✅ PLACEHOLDER w trybie edycji */}
    {isEditing && (
      <PlaceholderCard 
        icon="+"
        label="Dodaj usługę"
        onClick={() => openAddServiceModal()}
      />
    )}
  </Grid>
);
```

**Gdzie stosować placeholder cards:**
- ✅ **Services** (lista usług) → "+ Dodaj usługę"
- ✅ **Team** (członkowie zespołu) → "+ Dodaj członka"
- ✅ **Testimonials** (opinie) → "+ Dodaj opinię"
- ✅ **FAQ** (pytania) → "+ Dodaj pytanie"
- ✅ **Gallery** (zdjęcia) → "+ Dodaj zdjęcie"
- ✅ **Events** (jeśli static content) → "+ Dodaj wydarzenie"
- ✅ **Blog** (jeśli static content) → "+ Dodaj wpis"
- ❌ **Hero, About, Text, Video** (pojedyncze komponenty - nie listy)

**Pełna lista props chronionych (automatyczne przekazywanie):**
- `siteId` - ID strony (dla prywatnych API)
- `siteIdentifier` - identyfikator strony (dla publicznych API)
- `isEditing` - tryb edycji (kontroluje UI placeholders)
- `moduleId`, `pageId` - identyfikatory dla edycji inline

---

## 📝 Plan Implementacji

### Faza 1: Foundation (1-2 tygodnie)

**Cel:** Zbudować rendering engine i komponenty atomowe

**Struktura plików:**
```
FRONTEND/src/SITES/components/modules/
├── FlexibleModule/
│   ├── index.jsx                     # Main entry
│   ├── FlexibleRenderer.jsx          # Core rendering engine
│   ├── atoms/
│   │   ├── EditableText.jsx          # Reuse existing
│   │   ├── EditableImage.jsx         # Reuse existing
│   │   ├── EditableButton.jsx        # NEW
│   │   ├── EditableVideo.jsx         # NEW
│   │   ├── Spacer.jsx                # NEW
│   │   ├── Divider.jsx               # NEW
│   │   └── DataSlot.jsx              # NEW (for technical modules)
│   ├── layouts/
│   │   ├── Container.jsx             # NEW (flex/grid)
│   │   ├── Stack.jsx                 # NEW (vertical/horizontal)
│   │   └── Grid.jsx                  # NEW
│   ├── ui/
│   │   └── PlaceholderCard.jsx       # NEW (for edit mode lists)
│   └── utils/
│       ├── styleBuilder.js           # Build CSS from props
│       └── classNameBuilder.js       # Build className strings
**Tasks:**

✅ FlexibleRenderer.jsx - recursive rendering engine
✅ Atomic components (6 komponentów)
✅ Layout components (3 kontenery)
✅ DataSlot.jsx - renderowanie danych z API w technical modules
✅ PlaceholderCard.jsx - "+" card dla list w trybie edycji
✅ Style & className builders
✅ Podstawowa walidacja struktury

**Core Implementation:**
```jsx
// FlexibleRenderer.jsx
const FlexibleRenderer = ({ structure, isEditing, moduleId, pageId, siteId, siteIdentifier }) => {
  const renderElement = (element, path) => {
    const elementId = `${moduleId}-${element.id || path}`;
    
    // DATA SLOT - dane z API (technical modules)
    if (element.type === 'data-slot') {
      return (
        <DataSlot
          key={elementId}
          source={element.source}
          layout={element.layout}
          siteId={siteId}
          siteIdentifier={siteIdentifier}
          isEditing={isEditing}
        />
      );
    }
    
    // ATOM - edytowalny element
    if (ATOMIC_COMPONENTS[element.type]) {
      const AtomicComponent = ATOMIC_COMPONENTS[element.type];
      return (
        <AtomicComponent
          key={elementId}
          elementId={elementId}
          isEditing={isEditing}
          {...element}
          onSave={(newValue) => handleUpdate(path, newValue)}
        />
      );
    }
    
    // LAYOUT - kontener
    if (LAYOUT_COMPONENTS[element.type]) {
      const LayoutComponent = LAYOUT_COMPONENTS[element.type];
      return (
        <LayoutComponent key={elementId} {...element}>
          {element.children?.map((child, idx) => 
            renderElement(child, `${path}.children[${idx}]`)
          )}
        </LayoutComponent>
      );
    }
    
    return null;
  };
  
  return renderElement(structure, 'root');
};
```

```jsx
// atoms/DataSlot.jsx
const DataSlot = ({ source, layout, siteId, siteIdentifier, isEditing }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch data based on source type
    const fetchData = async () => {
      switch (source) {
        case 'events':
          const events = await fetchPublicBigEvents(siteIdentifier);
          setData(events);
          break;
        case 'team':
          const team = await fetch(`/api/v1/public-sites/${siteId}/team/`);
          setData(await team.json());
          break;
        // ... other sources
      }
      setLoading(false);
    };
    
    fetchData();
  }, [source, siteId, siteIdentifier]);
  
  if (loading) return <LoadingSpinner />;
  
  // Render data based on layout
  return (
    <>
      {data.map(item => (
        <DataCard key={item.id} data={item} layout={layout} source={source} />
      ))}
      
      {/* ✅ PLACEHOLDER w trybie edycji */}
      {isEditing && (
        <PlaceholderCard 
          label={`Dodaj ${getSourceLabel(source)}`}
          onClick={() => handleAddNew(source)}
        />
      )}
    </>
  );
};
```

```jsx
// ui/PlaceholderCard.jsx
const PlaceholderCard = ({ label, onClick, icon = '+' }) => {
  return (
    <div 
      className="placeholder-card"
      onClick={onClick}
      style={{
        border: '2px dashed rgba(var(--accent-rgb), 0.3)',
        backgroundColor: 'rgba(var(--accent-rgb), 0.05)',
        borderRadius: '12px',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minHeight: '200px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.6)';
        e.currentTarget.style.backgroundColor = 'rgba(var(--accent-rgb), 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.3)';
        e.currentTarget.style.backgroundColor = 'rgba(var(--accent-rgb), 0.05)';
      }}
    >
      <div style={{ 
        fontSize: '3rem', 
        color: 'var(--accent-color)',
        marginBottom: '1rem' 
      }}>
        {icon}
      </div>
      <span style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '1rem' 
      }}>
        {label}
      </span>
    </div>
  );
};
```

```jsx// layouts/Container.jsx
const Container = ({ 
  children, 
  layout = 'flex',
  direction = 'column',
  columns,
  gap = '1rem',
  align,
  justify,
  padding,
  bgColor,
  bgImage,
  ...props 
}) => {
  const containerStyle = {
    display: layout === 'grid' ? 'grid' : 'flex',
    flexDirection: layout === 'flex' ? direction : undefined,
    gridTemplateColumns: columns ? `repeat(${columns}, 1fr)` : undefined,
    gap,
    alignItems: align,
    justifyContent: justify,
    padding,
    backgroundColor: bgColor,
    backgroundImage: bgImage ? `url(${bgImage})` : undefined,
    backgroundSize: bgImage ? 'cover' : undefined,
    backgroundPosition: bgImage ? 'center' : undefined,
  };
  
  return <div style={containerStyle} {...props}>{children}</div>;
};

Faza 2: Patterns & AI (1 tydzień)
Cel: Przygotować AI do pracy z flexible system
Tasks:

 Zdefiniować wzorce modułów w patterns.js
 Zaktualizować AI prompt z flexible system
 Validator: max depth, required ids, type checking
 Sanitizer: XSS protection, dangerous props removal
 Testy z AI (10+ różnych poleceń)

Wzorce dla AI:
javascript// patterns.js
export const MODULE_PATTERNS = {
  hero_centered: {
    name: 'Centered Hero',
    description: 'Centered hero with title, subtitle, and CTA',
    structure: {
      type: 'container',
      layout: 'flex',
      direction: 'column',
      align: 'center',
      padding: '4rem 2rem',
      children: [
        { type: 'text', tag: 'h1', value: 'Main Title', id: 'hero-title' },
        { type: 'text', tag: 'p', value: 'Subtitle', id: 'hero-subtitle' },
        { type: 'button', text: 'Get Started', id: 'hero-cta' }
      ]
    }
  },
  
  hero_split: {
    name: 'Split Hero',
    description: 'Two-column hero: text left, image right',
    structure: {
      type: 'container',
      layout: 'grid',
      columns: 2,
      gap: '2rem',
      children: [
        {
          type: 'stack',
          direction: 'column',
          children: [
            { type: 'text', tag: 'h1', value: 'Title', id: 'hero-title' },
            { type: 'button', text: 'CTA', id: 'hero-cta' }
          ]
        },
        { type: 'image', src: '/hero.jpg', id: 'hero-image' }
      ]
    }
  },
  
  services_grid: {
    name: 'Services Grid',
    description: '3-column services with image, title, description',
    structure: {
      type: 'container',
      padding: '4rem 2rem',
      children: [
        { type: 'text', tag: 'h2', value: 'Our Services', id: 'services-title' },
        {
          type: 'grid',
          columns: 3,
          gap: '2rem',
          children: [
            {
              type: 'stack',
              direction: 'column',
              children: [
                { type: 'image', src: '/s1.jpg', id: 's1-img' },
                { type: 'text', tag: 'h3', value: 'Service 1', id: 's1-title' },
                { type: 'text', tag: 'p', value: 'Description', id: 's1-desc' }
              ]
            }
            // ... more services
          ]
        }
      ]
    }
  }
};
AI System Prompt:
javascriptconst AI_SYSTEM_PROMPT = `
🏗️ FLEXIBLE COMPONENT TREE - Full Structure Control

You can COMPLETELY REBUILD module structure using component tree.

⚠️ MODULE CATEGORIES - CRITICAL:

🎨 DECORATIVE MODULES (full freedom):
- hero, about, services, gallery, contact, text, video, faq, testimonials, button, spacer
- You can COMPLETELY REBUILD these using 'flexible' type
- Change layout, add/remove elements, restructure freely

⚙️ TECHNICAL MODULES (flexible wrapper + protected API):
- events, calendar_compact, caldenar_full, team, newsletter, blog
- These fetch data from backend API
- Use 'flexible' structure for FULL LAYOUT CONTROL
- MUST include { type: 'data-slot', source: '<module-type>' } to render API data
- NEVER edit 'dataSource' section (endpoint, props, auth)
- Props (siteId, siteIdentifier, isEditing) are auto-passed, don't worry about them

Example - Technical module editing:
❌ WRONG: 
{
  type: 'events',
  structure: { 
    children: [{ type: 'text', value: 'Events' }]  // Missing data-slot!
  }
}

✅ RIGHT:
{
  type: 'events',
  structure: {
    type: 'container',
    padding: '6rem 3rem',  // ← Change styles freely
    bgColor: '#1a1a1a',
    children: [
      { type: 'text', tag: 'h1', value: 'Our Events', id: 'title' },
      { 
        type: 'grid', 
        columns: 2,  // ← Change layout freely
        children: [
          { type: 'data-slot', source: 'events', layout: 'card' }  // ← REQUIRED!
        ]
      }
    ]
  },
  dataSource: { /* DON'T TOUCH */ }
}

🎨 EDITOR MODES:

isEditing: false (Real Preview)
- Render exact user-facing site
- No editing UI, no placeholders

isEditing: true (Edit Mode)
- Render site + editing UI
- For list modules (services, team, testimonials, faq, gallery):
  → Add placeholder card with "+" at the end of list
  → Example: [Service 1] [Service 2] [Service 3] [+ Add Service]

📦 AVAILABLE COMPONENTS (for DECORATIVE modules only):

ATOMS (always editable):
- text: { type: 'text', tag: 'h1'|'h2'|'p', value: '...', id: 'unique-id' }
- image: { type: 'image', src: '/path.jpg', alt: '...', id: 'unique-id' }
- button: { type: 'button', text: 'Click', link: '#', id: 'unique-id' }
- video: { type: 'video', src: '/video.mp4', id: 'unique-id' }
- spacer: { type: 'spacer', height: '2rem' }
- divider: { type: 'divider', color: '#ccc' }

LAYOUTS (containers):
- container: { type: 'container', layout: 'flex'|'grid', columns: 2, gap: '2rem', children: [...] }
- stack: { type: 'stack', direction: 'column'|'row', spacing: '1rem', children: [...] }
- grid: { type: 'grid', columns: 3, gap: '1rem', children: [...] }

⚠️ RULES:
1. EVERY text/image/button MUST have unique 'id'
2. Use SEMANTIC tags: h1 for main title, h2 for subtitles, p for paragraphs
3. Max nesting: 5 levels
4. Always keep editable elements

🎯 EXAMPLES:

"add second CTA button" → add second { type: 'button', ... }
"make hero 3 columns" → container with columns: 3
"text left, 2 images right" → grid with asymmetric columns
"add separator" → { type: 'divider' }

📋 RESPONSE FORMAT:

{
  "status": "success",
  "site": {
    "pages": [{
      "modules": [{
        "type": "flexible",
        "structure": { type: 'container', children: [...] }
      }]
    }]
  }
}
`;
Validator & Sanitizer:
javascript// validator.js
export const validateStructure = (structure, depth = 0) => {
  const MAX_DEPTH = 5;
  const VALID_TYPES = ['container', 'stack', 'grid', 'text', 'image', 'button', 'video', 'spacer', 'divider'];
  const EDITABLE_TYPES = ['text', 'image', 'button', 'video'];
  
  if (depth > MAX_DEPTH) {
    throw new Error(`Max nesting depth (${MAX_DEPTH}) exceeded`);
  }
  
  if (!VALID_TYPES.includes(structure.type)) {
    throw new Error(`Invalid component type: ${structure.type}`);
  }
  
  if (EDITABLE_TYPES.includes(structure.type) && !structure.id) {
    throw new Error(`Editable element ${structure.type} must have unique "id"`);
  }
  
  if (structure.children) {
    structure.children.forEach(child => validateStructure(child, depth + 1));
  }
  
  return true;
};

// sanitizer.js
export const sanitizeStructure = (structure) => {
  const DANGEROUS_PROPS = ['dangerouslySetInnerHTML', 'onClick', 'onLoad', 'onError'];
  
  const clean = (node) => {
    DANGEROUS_PROPS.forEach(prop => delete node[prop]);
    
    if (node.style && typeof node.style === 'object') {
      Object.keys(node.style).forEach(key => {
        const value = node.style[key];
        if (typeof value === 'string') {
          if (value.toLowerCase().includes('javascript:') || 
              value.toLowerCase().includes('expression(')) {
            delete node.style[key];
          }
        }
      });
    }
    
    if (node.children) {
      node.children = node.children.map(clean);
    }
    
    return node;
  };
  
  return clean(JSON.parse(JSON.stringify(structure)));
};

### Faza 3: Migration System (1 tydzień)
**Cel:** Automatyczna konwersja legacy → flexible

**Strategia:**
- Legacy moduły **dekoracyjne** są automatycznie konwertowane przy renderingu
- Moduły **techniczne** (events, calendar, team) **NIE SĄ KONWERTOWANE** - pozostają w oryginalnej formie
- AI pracuje z flexible format dla dekoracyjnych, z legacy format dla technicznych
- Gdy AI zmieni moduł dekoracyjny → zapisujemy w flexible format
- Gdy AI zmieni moduł techniczny → zapisujemy w legacy format (tylko content/layout)

**Tasks:**
- ✅ Napisać `convertLegacyToFlexible()` **TYLKO** dla modułów dekoracyjnych
- ✅ Backend: `prepareForAI()` - konwersja przed wysłaniem do AI
- ✅ Frontend: `ModuleRenderer` obsługuje oba formaty (auto-convert)
- ✅ Dodać `MODULE_CATEGORIES` - lista modułów technicznych (skip conversion)
- ✅ Testy konwersji (legacy → flexible → render)

**Converter Implementation:**
```javascript
// converter.js

// ⚙️ MODUŁY TECHNICZNE - NIE KONWERTUJ (używają API)
const TECHNICAL_MODULES = new Set([
  'events',
  'calendar_compact', 
  'caldenar_full',
  'team',
  'newsletter',
  'blog'
]);

export const convertLegacyToFlexible = (legacyModule) => {
  // ⚠️ SKIP modułów technicznych - zachowaj oryginał
  if (TECHNICAL_MODULES.has(legacyModule.type)) {
    console.log(`[Converter] Skipping technical module: ${legacyModule.type}`);
    return legacyModule; // ← Zwróć bez zmian!
  }
  
  // ✅ Konwertuj tylko moduły dekoracyjne
  const converters = {
    hero: convertHero,
    services: convertServices,
    about: convertAbout,
    gallery: convertGallery,
    contact: convertContact,
    text: convertText,
    video: convertVideo,
    faq: convertFAQ,
    testimonials: convertTestimonials,
    button: convertButton,
    spacer: convertSpacer,
  };
  
  const converter = converters[legacyModule.type];
  if (!converter) {
    console.warn(`[Converter] No converter for: ${legacyModule.type}`);
    return createFallbackModule(legacyModule);
  }
  
  return converter(legacyModule);
};

const convertHero = (module) => {
  const isSplit = module.layout === 'split';
  
  return {
    type: 'flexible',
    moduleId: module.moduleId,
    structure: {
      type: 'container',
      layout: isSplit ? 'grid' : 'flex',
      columns: isSplit ? 2 : 1,
      direction: isSplit ? 'row' : 'column',
      align: isSplit ? 'start' : 'center',
      padding: '4rem 2rem',
      bgColor: module.content.bgColor,
      bgImage: module.content.backgroundImage,
      children: isSplit ? [
        {
          type: 'stack',
          direction: 'column',
          spacing: '2rem',
          children: [
            {
              type: 'text',
              tag: 'h1',
              value: module.content.title,
              id: `${module.moduleId}-title`
            },
            module.content.subtitle && {
              type: 'text',
              tag: 'p',
              value: module.content.subtitle,
              id: `${module.moduleId}-subtitle`
            },
            module.content.ctaText && {
              type: 'button',
              text: module.content.ctaText,
              link: module.content.ctaLink || '#',
              id: `${module.moduleId}-cta`
            }
          ].filter(Boolean)
        },
        module.content.image && {
          type: 'image',
          src: module.content.image,
          alt: module.content.title || 'Hero image',
          id: `${module.moduleId}-image`
        }
      ].filter(Boolean) : [
        {
          type: 'text',
          tag: 'h1',
          value: module.content.title,
          id: `${module.moduleId}-title`,
          style: { textAlign: 'center' }
        },
        module.content.subtitle && {
          type: 'text',
          tag: 'p',
          value: module.content.subtitle,
          id: `${module.moduleId}-subtitle`,
          style: { textAlign: 'center' }
        },
        module.content.ctaText && {
          type: 'button',
          text: module.content.ctaText,
          link: module.content.ctaLink || '#',
          id: `${module.moduleId}-cta`
        }
      ].filter(Boolean)
    }
  };
};

const convertServices = (module) => {
  const services = module.content.services || [];
  
  return {
    type: 'flexible',
    moduleId: module.moduleId,
    structure: {
      type: 'container',
      padding: '4rem 2rem',
      bgColor: module.content.bgColor,
      children: [
        module.content.title && {
          type: 'text',
          tag: 'h2',
          value: module.content.title,
          id: `${module.moduleId}-title`,
          style: { textAlign: 'center', marginBottom: '3rem' }
        },
        {
          type: 'grid',
          columns: 3,
          gap: '2rem',
          children: services.map((service, idx) => ({
            type: 'stack',
            direction: 'column',
            spacing: '1rem',
            children: [
              service.image && {
                type: 'image',
                src: service.image,
                alt: service.name,
                id: `${module.moduleId}-s${idx}-img`
              },
              {
                type: 'text',
                tag: 'h3',
                value: service.name,
                id: `${module.moduleId}-s${idx}-title`
              },
              service.description && {
                type: 'text',
                tag: 'p',
                value: service.description,
                id: `${module.moduleId}-s${idx}-desc`
              },
              service.price && {
                type: 'text',
                tag: 'span',
                value: `${service.price} PLN`,
                id: `${module.moduleId}-s${idx}-price`,
                style: { fontSize: '1.25rem', fontWeight: 'bold' }
              }
            ].filter(Boolean)
          }))
        }
      ].filter(Boolean)
    }
  };
};

// ... converters for: about, gallery, contact, text, video, faq, testimonials
// NOTE: Team converter REMOVED - team is technical module (uses API)
```

**Backend Integration:**
```python
# api/views.py

# ⚙️ MODUŁY TECHNICZNE - nie konwertuj
TECHNICAL_MODULES = {
    'events', 'calendar_compact', 'caldenar_full', 
    'team', 'newsletter', 'blog'
}

def process_ai_request(request, site_id):
    site = Site.objects.get(id=site_id)
    config = site.template_config
    
    # Convert ONLY decorative modules to flexible
    converted_config = prepare_for_ai(config)
    
    # AI processes with mixed format (flexible + technical)
    ai_response = site_editor_agent.process_task(
        user_prompt=request.data['message'],
        site_config=converted_config
    )
    
    # Save (AI returns mixed format)
    if ai_response['status'] == 'success':
        site.template_config = ai_response['site']
        site.save()
    
    return Response(ai_response)

def prepare_for_ai(config):
    """Convert ONLY decorative modules to flexible, preserve technical."""
    for page in config.get('pages', []):
        modules = page.get('modules', [])
        converted = []
        for m in modules:
            # Skip technical modules - keep original format
            if m['type'] in TECHNICAL_MODULES:
                converted.append(m)
            # Convert decorative modules to flexible
            elif m['type'] != 'flexible':
                converted.append(convert_legacy_module(m))
            # Already flexible
            else:
                converted.append(m)
        page['modules'] = converted
    return config
```

**Frontend Integration:**
```jsx
// ModuleRenderer.jsx

const TECHNICAL_MODULES = new Set([
  'events', 'calendar_compact', 'caldenar_full', 
  'team', 'newsletter', 'blog'
]);

const ModuleRenderer = ({ module, isEditing, pageId, moduleId, siteId, siteIdentifier }) => {
  // ⚠️ Technical modules - render original component (NO conversion)
  if (TECHNICAL_MODULES.has(module.type)) {
    const TechnicalComponent = TECHNICAL_COMPONENTS[module.type];
    return (
      <TechnicalComponent
        {...module}
        isEditing={isEditing}
        pageId={pageId}
        moduleId={moduleId}
        siteId={siteId}              // ← Pass through!
        siteIdentifier={siteIdentifier}  // ← Pass through!
      />
    );
  }
  
  // ✅ Decorative modules - convert to flexible on render
  const renderModule = module.type === 'flexible' 
    ? module 
    : convertLegacyToFlexible(module);
  
  return (
    <FlexibleRenderer
      structure={renderModule.structure}
      isEditing={isEditing}
      pageId={pageId}
      moduleId={moduleId}
    />
  );
};
```

**Migration Flow:**
```
┌─────────────────────────────────────────┐
│  LEGACY IN DB (before)                  │
│  { type: 'hero', content: {...} }       │
└─────────────────────────────────────────┘
              ↓
        USER: "change title"
              ↓
┌─────────────────────────────────────────┐
│  CONVERT for AI (in-memory)            │
│  { type: 'flexible', structure: {...} } │
└─────────────────────────────────────────┘
              ↓
         AI PROCESSES
              ↓
┌─────────────────────────────────────────┐
│  AI RETURNS flexible format             │
└─────────────────────────────────────────┘
              ↓
          SAVE TO DB
              ↓
┌─────────────────────────────────────────┐
│  FLEXIBLE IN DB (after) ✅              │
│  { type: 'flexible', structure: {...} } │
│  Legacy format REPLACED                 │
└─────────────────────────────────────────┘

Faza 4: Integration & Testing (1 tydzień)
Tasks:

 Integracja z NewEditorPage
 Update Zustand store dla flexible modules
 Responsive handling (mobile/tablet/desktop)
 Performance optimization
 Comprehensive testing

Testing Checklist:
Unit Tests:

 All atomic components render correctly
 All layout components handle children
 Validator catches invalid structures
 Sanitizer removes dangerous code
 Converter handles all legacy types

Integration Tests:

 FlexibleRenderer renders nested structures
 Editing updates work (text, image, button)
 AI generates valid structures
 Legacy modules convert and render

E2E Tests:

 User can edit text inline
 User can change images via Pexels
 User can edit button text
 AI commands produce expected results
 Mobile responsive works

Performance:

 Render time < 100ms for typical modules
 No memory leaks in editing mode


Faza 5: Stopniowa Migracja (4-6 tygodni)
Monitoring:
sql-- Migration progress
SELECT 
  COUNT(*) as total_sites,
  SUM(CASE WHEN template_config::text LIKE '%"type":"flexible"%' 
      THEN 1 ELSE 0 END) as flexible_sites,
  ROUND(100.0 * SUM(CASE WHEN template_config::text LIKE '%"type":"flexible"%' 
      THEN 1 ELSE 0 END) / COUNT(*), 2) as progress_percent
FROM api_site;

-- Legacy module usage
SELECT 
  jsonb_path_query(template_config, '$.pages[*].modules[*].type') as module_type,
  COUNT(*) as usage_count
FROM api_site
GROUP BY module_type
ORDER BY usage_count DESC;
```

**Timeline:**
```
Week 1-2:  Foundation (rendering engine, components)
Week 3:    Patterns & AI (prompts, validation)
Week 4:    Migration system (converters)
Week 5:    Integration & testing
Week 6-9:  Stopniowa migracja (automatic conversion)
Week 10:   Monitoring & verification (100% flexible?)
Week 11:   🧹 Cleanup Phase (po zatwierdzeniu)

Faza 6: Cleanup Phase (po zatwierdzeniu - 2-3 dni)
⚠️ TYLKO PO ZATWIERDZENIU ŻE NOWY SYSTEM DZIAŁA!
Checklist przed cleanup:
bash# Sprawdź czy wszystkie strony używają flexible
SELECT site_id, COUNT(*) as legacy_count 
FROM sites 
WHERE template_config::text LIKE '%"type":"hero"%' 
   OR template_config::text LIKE '%"type":"services"%';

# Jeśli legacy_count > 0 → CZEKAJ!
# Jeśli legacy_count = 0 → MOŻNA CZYŚCIĆ ✅
```

**Do usunięcia:**
```
FRONTEND/src/SITES/components/modules/
├── Hero/                              ← DELETE (cały folder)
├── Services/                          ← DELETE
├── About/                             ← DELETE
├── Gallery/                           ← DELETE
├── Contact/                           ← DELETE
├── Text/                              ← DELETE
├── Video/                             ← DELETE
├── FAQ/                               ← DELETE
├── Testimonials/                      ← DELETE
├── Team/                              ← DELETE
└── _descriptors.js                    ← DELETE
```

**Pozostaje:**
```
FRONTEND/src/SITES/components/modules/
└── FlexibleModule/                    ← JEDYNY MODUŁ ✅
    ├── index.jsx
    ├── FlexibleRenderer.jsx
    ├── atoms/
    ├── layouts/
    ├── patterns.js
    ├── validator.js
    └── sanitizer.js
Rezultat:

-70% kodu (~5000 → ~1500 linii)
-70% komponentów (~50 → ~15)
-64% bundle size (~180KB → ~65KB)

Warunki do cleanup:

✅ 100% stron używa flexible format
✅ Nowy system działa stabilnie >2 tygodnie
✅ Zero critical bugs
✅ Pełny backup DB


