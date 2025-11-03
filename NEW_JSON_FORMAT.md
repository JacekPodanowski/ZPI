# Template Config Format

**Version:** 2.0 (Optimized)
**Last Updated:** 2025-01-02

## Overview

This document defines the unified JSON format for storing site configurations in the `template_config` field of the `Site` model. The format is optimized for:
- **Minimal tokens**: Removed redundant fields, flattened structures
- **Readability**: Clear property names
- **Extensibility**: Easy to add new features
- **Defaults**: Missing fields use sensible defaults

---

## Root Structure

```json
{
  "site": { },           // Site configuration (required)
  "entryPointPageId": "" // ID of landing page (optional, defaults to first page)
}
```

**Note:** `userLibrary` is omitted when empty (defaults to `{ "customAssets": [] }`)

---

## Site Object

```json
{
  "vibe": "minimal",  // Visual style: "minimal" | "bold" | "soft"
  "theme": {          // Color palette (flattened)
    "primary": "#920020",
    "secondary": "#2D5A7B",
    "neutral": "#E4E5DA"
  },
  "navigation": {     // Site-wide navigation (optional)
    "content": {}     // Only include customizations (defaults applied from moduleDefinitions)
  },
  "pages": []         // Array of page objects
}
```

**Navigation:**
- Navigation is a special site-level module that appears on every page
- By default, uses standard navigation from `moduleDefinitions` 
- Only store customizations in `site.navigation.content`
- If `navigation` object is omitted or empty, defaults are used
- Navigation uses site's `vibe` and `theme` like other modules

**Example with custom navigation:**
```json
{
  "vibe": "minimal",
  "theme": { "primary": "#920020" },
  "navigation": {
    "content": {
      "logo": { "text": "My Brand" },
      "links": [
        { "label": "Home", "route": "/" },
        { "label": "Services", "route": "/services" }
      ]
    }
  },
  "pages": []
}
```

**Optimizations:**
- `theme.colors` → `theme` (flattened)
- Colors stored directly without nesting
- Navigation only stores differences from default

---

## Page Object

```json
{
  "id": "home",        // Unique page ID (required)
  "name": "Home",      // Display name (required)
  "route": "/",        // URL path (required)
  "modules": []        // Array of module objects
}
```

---

## Module Object (Minimal)

```json
{
  "id": "hero-1",      // Unique module ID (required)
  "type": "hero",      // Module type (required)
  "content": {}        // Content fields (required)
}
```

**Omitted fields use defaults:**
- `moduleType`: `"standard"` (only include if "extended" or "custom")
- `name`: Uses `type` as fallback
- `customElements`: `[]` (empty array)
- `layout`: `"system:default"`
- `style`: `"system:{vibe}"` (inherits from site vibe)
- `visibility`: `{}` (all elements visible by default)
- `order`: Inferred from array index

---

## Module Content by Type

### Hero
```json
{
  "heading": "Welcome",
  "subheading": "Subtitle text",
  "ctaText": "Button text",   // Optional
  "ctaLink": "/path"           // Optional
}
```

### About
```json
{
  "title": "About Us",
  "description": "Long text..."
}
```

### Services
```json
{
  "title": "Our Services",
  "subtitle": "Optional subtitle",
  "items": [
    {
      "name": "Service Name",
      "description": "Service description",
      "icon": "person"  // Optional icon identifier
    }
  ]
}
```

### Calendar
```json
{
  "title": "Book a Session",
  "description": "Optional description"
}
```

### Contact
```json
{
  "email": "hello@example.com",
  "phone": "+48 600 000 000"
}
```

### Navigation (Site-Level Only)
```json
{
  "logo": {
    "text": "Logo",      // Logo text (or future: image URL)
    "type": "text"      // "text" | "image"
  },
  "links": [
    {
      "label": "Home",
      "route": "/"
    },
    {
      "label": "About",
      "route": "/about"
    }
  ],
  "bgColor": "transparent",
  "textColor": "rgb(30, 30, 30)"
}
```
**Note:** Navigation is stored at `site.navigation.content`, not in page modules. Only customizations need to be saved.

