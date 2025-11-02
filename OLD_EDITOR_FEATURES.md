# Old Editor Features Documentation

## Overview
This document catalogs features from the legacy editor (`Configurator.jsx` + `editorStore.js`) that may be useful for the new editor implementation.

---

## 🎯 Key Features Worth Preserving

### 1. **Image Gallery Management**
**Location:** `Configurator.jsx` lines 700-900, 1200-1300

**Features:**
- Drag & drop image reordering (move up/down buttons)
- Inline caption editing with auto-focus
- Image preview thumbnails (16x16)
- Delete images with confirmation
- Support for both string URLs and `{url, caption}` objects
- Visual feedback on hover (opacity transitions)

**Implementation Details:**
```jsx
// Image item structure
{
  url: 'https://...',
  caption: 'Optional description'
}

// Reorder logic
const moveUp = (idx) => {
  [images[idx], images[idx - 1]] = [images[idx - 1], images[idx]]
}
```

**Status in New Editor:** ✅ **TAKEN** - Reorder function added to store as `reorderCollectionItem()`
**Priority:** HIGH - Essential for Gallery module

---

### 2. **Child Elements System (Container Modules)**
**Location:** `Configurator.jsx` lines 480-900

**Features:**
- Hierarchical module structure (parent → children)
- Dedicated child editor view with back button
- Support for multiple child types:
  - `text` - Text blocks
  - `button` - CTA buttons  
  - `gallery` - Image galleries
  - `spacer` - Vertical spacing
- Per-child configuration (expand/collapse)
- Visual type icons (📝 🔘 🖼️ ↕️)

**Data Structure:**
```jsx
module: {
  type: 'container',
  config: {
    children: [
      {
        type: 'text',
        config: { content: '...', fontSize: '16px' }
      },
      {
        type: 'button', 
        config: { label: 'Click me', link: '#' }
      }
    ]
  }
}
```

**Status in New Editor:** ❌ Not implemented
**Priority:** MEDIUM - Useful for flexible layouts
**Note:** This overlaps with the "Custom Elements" concept from EDITOR_PLAN.md Phase 6

---

### 3. **React Component Module (Custom Code)**
**Location:** `Configurator.jsx` lines 140-450

**Features:**
- Live code editor with syntax validation
- Babel compilation in browser
- Upload compiled JS to backend
- Dynamic prop generation from component
- Visual controls for component props
- Props type inference:
  - `boolean` → Checkbox
  - `*color*` keyword → Color picker
  - `*description*` keyword → Textarea
  - Long strings (>120 chars) → Textarea
  - Media keywords → Image uploader
- Component status feedback (success/error)
- Default props system
- Media URL resolution helper

**Key Handlers:**
```jsx
handleReactComponentCodeChange(value)
handleCompileReactComponent() // Uses Babel + backend API
handleResetReactProps()
```

**Backend Integration:**
```jsx
POST /custom-components/
POST /custom-components/${id}/upload_compiled/
```

**Status in New Editor:** ❌ Not implemented
**Priority:** LOW - Phase 7 feature (Custom Code Modules)
**Note:** This is the foundation for AI-generated custom modules

---

### 4. **Smart Prop Type Detection**
**Location:** `Configurator.jsx` lines 60-100

**Algorithm:**
```javascript
getReactPropFieldType(key, value) {
  // 1. Check value type
  if (typeof value === 'boolean') return 'boolean'
  
  // 2. Check key for media keywords
  if (key.includes('image') || key.includes('video') || 
      key.includes('url') || key.includes('src')) {
    return 'image'
  }
  
  // 3. Check key for color keywords
  if (key.includes('color') || key.includes('bg') || 
      key.includes('background')) {
    return 'color'
  }
  
  // 4. Check key for long text keywords
  if (key.includes('description') || key.includes('content') || 
      key.includes('body')) {
    return 'textarea'
  }
  
  // 5. Check string length
  if (typeof value === 'string' && value.length > 120) {
    return 'textarea'
  }
  
  // 6. Default to text input
  return 'text'
}
```

**Prop Labels:**
```javascript
const PROP_LABELS = {
  eyebrow: 'Etykieta nad tytułem',
  title: 'Tytuł sekcji',
  titleColor: 'Kolor tytułu',
  description: 'Opis sekcji',
  ctaLabel: 'Tekst przycisku',
  ctaBg: 'Kolor tła przycisku',
  // ... etc
}
```

