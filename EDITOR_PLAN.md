Editor System Documentation
The Editor enables users to build and customize websites through a visual interface. The system separates concerns into four layers:
Structure - Site architecture and page organization
Layout - Module arrangement (variants)
Vibe - Aesthetic styling preset
Theme - Color palette

Editor Modes
Structure Mode
Visual flowchart showing entire site architecture with a two-canvas system and hierarchical layout:

**Two-Canvas System:**
1. **Editor Canvas** - The whole background area that:
   - Shows all pages in a hierarchical two-row layout
   - Displays canvas settings (render mode, overlays) at top
   - Shows user entry point with eye icon above home page
   - Accepts module drops to create NEW pages with that module

2. **Site/Page Canvas(es)** - Individual page previews (16:9 aspect ratio) that:
   - Display on the editor canvas background in two rows
   - **First Row**: Home page (700px wide) - main entry point
   - **Second Row**: Other pages (450px wide, scaled 0.64x) - secondary pages
   - Show page content and modules
   - Have page titles above them (left-aligned)
   - Accept module drops to ADD to that specific page
   - Support drag-and-drop module reordering within the page

**Layout Structure:**
```
👁️ Entry Point (at settings level)
         ⬇️ (animates once on load)
   [Home Page - 700px]
         
[Page2][Page3][Page4][Page5]
Dynamically scaled to fit all in one row
```

**Drag & Drop Behavior:**
- Drop module on **Editor Canvas** (empty background) → Creates NEW page with that module automatically
- Drop module **ANYWHERE** on **Site/Page Canvas** → Adds module to THAT specific page (entire canvas is drop zone)
- Drop module between modules within a page → Inserts at that position
- NO empty pages are created - modules are added immediately on page creation
- Multiple modules can be added to same page by dragging onto the page canvas

Interface Components:
Entry Point: Eye icon at settings level (top left) with "Entry" label
Arrow Animation: Single smooth arrow animation from eye to home page on editor load (no loop)
Page Titles: Each page canvas has a title above it (e.g., "Home Page", "Hero Page", "Gallery Page")
Module Toolbar: Left sidebar (180px wide) with draggable modules
Canvas Settings: Top bar with entry point indicator, render mode toggle (Icon/Real) and color overlay checkbox
Home Page Canvas: 700px wide, 16:9 aspect ratio, center-aligned in first row
Other Page Canvases: Dynamically scaled to fit all in one row (no wrapping), 16:9 aspect ratio maintained
No Third Row: All secondary pages fit in second row with automatic scaling

Interactions:
Drag modules from toolbar onto editor canvas to create new page with module
Drag modules onto page canvas to add to that page
Drag modules within pages to reorder vertically
Click page canvas to transition to Detail Mode
Render modes: Icon (simplified colored blocks) or Real (scaled 50% preview)

Visual Behavior:
Dragged items follow cursor
Drop zones highlight with animated dashed border (red accent)
Smooth spring animations for all transitions
Page canvases have hover effect and selection outline
Second row pages scale proportionally to fit smaller width
Arrows animate with bounce effect
Toolbar collapses to icons when not in use


Detail Mode
Activated by clicking a page. Zooms to selected page, structure disappears, focus on editing.
Interface Components:
Canvas: Full-screen live preview of entire page (scrollable)
Top Bar: Back button, page name, device toggle (mobile/desktop), settings, save
Section Navigator: Left sidebar showing all modules on page (click to jump)
Properties Panel: Right sidebar (shows selected module properties)
Properties Panel Structure:
Content - Text, images, links, visibility toggles
Appearance - Layout selector, style selector, custom elements
Advanced - Fine-tuning, overrides, save options (collapsed by default)
Interactions:
Click module on canvas to select (outlined border appears)
Edit content inline or via panel
Double-click text for direct editing
Toggle device preview
Navigate between modules via left sidebar
All changes render instantly
Mode Transition:
Structure → Detail: Page card expands into full canvas
Detail → Structure: Canvas shrinks back to card position
Smooth spring animation (600ms)


Module System
Module Types
Standard Modules Pre-built modules with fixed element structure. Fast, reliable, consistent.
Elements can be toggled on/off via visibility controls
Use for 90% of cases
 Standard moduExtended Modulesle + custom elements added by user or AI.
