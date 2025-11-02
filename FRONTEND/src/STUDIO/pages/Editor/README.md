# New Editor System (v2)

A complete rebuild of the editor following the **EDITOR_PLAN.md** specifications with an ethereal minimalism design philosophy.

## 🎯 Overview

The new editor separates site building into two distinct modes:

1. **Structure Mode**: Visual flowchart for organizing pages and modules
2. **Detail Mode**: Full-page editor for content customization

## 🏗️ Architecture

### State Management
- **Store**: `FRONTEND/src/STUDIO/store/newEditorStore.js`
- **Library**: Zustand
- **Data Structure**: Follows EDITOR_PLAN spec exactly
  - `site` object with pages, modules, vibe, and theme
  - `userLibrary` for custom assets
  - Editor-specific state (mode, selection, drag state)

### Component Structure
```
STUDIO/pages/Editor/
├── NewEditorPage.jsx          # Main container & routing
├── EditorTopBar.jsx           # Unified navigation bar
├── StructureMode.jsx          # Site structure view
│   ├── ModuleToolbar.jsx      # Draggable module library
│   └── PageCard.jsx           # Interactive page cards
└── DetailMode.jsx             # Page editing view
    ├── SectionNavigator.jsx   # Left: module navigation
    ├── DetailCanvas.jsx       # Center: live preview
    ├── ModuleRenderer.jsx     # Module rendering engine
    └── PropertiesPanel.jsx    # Right: 3-section editor
```

## 🚀 Access Points

- **Lab Page**: `/studio/lab/editor`
- **New Site**: `/studio/editor/new` ← **NOW DEFAULT**
- **Edit Site**: `/studio/editor/:siteId` ← **NOW DEFAULT**
- **Legacy Editor**: `/studio/legacy-editor/:siteId` (old editor, kept for fallback)

**Important**: All links from the Sites page and new site creation flow now point to the new editor by default.

## ✨ Features Implemented

### Structure Mode
- ✅ Visual page cards with module visualization
- ✅ Drag modules from toolbar to pages
- ✅ Entry point selection (eye icon)
- ✅ Add/delete/rename pages
- ✅ Drop zones with visual feedback
- ✅ Smooth spring animations

### Detail Mode
- ✅ Three-panel layout (navigator/canvas/properties)
- ✅ Section navigator with jump-to functionality
- ✅ Live canvas preview
- ✅ Device preview toggle (desktop/mobile)
- ✅ Module selection with outline
- ✅ Real-time content editing
- ✅ Properties panel with 3 sections (Content/Appearance/Advanced)

### Module System
- ✅ Hero module (heading/subheading/CTA)
- ✅ About module (title/description)
- ✅ Contact module (email/phone)
- ✅ Module renderer with visibility controls
- ✅ Extended module badge display

### UI/UX
- ✅ Ethereal minimalism design
- ✅ Color palette: `rgb(228, 229, 218)` / `rgb(146, 0, 32)`
- ✅ Backdrop blur effects
- ✅ Smooth cubic-bezier transitions
- ✅ Hover states with elevation
- ✅ Save indicator (red when unsaved)

## 📋 Next Steps

See **EDITOR_PLAN.md** for complete roadmap. Immediate priorities:

1. **More Module Renderers**: Services, Gallery, Calendar, Video, Text
2. **Inline Editing**: Double-click text for direct editing
3. **Backend Integration**: Connect save/load to API
4. **Vibe Selector**: UI for minimal/bold/soft styles
5. **Theme Editor**: Visual color picker and palette generator

## 🎨 Design System

### Colors
- Background: `rgb(228, 229, 218)`
- Accent: `rgb(146, 0, 32)`
- Text: `rgb(30, 30, 30)`
- Borders: `rgba(30, 30, 30, 0.06)`

### Animations
- Duration: 0.3s - 0.6s
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Hover: `translateY(-2px)` to `(-4px)`
- Shadows: Subtle, increase on hover

### Typography
- Headings: 600-700 weight
- Body: 400-500 weight
- Labels: 11px uppercase, 700 weight, letter-spacing 0.8-1px

## 🔧 Development

The editor runs in hot-reload mode within Docker. All changes are instantly reflected.

```bash
# Access the editor lab
http://localhost:5173/studio/lab/editor

# Start a new site in structure mode
http://localhost:5173/studio/editor-v2/new
```

## 📦 Dependencies

- **framer-motion**: Spring animations
- **zustand**: State management
- **@mui/material**: UI components
- **@mui/icons-material**: Icons

All dependencies are already installed.