**Status in New Editor:** ✅ **TAKEN** - Created `propTypeDetection.js` utility
**Priority:** MEDIUM - Enhance PropertiesPanel field generation

---

### 5. **Collection Item Management**
**Location:** Throughout Configurator.jsx (FAQ, Services, Gallery, etc.)

**Features:**
- Add new items to arrays
- Remove items with index
- Reorder items (move up/down)
- Inline editing for all item fields
- Expandable/collapsible item cards
- Visual item count display
- Empty state messaging

**Common Patterns:**
```jsx
const addCollectionItem = (key, newItem) => {
  const items = [...(module.config[key] || []), newItem]
  handleConfigChange(key, items)
}

const removeCollectionItem = (key, index) => {
  const items = module.config[key].filter((_, i) => i !== index)
  handleConfigChange(key, items)
}

const updateCollectionItem = (key, index, updates) => {
  const items = [...module.config[key]]
  items[index] = { ...items[index], ...updates }
  handleConfigChange(key, items)
}
```

**Example Usage (FAQ Module):**
```jsx
// Add question
addCollectionItem('items', {
  id: `faq-${Date.now()}`,
  question: 'New question',
  answer: '<p>Add answer...</p>'
})

// Update question
updateCollectionItem('items', index, { 
  question: 'Updated question' 
})
```

**Status in New Editor:** ✅ **TAKEN** - Added to `newEditorStore.js`:
- `addCollectionItem(pageId, moduleId, collectionKey, newItem)`
- `removeCollectionItem(pageId, moduleId, collectionKey, index)`
- `updateCollectionItem(pageId, moduleId, collectionKey, index, updates)`
- `reorderCollectionItem(pageId, moduleId, collectionKey, fromIndex, toIndex)`

**Priority:** HIGH - Essential for Services, Gallery, FAQ, Testimonials, Pricing, Team

---

### 6. **Expert Mode Toggle**
**Location:** `editorStore.js` + various components

**Features:**
- Show/hide advanced controls
- Access to delete module button
- Raw config JSON editor (potentially)
- Developer-friendly debugging tools

**Usage:**
```jsx
const { expertMode, removeModule } = useEditorStore()

{expertMode && (
  <button onClick={() => removeModule(module.id)}>
    Delete Module
  </button>
)}
```

**Status in New Editor:** ❌ Not implemented
**Priority:** LOW - Nice to have for developers

---

### 7. **Internal Link System**
**Location:** `Configurator.jsx` lines 125-150, prop handlers

**Features:**
- Link type selection: `none`, `internal`, `external`
- Internal page dropdown (populated from site pages)
- Auto-path generation from page selection
- Manual path override with anchor support (`#section`)
- Target attribute control (`_self`, `_blank`)

**Data Structure:**
```jsx
{
  ctaLinkType: 'internal',      // 'none' | 'internal' | 'external'
  ctaInternalPageId: 'about',   // Selected page ID
  ctaInternalPath: '/about#team', // Generated or custom path
  ctaHref: '',                  // External URL (if type='external')
  ctaTarget: '_self'            // '_self' | '_blank'
}
```

**Page Options Generation:**
```jsx
const pageOptions = useMemo(() => {
  const pagesObject = templateConfig.pages || {}
  const orderedKeys = templateConfig.pageOrder || Object.keys(pagesObject)
  
  return orderedKeys.map(key => ({
    id: page.id || key,
    name: page.name || id,
    path: page.path || `/${key}`
  }))
}, [templateConfig])
```

**Status in New Editor:** ⚠️ Basic link support only
**Priority:** HIGH - Essential for navigation buttons

---

### 8. **Media Drag & Drop Zones**
**Location:** `Configurator.jsx` lines 2900-3100

**Features:**
- Visual drag-over feedback (border highlight)
- File type validation
- Drag counter (handle enter/leave correctly)
- Support for both drag and click upload
- Progress indicators during upload

**Implementation:**
```jsx
const [isDraggingOver, setIsDraggingOver] = useState(false)
const dragCounter = useRef(0)

const handleDragEnter = (e) => {
  e.preventDefault()
  dragCounter.current++
  if (dragCounter.current === 1) {
    setIsDraggingOver(true)
  }
}

const handleDragLeave = (e) => {
  e.preventDefault()
  dragCounter.current--
  if (dragCounter.current === 0) {
    setIsDraggingOver(false)
  }
}

const handleDrop = async (e) => {
  e.preventDefault()
  dragCounter.current = 0
  setIsDraggingOver(false)
  
  const files = e.dataTransfer.files
  // Handle upload...
}
```