Maintains safety and structure
Elements from predefined library
Visual drag-drop positioning with snap zones
Custom Modules AI-generated React components for unique requirements.
For truly unique needs that can't be achieved with standard modules
User configures via visual controls only (no code access)
Runs in sandboxed iframe for security
Preview before using
Module Hierarchy
Modules - Complete functional sections
Elements - Components within modules (base + custom addable)


Core Modules
Hero
Purpose: Primary introduction section
Layouts: Centered, Split, Full-bleed
Base Elements: Heading, subheading, media, CTA, background
About
Purpose: Story and credibility
Layouts: Text-focused, Image-split, Timeline
Base Elements: Heading, body text, images, highlights
Services/Oferta
Purpose: Offerings display
Layouts: Grid, List, Accordion
Base Elements: Service items (icon, title, description, link)
Gallery
Purpose: Visual showcase
Layouts: Masonry, Grid, Slider
Base Elements: Images, captions, categories, lightbox
Contact
Purpose: Communication
Layouts: Form-only, Form + Map, Details-only
Base Elements: Form fields, map, contact details
Calendar
Purpose: Availability and booking
Layouts: Monthly, Weekly, List
Base Elements: Events, time slots, booking CTA
Phase 2 Modules
Blog, Testimonials, Pricing, FAQ, Team, Video, Text Section


Custom Elements
Adding Elements to Modules
Predefined Element Types:
Badge/Tag - Small label with text
Icon - Single icon from library
Divider - Horizontal line separator
Text Block - Additional paragraph or heading
Image - Extra image with caption
Spacer - Adjustable vertical spacing
Positioning
Manual (User):
Drag element onto canvas
Snap zones appear near existing elements
Visual indicators: "Above heading", "Below button", "Inside content area"
Drop to place, drag handles to reorder
AI-Assisted:
AI uses simple syntax internally: before:heading, after:button, inside:content
Translates to visual placement automatically
User sees: "I'll add a badge above your heading" → done
Configuration
Each custom element has:
Content - Text, image URL, icon name
Appearance - Style follows theme or custom
Visibility - Toggle on/off


Custom Code Modules
When to Use
For requirements impossible with standard/extended modules:
Complex animations or interactions
Unique data visualizations
Specialized layouts
Creation Flow
User: "I need animated particle background with 3D shapes"

AI: "I'll create a custom module for this."
    → Generates React component (code hidden from user)
    → Creates visual configuration interface
    → Shows preview
    
User: [Tests in preview]
      [Configures via visual controls]
      [Uses module]

User Experience
Properties Panel for Custom Modules:
┌────────────────────────────────┐
│ CONTENT                        │
├────────────────────────────────┤
│ Heading: [________________]    │
│ Particle Count: [━━━●━━] 50   │
│ Animation Speed: [━●━━━━] 3   │
│ Color: [Primary ▼]            │
│                                │
│ [👁️ Preview]                   │
└────────────────────────────────┘

Visual controls only - No code editing or viewing.
Security
Runs in sandboxed iframe
No access to parent window or store
Props passed via postMessage
Cannot execute arbitrary code
Cannot access user data
Reusability
Saved to user library automatically
Shows in module toolbar with [Custom] badge
Draggable like standard modules
Reusable across pages/sites


Styling System
Layouts
Structural arrangements that change positioning, not aesthetics.
System Layouts: Pre-built (2-3 per module) Custom Layouts: User or AI-created, saved to library
Selection: Thumbnail grid in Appearance section

Vibes
Global aesthetic presets applied site-wide.
Available Vibes:
Minimal: Clean, spacious, subtle shadows, thin borders, soft animations
Bold: High contrast, thick borders, sharp corners, heavy fonts
Soft: Rounded corners, soft shadows, medium-weight fonts, slow animations
Custom Vibes: User-created style presets, saved to library

Themes
Base Colors (3):
Primary: Main brand color
Secondary: Accent color
Neutral: Background/text base
Auto-generation:
Shades and tints (50-900 scale)
Accessible text colors (WCAG compliant)
Success/warning colors (fixed)
Custom Colors: When user needs additional color, AI adds to theme:
User: "Make button gold"
AI: → Adds "gold" to theme palette
    → Button uses theme gold
    → Gold available for reuse elsewhere

