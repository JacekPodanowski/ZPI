# Template Config Format

**Version:** 2.1 (Current Implementation)
**Last Updated:** November 13, 2025
**Status:** ✅ Active Format - Fully Implemented in New Editor

## Overview

This document defines the JSON format for storing site configurations in the `template_config` field of the `Site` model. The format is:
- **Optimized for minimal size**: Removes redundant fields, flattens structures
- **Editor-native**: Matches the store structure used by `newEditorStore.js`
- **API-compatible**: Saved directly via `PATCH /api/v1/sites/{id}/`
- **Backward-compatible**: Old formats auto-converted on load

---

## Root Structure (What Gets Saved)

The frontend store (`newEditorStore.js`) directly saves the `site` object to `template_config`:

```json
{
  "styleId": "auroraMinimal",
  "styleOverrides": { "density": 1.2 },
  "style": { ... },
  "navigation": { "content": { ... } },
  "pages": [ ... ],
  "pageOrder": [ "home", "page-2", "page-3" ]
}
```

**Note on structure:**
- The root IS the `site` object (not wrapped in `{ site: {} }`)
- Frontend sends entire `site` object when saving
- Backend stores it in `template_config` JSONField
- When loading, frontend checks for both old and new formats for compatibility

---

## Page Structure

```json
{
  "id": "home",
  "name": "Home",
  "route": "/",
  "modules": [ ... ],
  "order": 0
}
```

**Required fields:**
- `id`: Unique page identifier
- `name`: Display name
- `route`: URL path (auto-generated if not provided)
- `modules`: Array of module objects

---

## Module Structure (Actual Implementation)

```json
{
  "id": "module-hero-1",
  "type": "hero",
  "name": "Hero Section",
  "content": { ... },
  "order": 0,
  "enabled": true
}
```