### Pricing
```json
{
  "title": "Pricing Plans",
  "subtitle": "Optional subtitle",
  "plans": [
    {
      "name": "Plan Name",
      "price": "99",
      "currency": "PLN",
      "period": "month",           // Optional: "month" | "year" | "session"
      "features": ["Feature 1"],   // Array of strings
      "featured": true             // Optional: highlight this plan
    }
  ]
}
```

---

## Complete Example

```json
{
  "site": {
    "vibe": "minimal",
    "theme": {
      "primary": "#920020",
      "secondary": "#2D5A7B",
      "neutral": "#E4E5DA"
    },
    "navigation": {
      "content": {
        "logo": { "text": "Yoga Studio" },
        "links": [
          { "label": "Home", "route": "/" },
          { "label": "Classes", "route": "/classes" },
          { "label": "Book", "route": "/calendar" }
        ]
      }
    },
    "pages": [
      {
        "id": "home",
        "name": "Home",
        "route": "/",
        "modules": [
          {
            "id": "hero-1",
            "type": "hero",
            "content": {
              "heading": "Welcome",
              "subheading": "Find balance",
              "ctaText": "Book Now",
              "ctaLink": "/calendar"
            }
          }
        ]
      },
      {
        "id": "contact",
        "name": "Contact",
        "route": "/contact",
        "modules": [
          {
            "id": "contact-1",
            "type": "contact",
            "content": {
              "email": "hello@example.com",
              "phone": "+48 600 000 000"
            }
          }
        ]
      }
    ]
  },
  "entryPointPageId": "home"
}
```

---

## Token Savings

**Old Format (~450 tokens per module):**
```json
{
  "id": "hero-1",
  "type": "hero",
  "moduleType": "standard",
  "name": "Hero Section",
  "content": { },
  "customElements": [],
  "layout": "system:default",
  "style": "system:minimal",
  "visibility": { "heading": true, "subheading": true },
  "order": 0
}
```

**New Format (~120 tokens per module):**
```json
{
  "id": "hero-1",
  "type": "hero",
  "content": { }
}
```

**Reduction: ~73% fewer tokens** (defaults applied by frontend)

---

## Frontend Defaults

When loading a module, the frontend applies these defaults:

```javascript
const module = {
  id: data.id,
  type: data.type,
  moduleType: data.moduleType || 'standard',
  name: data.name || data.type,
  content: data.content || {},
  customElements: data.customElements || [],
  layout: data.layout || 'system:default',
  style: data.style || `system:${site.vibe}`,
  visibility: data.visibility || {},
  order: data.order !== undefined ? data.order : index
};
```

**Rendering Logic:**
- Modules are **enabled by default** (no `enabled` field needed)
- Set `enabled: false` explicitly to hide a module
- `content` field replaces old `config` field (backward compatible)
- `route` field replaces old `path` field (backward compatible)

---

## Site Rendering Compatibility

Both `SiteApp.jsx` (FRONTEND) and `SiteRendererPage.jsx` (VIEWER_FRONTEND) support:
- **New format**: `template_config.site.pages` as array
- **Old format**: `template_config.pages` as object

Pages array is automatically converted to object internally for rendering.

---

## Migration from Old Format

The frontend (`NewEditorPage.jsx`) automatically creates default structures when:
- `template_config` is missing → Creates single Home page
- `template_config.site` is missing → Creates default site structure

Site viewers automatically handle both formats during rendering.

---

## Best Practices

1. **Only store what's different from defaults**
2. **Omit empty arrays/objects**: `customElements: []` → omit entirely
3. **Omit default values**: `moduleType: "standard"` → omit
4. **Use array index for order**: Don't include `order` field
5. **Keep content minimal**: Only required fields per module type

---

**Status:** ✅ Active Format (v2.0)