All colors remain part of theme - No hardcoded overrides. When theme changes, all colors adjust proportionally.
Theme Editor:
3 base color pickers
"Generate Palette" button (AI-assisted)
Add custom colors to palette
Accessibility contrast warnings


Color System
Single Approach: Theme Colors Only
How it works:
All colors reference theme palette
User wants custom color → AI adds to theme
Color now part of theme system
Changes with theme updates
Color References:
theme:primary - Base colors
theme:primary-500 - Specific shade
theme:gold - Custom color added by user/AI
No hardcoded colors. Everything goes through theme.
AI Color Handling
User: "Make this element gold"

AI Process:
1. Check if gold exists in theme → NO
2. Add gold to theme palette
3. Reference as theme:gold
4. Inform: "Added gold to your theme"

Result: Element is gold, synced with theme



State Management
Data Structure
{
  "site": {
    "vibe": "minimal",
    "theme": {
      "colors": {
        "primary": "#920020",
        "secondary": "#2D5A7B",
        "neutral": "#E4E5DA",
        "gold": "#D4AF37"
      }
    },
    "pages": [
      {
        "id": "home",
        "route": "/",
        "modules": [
          {
            "id": "hero-1",
            "type": "Hero",
            "moduleType": "standard",
            "content": {
              "heading": "Welcome",
              "subheading": "To my site",
              "media": {"type": "image", "url": "..."},
              "cta": {"text": "Learn more", "link": "#"},
              "background": {"type": "color", "value": "theme:neutral"}
            },
            "customElements": [
              {
                "id": "badge-1",
                "type": "Badge",
                "position": "before:heading",
                "content": {"text": "New!"},
                "style": {"color": "theme:gold"}
              }
            ],
            "layout": "system:split",
            "style": "system:minimal",
            "visibility": {
              "heading": true,
              "subheading": true,
              "media": true,
              "cta": true
            }
          },
          {
            "id": "custom-1",
            "type": "CustomModule",
            "moduleType": "custom",
            "name": "Particle Hero",
            "componentId": "cmp_abc123",
            "config": {
              "heading": "Animated Welcome",
              "particleCount": 50,
              "speed": 5
            }
          }
        ]
      }
    ]
  },
  "userLibrary": {
    "customAssets": [
      {
        "id": "asset-1",
        "type": "layout",
        "name": "Asymmetric hero",
        "moduleType": "Hero",
        "thumbnail": "...",
        "createdBy": "ai-agent",
        "createdAt": "2025-10-30"
      },
      {
        "id": "asset-2",
        "type": "style",
        "name": "Elegant dark",
        "moduleType": "Hero",
        "basedOn": "minimal"
      },
      {
        "id": "asset-3",
        "type": "theme",
        "name": "Wedding elegance",
        "colors": {...}
      },
      {
        "id": "asset-4",
        "type": "module",
        "name": "Particle Hero",
        "componentId": "cmp_abc123",
        "editableProps": {...},
        "thumbnail": "..."
      }
    ]
  }
}

Module Properties
moduleType:
"standard" - Base module with fixed elements
"extended" - Standard + custom elements added
"custom" - AI-generated code module
layout:
"system:split" - System layout
"custom:abc-123" - User library layout reference
style:
"system:minimal" - System vibe
"custom:xyz-789" - User library style reference
Update Flow
User action → store update
Components re-render
Canvas reflects instantly
Custom modules re-render in sandbox
Persistence
Manual Save: PUT /api/v1/sites/{id}
Auto-save: Every 2 minutes
Versioning: Timestamped snapshots
Undo/Redo: Single stack across modes


User Library
Unified storage for all custom creations.
Asset Types:
layout - Custom module arrangements
style - Custom aesthetic presets
theme - Custom color schemes
module - Custom code modules
Auto-saved when:
AI creates custom asset
User clicks "Save as custom..."
Custom modification applied
All assets include:
Auto-generated name (AI or user)
Thumbnail (auto-generated)
Creation date and source
Usage tracking
Search tags