**Actually stored** (what's really in the config):
- `id`: Unique module ID
- `type`: Module type (hero, about, services, gallery, calendar, contact, text, video, testimonials, pricing, faq, team)
- `name`: Display name (defaults to type)
- `content`: All content fields for this module
- `order`: Position in page (defaults to array index)
- `enabled`: Boolean (defaults to true, omitted when true)

**NOT stored** (frontend derives these):
- `moduleType`: Always defaults to `"standard"` (custom modules not yet implemented)
- `layout`: Stored in content if customized, otherwise defaults
- `style`: Inherited from site's styleId/styleOverrides
- `customElements`: Not yet implemented
- `visibility`: Not used in current implementation

---

## Actual Module Content by Type

### Hero
```json
{
  "type": "hero",
  "content": {
    "heading": "Welcome to Our Site",
    "subheading": "Discover what we offer",
    "ctaText": "Get Started",
    "ctaLink": "/services"
  }
}
```

### About
```json
{
  "type": "about",
  "content": {
    "title": "About Us",
    "description": "Our story and mission..."
  }
}
```

### Services
```json
{
  "type": "services",
  "content": {
    "title": "Our Services",
    "items": [
      {
        "name": "Service 1",
        "description": "Description",
        "icon": "person"
      }
    ]
  }
}
```

### Gallery
```json
{
  "type": "gallery",
  "content": {
    "title": "Gallery",
    "images": [
      {
        "url": "https://...",
        "caption": "Photo 1"
      }
    ]
  }
}
```

### Calendar
```json
{
  "type": "calendar",
  "content": {
    "title": "Book a Session"
  }
}
```

### Contact
```json
{
  "type": "contact",
  "content": {
    "email": "hello@example.com",
    "phone": "+48 600 000 000"
  }
}
```

### Testimonials
```json
{
  "type": "testimonials",
  "content": {
    "title": "What Our Clients Say",
    "testimonials": [
      {
        "text": "Great service!",
        "author": "John Doe",
        "role": "Client"
      }
    ]
  }
}
```

### Pricing
```json
{
  "type": "pricing",
  "content": {
    "title": "Pricing Plans",
    "plans": [
      {
        "name": "Basic",
        "price": "99",
        "currency": "PLN",
        "period": "month",
        "features": ["Feature 1", "Feature 2"],
        "featured": false
      }
    ]
  }
}
```

### Pricing, FAQ, Team, Text, Video
All follow same pattern - array items stored in content for collections.

---

## Real-World Example (What Gets Sent)

When you save a site in the editor, this is what goes to the API:

```json
{
  "styleId": "auroraMinimal",
  "styleOverrides": {
    "density": 1.1,
    "roundness": "soft"
  },
  "style": {
    "id": "auroraMinimal",
    "name": "Aurora Minimal",
    "backgroundColor": "rgb(228,229,218)",
    "accentColor": "rgb(146,0,32)",
    "options": {
      "roundness": "soft",
      "shadowPreset": "floating",
      "borderWidthPreset": "hairline"
    }
  },
  "navigation": {
    "content": {
      "logo": {
        "text": "My Yoga Studio"
      },
      "links": [
        { "label": "Home", "route": "/" },
        { "label": "Classes", "route": "/classes" },
        { "label": "Book", "route": "/booking" }
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
          "id": "module-hero-1",
          "type": "hero",
          "name": "Hero",
          "content": {
            "heading": "Welcome to Yoga Studio",
            "subheading": "Find your balance",
            "ctaText": "Book Now",
            "ctaLink": "/booking"
          },
          "order": 0,
          "enabled": true
        },
        {
          "id": "module-services-1",
          "type": "services",
          "name": "Services",
          "content": {
            "title": "Our Classes",
            "items": [
              {
                "name": "Hatha Yoga",
                "description": "Beginner friendly",
                "icon": "spa"
              }
            ]
          },
          "order": 1
        }
      ],
      "order": 0
    },
    {
      "id": "booking",
      "name": "Book a Class",
      "route": "/booking",
      "modules": [
        {
          "id": "module-calendar-1",
          "type": "calendar",
          "name": "Calendar",
          "content": {
            "title": "Book Your Session"
          },
          "order": 0
        }
      ],
      "order": 1
    }
  ],
  "pageOrder": ["home", "booking"]
}
```

---

## Loading & Compatibility

### How the Editor Loads Sites

**NewEditorPage.jsx** (entry point):
1. Fetches site from API → gets `template_config`
2. Checks if `template_config.site` exists (new format)
3. If not, treats `template_config` root as site (current format)
4. Normalizes data via `normalizeSiteConfig()`
5. Stores in Zustand via `loadSite()`

**Old Format Support:**
```javascript
if (data.template_config && data.template_config.site) {
  // New format: { site: { pages: [...] } }
  site = data.template_config.site;
} else {
  // Current format: { pages: [...] } (root is site object)
  site = data.template_config;
}
```

### Normalization Process

`newEditorStore.js` runs `normalizeModule()`, `normalizePage()`, `normalizeSiteConfig()`:
- Converts old field names (`path` → `route`, `config` → `content`)
- Applies defaults for missing fields
- Generates IDs if missing
- Sorts modules by order
- Validates structure

---

## Saving Process

### Frontend → API Flow

**EditorTopBar.jsx** `handleSave()`:
1. Deep clones the store's `site` object
2. Finds all blob URLs (temporary image uploads)
3. Uploads each blob to `/upload/` endpoint
4. Replaces blob URLs with permanent URLs in config
5. Calls `updateSiteTemplate(siteId, finalConfig, name)`

**updateSiteTemplate** (siteService.js):
```javascript
const payload = {
  template_config: templateConfig,  // The full site object
  name: name  // Optional, for title updates
};
PATCH /api/v1/sites/{siteId}/ ← payload
```

### Backend Stores

Django model receives the full config in `template_config` JSONField:
- Field: `Site.template_config` (JSONField)
- Auto-includes `updated_at` timestamp
- Creates `SiteVersion` record for versioning

---

## Key Differences from Documentation

| Item | Documentation Said | Actually Works |
|------|-------------------|----------------|
| Root structure | `{ site: {}, entryPointPageId: "" }` | Root IS site object, no wrapper |
| Storage | Wrapped in "site" key | Direct site object in template_config |
| entryPointPageId | In root | Derived from `site.pages[0].id` or explicit |
| userLibrary | In root | Stored separately in store (not yet persisted) |
| Navigation | At `site.navigation.content` | ✅ Correct |
| Vibes | Called "vibe" | ✅ Changed to "styleId" + "styleOverrides" |
| Defaults | Extensive | ✅ Frontend applies via normalization |

---

## What's Working in Production

✅ **Full save/load cycle:**
- Create site → Save to API → Close browser → Reopen → Data restored
- Edit modules → Changes auto-saved
- Upload images → Blob URLs converted to permanent URLs
- Navigation editing → Persists via API

✅ **Version history:**
- Each save creates versioned snapshot
- Can load previous versions
- Change summaries tracked

✅ **Style system:**
- Style selection persists
- Color overrides persist
- Theme data stored in `style` object

---

## What's Not Yet Persisted

❌ **User Library:**
- Saved in store memory only
- Not persisted to backend
- Lost on page refresh

❌ **Custom Elements:**
- Not yet implemented

❌ **Custom Modules:**
- Not yet implemented

---

## Frontend Defaults Applied on Load

When loading `template_config`, frontend applies:

```javascript
// Module defaults
{
  moduleType: 'standard',
  layout: null,
  order: 0,
  enabled: true
}

// Page defaults
{
  order: 0
}

// Site defaults
{
  styleId: 'auroraMinimal',
  styleOverrides: {},
  style: { ... computed ... },
  navigation: {},
  pageOrder: [ ... inferred from pages ... ]
}
```

---

## Best Practices

1. **Only required fields needed:**
   - Module: `id`, `type`, `content`
   - Page: `id`, `name`, `route`, `modules`
   - Site: `pages` (others have sensible defaults)

2. **Omit falsy values:**
   - `enabled: true` → omit
   - `order: 0` → omit (use array index)
   - Empty `overrides: {}` → omit

3. **Content structure:**
   - Always lowercase field names
   - Array items for collections (services, gallery, testimonials, etc.)
   - Use theme colors for UI (when implemented)

4. **IDs:**
   - Must be unique within scope (page-level for modules, site-level for pages)
   - Use format: `module-{type}-{timestamp}` for auto-generation
   - Never use spaces or special characters

---

## API Integration

### Save Endpoint
```
PATCH /api/v1/sites/{id}/
Content-Type: application/json

{
  "template_config": { ... full site object ... },
  "name": "Updated Title"  // optional
}
```

### Response
```json
{
  "id": 123,
  "name": "Updated Title",
  "template_config": { ... saved config ... },
  "updated_at": "2025-11-13T10:30:00Z",
  "latest_version": {
    "version_number": 42,
    "template_config": { ... },
    "created_at": "2025-11-13T10:30:00Z"
  }
}
```

---

## Migration from Older Versions

The system auto-migrates:
- **Pre-Phase2** (pages as object): Converted to array
- **Pre-Phase3** (using "vibe" string): Converted to "styleId"
- **Missing fields**: Filled with sensible defaults
- **Old module names**: Mapped to new types

No data loss. Old configs still work.

---

## Best Practices

1. **Only store what's different from defaults**
2. **Omit empty arrays/objects**: `customElements: []` → omit entirely
3. **Omit default values**: `moduleType: "standard"` → omit
4. **Use array index for order**: Don't include `order` field
6. **Keep content minimal**: Only required fields per module type

---

**Status:** ✅ Production Ready (Phases 1-2 Complete)