**Status in New Editor:** ⚠️ Basic ImageUploader exists
**Priority:** MEDIUM - Improve UX for media uploads

---

### 9. **Video Module Controls**
**Location:** `Configurator.jsx` lines 1600-1750

**Features:**
- Video URL input (YouTube, Vimeo, direct)
- Caption/description field
- Color pickers (caption, background)
- Muted toggle with explanation
- Aspect ratio enforcement (16:9)
- Video type detection

**Configuration:**
```jsx
{
  videoUrl: 'https://youtube.com/...',
  caption: 'Watch our story',
  captionColor: '#4B5563',
  bgColor: '#FFFFFF',
  muted: true
}
```

**Status in New Editor:** ⚠️ Basic video module exists
**Priority:** MEDIUM - Add more controls

---

### 10. **Hero Module Special Handling**
**Location:** `Configurator.jsx` lines 15-20

**Helper Function:**
```jsx
const isHeroModule = (module) => {
  if (!module) return false
  const type = (module.type || '').toLowerCase()
  if (type === 'hero') return true
  const id = (module.id || '').toLowerCase()
  return id === 'hero' || id.startsWith('hero') || id.endsWith('hero')
}
```

**Use Case:**
- Apply special styling/layout rules
- Show hero-specific controls
- Different prop defaults

**Status in New Editor:** ❌ Not implemented
**Priority:** LOW - Hero is just another module in new format

---

## 🎨 UI/UX Patterns Worth Adopting

### 1. **Empty State Messages**
```jsx
{items.length === 0 && (
  <p className="text-sm text-center py-6 text-gray-400">
    Dodaj pierwsze pytanie, aby uzupełnić sekcję.
  </p>
)}
```

### 2. **Inline Validation Hints**
```jsx
<p className="text-xs mt-1 opacity-60">
  Układ "w linii" pozwala umieścić element obok innych
</p>
```

### 3. **Confirmation Dialogs**
```jsx
if (confirm('Czy na pewno chcesz usunąć ten element?')) {
  // Delete logic
}
```

### 4. **Status Feedback**
```jsx
const [componentStatus, setComponentStatus] = useState(null)

{componentStatus && (
  <div className={componentStatus.type === 'success' ? 'bg-green-100' : 'bg-red-100'}>
    {componentStatus.message}
  </div>
)}
```

### 5. **Hover Actions**
```jsx
<div className="group">
  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    {/* Action buttons */}
  </div>
</div>
```

---

## 📦 Reusable Components from Old Editor

### 1. **ColorPicker**
**Location:** `src/components/ColorPicker.jsx`
- Color input with preview swatch
- Hex/RGB support
- Recent colors memory

**Status:** ✅ **AVAILABLE** - Already exists in project, can be reused

### 2. **ImageUploader**
**Location:** `src/components/ImageUploader.jsx`
- Drag & drop interface
- Aspect ratio enforcement
- Progress indicators
- URL input support

**Status:** ✅ **AVAILABLE** - Already exists in project, can be reused

### 3. **Media URL Resolver**
**Location:** `src/config/api.js` → `resolveMediaUrl()`
- Converts relative paths to absolute
- Handles different media sources
- CDN support

**Status:** ✅ **AVAILABLE** - Already exists in project, can be imported and used

---

## 🔌 Backend Integration Points

### 1. **Custom Component API**
```javascript
// Create component
POST /api/v1/custom-components/
Body: { name, description, source_code }

// Upload compiled JS
POST /api/v1/custom-components/${id}/upload_compiled/
FormData: { file, source_code }
```

### 2. **Media Upload**
- Integrated with `ImageUploader` component
- Returns CDN URLs
- Supports multiple formats

---

## ⚠️ Issues in Old Editor (Don't Repeat)

1. **3500+ line monolithic component** - Split into smaller files
2. **Mixed concerns** - Separate UI from business logic
3. **Inline styles everywhere** - Use MUI `sx` consistently
4. **No TypeScript** - Consider adding types
5. **Polish language hardcoded** - Should be i18n-ready
6. **Inconsistent state updates** - Use Zustand patterns properly
7. **No error boundaries** - Add error handling
8. **Direct DOM manipulation** - Use React refs properly
9. **No loading states** - Add skeletons/spinners
10. **Babel in browser** - Should compile on backend