AI Assistant
Interface
Minimalistic rectangular chat window at center bottom.
Core Intelligence
Context Awareness:
Current mode and selected elements
Site configuration
User library contents
Decision Making:
Standard module sufficient? → Use it
Need extra elements? → Add custom elements
Completely unique? → Generate custom module
Color Handling:
User wants color → Add to theme palette
Always use theme references
Never hardcode colors
Library Management:
Search before creating duplicates
Propose existing assets when similar
Auto-name and tag new creations
Capabilities
Site Generation:
Create complete site structures
Populate with contextual content
Apply appropriate modules
Module Modification:
Edit content, layouts, styles
Add/remove custom elements
Position elements intelligently
Custom Element Addition:
Select from predefined library
Position using simple syntax (internal)
Apply theme colors by default
Custom Module Generation:
Write React component (hidden from user)
Generate visual configuration interface
Create sandbox preview
Save to library automatically
Theme Management:
Add custom colors to palette
Generate color schemes
Ensure accessibility
Example Interactions
User: "Add 'New' badge above heading"
AI: → Adds Badge element
    → Positions before heading
    → Uses theme accent color
    → "Added 'New' badge"

User: "I need animated particles"
AI: → Recognizes need for custom module
    → "Creating custom module..."
    → Generates component + controls
    → "Preview it, then use"

User: "Make button gold"
AI: → Adds gold to theme
    → Sets button color: theme:gold
    → "Added gold to your theme"



Properties Panel
Three-Section Structure
CONTENT
Text editors
Image/media uploads
Link inputs
Visibility toggles for base elements
APPEARANCE
Layout selector (thumbnails: system + custom)
Style selector (dropdown: vibes + custom)
Custom elements:
List of added elements
[+ Add element...] button
Drag handles for reordering
Edit/Remove per element
ADVANCED (collapsed by default)
Layout fine-tuning
Style overrides
Spacing controls
[Save as custom layout]
[Save as custom style]
For Custom Modules
CONTENT
Visual controls generated from editableProps
No code visibility
APPEARANCE
[Preview in sandbox] button
Thumbnail display
ADVANCED
Module-specific settings (if any)


Design Principles
Simple by default, powerful when needed - Standard → Extended → Custom
Theme-first colors - Everything references theme palette
Visual configuration only - Users never see/edit code
Automatic library saves - No manual save prompts
AI guides intelligently - Searches library, prevents duplication
Drag-drop with smart snapping - Visual positioning for manual edits
Three-section panels - Content, Appearance, Advanced
Preview before use - Test custom modules in sandbox
Smooth transitions - Spring animations between modes
Unified library - Single customAssets array with type field

Implementation Phases
Phase 1: Structure Mode, drag-drop, state management
Phase 2: Detail Mode, properties panel (3-section), full-page preview, section navigation
Phase 3: Vibe system, theme editor, unified color approach
Phase 4: Core modules (standard type) with base elements, system layouts
Phase 5: User library (unified customAssets), layout/style saving
Phase 6: Custom elements system, drag-drop positioning with snap zones, predefined element library
Phase 7: Custom code modules, sandbox execution, visual configuration generation
Phase 8: AI assistant, smart module type selection, library search, preview-to-use workflow


WORK STATUS:

## ✅ COMPLETED

### Phase 1: Core Architecture (100%)
- **newEditorStore.js**: Complete state management with site structure, user library, CRUD operations, theme management, drag/drop, device preview, undo/redo hooks, null safety checks
- **Routes**: `/studio/editor/:siteId` → New Editor (DEFAULT), legacy moved to `/studio/legacy-editor/`

### Structure Mode (100%)
- **StructureMode.jsx**: Two-canvas system with hierarchical two-row layout
  - Row 1: Home page (700px, full size) with eye icon and entry point indicator above
  - Row 2: Other pages (450px, scaled 0.64x) in horizontal wrap layout
  - Arrows pointing from home page to other pages
  - Editor canvas drop creates new page with module automatically (no empty pages)
  - Page canvas drop adds module to that specific page with stopPropagation to prevent bubbling
- **SiteCanvas.jsx**: Dedicated component with 16:9 aspect ratio, vertical module stacking, real borders, drag-drop zones with event stopPropagation, icon/real rendering
- **ModuleToolbar.jsx**: 180px wide (25% reduction), 12 module types
- **PageCard.jsx**: Entry point, badges, context menu (OLD structure mode component - deprecated)
- **Page Titles**: Dynamic titles above each canvas ("Home Page", "{ModuleType} Page")
- **Entry Point Indicator**: Eye icon with animated downward arrow above home page
- **Removed**: "Drop to create new page" zone - new pages created instantly via editor canvas drop

