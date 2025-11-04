# Module-Based Site Builder: Core Architecture

## 1. System Overview

This document outlines a module-based site builder designed for creating personal websites. The system's architecture prioritizes AI token optimization, responsive design, and a clear, maintainable structure. Users can assemble websites by combining various content modules, each with multiple layouts. The site's look and feel are controlled globally through a "Vibe" system (for spacing, typography, and styles) and a "Theme" system (for color schemes).

### High-Level Design

-   **Modules**: Reusable content blocks like 'Hero', 'About', and 'Services' that form the building blocks of a page.
-   **Layouts**: Different visual arrangements for each module (e.g., a 'Hero' module can have 'centered', 'split', or 'fullscreen' layouts).
-   **Vibes**: Site-wide styling rules that define the overall aesthetic, including spacing, borders, shadows, and typography.
-   **Themes**: Palettes that control the color scheme, with support for both light and dark modes.

---

## 2. Core Principles

### Token Optimization for AI

The system is engineered to minimize AI token usage through several key techniques:
-   **Compressed Descriptors**: Module definitions sent to the AI use shortened keys (`t` for type, `d` for description) to reduce token count.
-   **Descriptor Caching**: Each module's descriptor is sent to the AI only once per session, preventing redundant data transmission.
-   **Progressive Loading**: Only essential module descriptors are loaded initially, with others loaded on demand.
-   **Minimal AI Output**: The AI is instructed to return only the fields that have been changed, not the entire configuration.
-   **Response Truncation**: AI-generated explanations are capped at 75 words to keep conversations concise.

### Responsive Design

All modules are built with a mobile-first approach and must be responsive across various screen sizes.
-   **Breakpoints**: The system uses standard breakpoints for mobile (default), tablet (`md:`), and desktop (`lg:`).
-   **Common Patterns**:
    -   **Grid Layouts**: Single-column on mobile, transitioning to multi-column on larger screens.
    -   **Typography Scaling**: Font sizes adjust for readability on different devices.
    -   **Responsive Spacing**: Padding and margins adapt to the screen size.
    -   **Navigation**: A standard hamburger menu is used on mobile.

### Default Content

To ensure modules are never empty, any unspecified content field automatically populates with default values. This allows for rapid prototyping and ensures visual completeness.

---

## 3. Module Structure

Every module in the system follows a standardized file structure for consistency and maintainability.

-   **`index.jsx`**: The main component that handles layout switching and merges user content with default values.
-   **`descriptor.js`**: A token-optimized JSON object that defines the module's structure, fields, and layouts for the AI.
-   **`defaults.js`**: Provides default content for each layout, often using placeholder images to ensure a polished look.
-   **`layouts/`**: A directory containing the individual React components for each layout variant.

### Descriptor Pattern (`descriptor.js`)

The descriptor is a compact, AI-readable definition of a module's properties.

```javascript
export const MODULE_DESCRIPTOR = {
  type: 'moduleName',
  desc: 'Brief module description',
  fields: {
    fieldName: {
      t: 'text',           // type (e.g., text, image, array, enum)
      req: true,           // is the field required?
      d: 'Field description',
      vals: ['a', 'b']     // possible values for enum types
    }
  },
  layouts: ['layout1', 'layout2', 'layout3']
};
```

---

## 4. Styling: Vibes and Themes

The visual styling of the site is managed by two distinct, yet complementary systems.

### Vibe System

Vibes control the overall aesthetic and feel of the site by defining global CSS classes for:
-   Spacing (padding and margins)
-   Borders and shadows
-   Corner roundness
-   Animations and transitions
-   Typography (heading and body text sizes)
-   Button and card styles

**Available Vibes**: `Clean & Spacious`, `Bold & Dramatic`, `Soft & Rounded`, `Compact & Efficient`, and `Expansive & Elegant`.

### Theme System

Themes manage the color palette of the site and include support for both light and dark modes. Each theme defines a set of color properties:
-   `background`
-   `text`
-   `primary` (for accents, buttons, and headings)
-   `secondary` (for borders and less important elements)

**Available Themes**: A total of 10 themes are available, including `modernWellness`, `sereneForest`, `oceanCalm`, and `sunsetWarmth`.

---

## 5. AI Integration

The AI integration is designed to be efficient and context-aware.

### Initial Context

At the start of each conversation, a compact `SYSTEM_CONTEXT` object is sent to the AI. This object, costing only ~50 tokens, provides the AI with a complete overview of all available modules, layouts, vibes, and themes, along with the core operational rules.

### Progressive Loading Workflow

1.  **Session Start**: The `SYSTEM_CONTEXT` is sent to the AI.
2.  **User Request**: The system parses the user's message to identify which modules are being referenced.
3.  **Cache Check**: The system checks if the descriptors for the required modules have already been sent.
4.  **Descriptor Loading**: If a descriptor is unknown to the AI, it is sent and then cached.
5.  **AI Response**: The AI processes the request and returns a minimal set of changes.

---

## 6. Adding a New Module

The process for extending the system with a new module is straightforward and follows a clear, step-by-step pattern.

1.  **Create Directory**: Add a new folder for the module under `FRONTEND/src/SITES/components/modules/`.
2.  **Define Descriptor**: Create a `descriptor.js` file with the module's type, fields, and layouts.
3.  **Set Defaults**: Create a `defaults.js` file to provide default content for each layout.
4.  **Build Layouts**: Create the React components for each layout in the `layouts/` sub-directory, ensuring they are responsive.
5.  **Create Main Component**: Develop the main `index.jsx` file to manage layout switching and content merging.
6.  **Register Module**: Add the new module to the `MODULE_REGISTRY`.
7.  **Update AI Context**: Add a summary of the new module to the `SYSTEM_CONTEXT` to make the AI aware of its existence.