---

## 🎯 Migration Priority

### Phase 1 (Immediate - Current Work)
- ✅ Basic module CRUD
- ✅ Color pickers
- ✅ **Collection item management** (Services, Gallery, etc.) - **TAKEN**
- ✅ **Smart prop type detection** - **TAKEN**
- ✅ **Image reordering** - **TAKEN** (via `reorderCollectionItem`)

### Phase 2 (Next Sprint)
- Internal link system
- Video module enhancements
- Media drag & drop improvements

### Phase 3 (Future)
- Child elements system (or merge with Custom Elements concept)
- Expert mode toggle
- React component module (Custom Code Modules)

### Phase 4 (Polish)
- Empty states
- Status feedback
- Confirmation dialogs
- Hover interactions

---

## 📝 Code Examples to Port

### Collection Item Manager (Recommended Pattern)
```jsx
// Add to newEditorStore.js
addCollectionItem: (pageId, moduleId, collectionKey, newItem) => set((state) => ({
  site: {
    ...state.site,
    pages: state.site.pages.map(page => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        modules: page.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            content: {
              ...m.content,
              [collectionKey]: [...(m.content[collectionKey] || []), newItem]
            }
          };
        })
      };
    })
  },
  hasUnsavedChanges: true
})),

removeCollectionItem: (pageId, moduleId, collectionKey, index) => set((state) => ({
  site: {
    ...state.site,
    pages: state.site.pages.map(page => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        modules: page.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            content: {
              ...m.content,
              [collectionKey]: m.content[collectionKey].filter((_, i) => i !== index)
            }
          };
        })
      };
    })
  },
  hasUnsavedChanges: true
})),

updateCollectionItem: (pageId, moduleId, collectionKey, index, updates) => set((state) => ({
  site: {
    ...state.site,
    pages: state.site.pages.map(page => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        modules: page.modules.map(m => {
          if (m.id !== moduleId) return m;
          const items = [...m.content[collectionKey]];
          items[index] = { ...items[index], ...updates };
          return {
            ...m,
            content: {
              ...m.content,
              [collectionKey]: items
            }
          };
        })
      };
    })
  },
  hasUnsavedChanges: true
}))
```

---

## 🔍 Files to Review

1. **Configurator.jsx** (3509 lines) - Main properties panel
2. **editorStore.js** - State management (old format)
3. **ColorPicker.jsx** - Color input component
4. **ImageUploader.jsx** - Media upload component
5. **compileReactSnippet.js** - Babel compilation utility
6. **reactComponentDefaults.js** - Default props system

---

## ✅ Summary

**Total Features Identified:** 10 major systems
**Already Implemented:** ~60% (up from 30%)
**High Priority Taken:** ✅ Collection management, ✅ Smart prop detection, ✅ Image reordering
**High Priority Missing:** Internal links
**Lines of Code:** ~3500 in Configurator alone
**Estimated Port Effort:** 1-2 sprints for remaining feature parity

---

## 📋 What Was Ported (This Session)

### ✅ Added to `newEditorStore.js`:
1. `addCollectionItem(pageId, moduleId, collectionKey, newItem)` - Add item to array
2. `removeCollectionItem(pageId, moduleId, collectionKey, index)` - Remove item from array
3. `updateCollectionItem(pageId, moduleId, collectionKey, index, updates)` - Update array item
4. `reorderCollectionItem(pageId, moduleId, collectionKey, fromIndex, toIndex)` - Reorder items

### ✅ Created `propTypeDetection.js` utility:
1. `getFieldType(key, value)` - Auto-detect field type (text/textarea/color/image/boolean)
2. `formatPropLabel(propKey)` - Convert camelCase to readable labels
3. `getPropHelper(key)` - Get helper text for fields
4. `validateFieldValue(value, fieldType)` - Validate field values

### ✅ Marked as Available:
- `ColorPicker.jsx` component (already in project)
- `ImageUploader.jsx` component (already in project)
- `resolveMediaUrl()` function (already in `src/config/api.js`)

---

The old editor has robust collection management and media handling that have now been ported. The React component system can wait until Phase 7 (Custom Code Modules) as planned.