### Detail Mode (100%)
- **DetailMode.jsx**: Three-panel layout (navigator/canvas/properties)
- **SectionNavigator.jsx**: Module list with jump-to
- **DetailCanvas.jsx**: Live preview with selection outline
- **PropertiesPanel.jsx**: Three sections (Content/Appearance/Advanced), dynamic fields for all 12 modules

### Module System (12/12 Complete)
- **ModuleRenderer.jsx**: Hero, About, Contact, Services, Gallery, Calendar, Text, Video, Testimonials, Pricing, FAQ, Team
- **moduleDefinitions.js**: Icons, colors, defaults for all types

### UI Components
- **EditorTopBar.jsx**: Editable site title with OK/Cancel, API integration, mode-aware controls, device preview toggle
- **NewEditorPage.jsx**: API fetch on mount, loading/error states, populates siteId/siteName/template_config, wrapped with EditorErrorBoundary
- **EditorErrorBoundary.jsx**: Catches and displays editor errors with reload option, prevents crashes

### Design System
- ✅ Ethereal minimalism: rgb(228,229,218), rgb(146,0,32)
- ✅ Backdrop blur, spring animations, spacious layouts

---

## 🚧 IN PROGRESS / TODO

### Phase 2: Enhanced Detail Mode
- [ ] Array item editors (services/gallery/testimonials/pricing/faq/team)
- [ ] Image upload system
- [ ] Inline text editing (double-click)
- [ ] Save button → API (template_config persistence)
- [ ] Auto-save every 2 minutes
- [ ] Background color pickers

### Phase 3: Styling System
- [ ] Vibe selector UI (minimal/bold/soft)
- [ ] Theme editor with color picker
- [ ] System layouts with thumbnails
- [ ] Custom layout saving

### Phase 4-8: Advanced Features
- [ ] Extended modules (custom elements)
- [ ] User library browser
- [ ] Custom code modules with sandbox
- [ ] AI Assistant integration
- [ ] Full undo/redo implementation
- [ ] Version history

---

## 🎯 Quick Reference

**Routes**: `/studio/editor/:siteId` (new), `/studio/legacy-editor/:siteId` (old), `/studio/lab/editor` (lab)

**Key Files**: `newEditorStore.js`, `NewEditorPage.jsx`, `SiteCanvas.jsx`, `ModuleRenderer.jsx`

**Module Colors**: Hero #FF6B6B | About #4ECDC4 | Services #45B7D1 | Gallery #FFA07A | Calendar #98D8C8 | Contact #FFD93D | Text #A8E6CF | Video #C7CEEA | Testimonials #F8B195 | Pricing #88D8B0 | FAQ #FFEAA7 | Team #DFE6E9

### Phase 5: User Library
- [ ] Save custom layouts
- [ ] Save custom styles
- [ ] Save custom themes
- [ ] Asset thumbnails generation
- [ ] Library browser UI
- [ ] Drag from library to canvas

### Phase 6: Custom Elements
- [ ] Predefined element library (Badge, Icon, Divider, etc.)
- [ ] Drag-and-drop element positioning
- [ ] Snap zones with visual indicators
- [ ] Element configuration panel
- [ ] Position syntax (before:, after:, inside:)

### Phase 7: Custom Code Modules
- [ ] Sandbox iframe system
- [ ] React component generation by AI
- [ ] Visual configuration interface generator
- [ ] Preview modal
- [ ] Security sandboxing

### Phase 8: AI Assistant
- [ ] Chat interface (bottom center)
- [ ] Context awareness
- [ ] Smart module type selection
- [ ] Library search before creation
- [ ] Color management (auto-add to theme)
- [ ] Natural language to actions

### Backend Integration
- [ ] Connect to site API endpoints
- [ ] Save/load site configurations
- [ ] Versioning system (snapshots)
- [ ] Auto-save every 2 minutes
- [ ] Publish workflow

### Quality & Polish
- [ ] Keyboard shortcuts
- [ ] Full undo/redo stack
- [ ] Error boundaries
- [ ] Loading states
- [ ] Toast notifications
- [ ] Responsive mobile editing
- [ ] Performance optimization




