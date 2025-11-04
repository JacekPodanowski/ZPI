# AI System Documentation: Key Architecture

## 1. Overview

This document outlines an AI integration architecture for a module-based site builder. The system is designed for maximum efficiency by minimizing token usage through progressive information loading, aggressive caching, and compact data formats, ensuring full AI capabilities at a low operational cost.

---

## 2. Token Optimization Strategy

The core goal is to minimize tokens without sacrificing functionality.

### Token Budget per Interaction

| Phase | Token Count | Description |
|---|---|---|
| Initial Context | ~50 | System overview sent once per session |
| Module Descriptor | ~150 | Sent once per module type |
| User Message | 10-100 | Natural language user request |
| AI Response | ~100 | Limited to 75 words |
| **Total per interaction** | **~300-400** | A manageable conversation size |

### Key Optimization Techniques

1.  **Compressed Descriptors**: Field names in module descriptors are shortened (e.g., `description` becomes `desc`, `type` becomes `t`), reducing token count by ~15%.

2.  **Descriptor Caching**: Each module's descriptor is sent to the AI only once per session. A `DescriptorCache` tracks what the AI already knows, saving ~150 tokens on every subsequent interaction with that module.

3.  **Minimal Changes**: The AI is instructed to return only the fields that have changed, not the entire module configuration. This reduces response size by ~80%.
    ```javascript
    // Instead of the full object, AI returns:
    {
      moduleId: 'hero-1',
      changed: {
        heading: "New Welcome Message"
      }
    }
    ```

4.  **Response Truncation**: AI's conversational responses are programmatically limited to 75 words to prevent verbose, high-token explanations.

---

## 3. System Context

A single, compressed context object is sent at the start of each session to give the AI a complete overview of the system's capabilities.

### Initial Context Structure
File: `FRONTEND/src/SITES/components/modules/systemContext.js`
```javascript
export const SYSTEM_CONTEXT = {
  system: 'Module-based site builder with vibes (styling) and themes (colors)',
  
  modules: [
    { type: 'hero', desc: 'Eye-catching intro', layouts: ['centered', 'split'] },
    { type: 'about', desc: 'Tell story', layouts: ['timeline', 'grid'] },
    { type: 'services', desc: 'Showcase offerings', layouts: ['cards', 'list'] },
    { type: 'calendar', desc: 'Booking interface', layouts: ['compact', 'detailed'] },
    { type: 'contact', desc: 'Get in touch', layouts: ['form', 'info'] },
    { type: 'navigation', desc: 'Site nav', layouts: ['horizontal', 'centered'], siteLevel: true }
  ],
  
  vibes: ['vibe1', 'vibe2', 'vibe3', 'vibe4', 'vibe5'],
  
  themes: ['modernWellness', 'sereneForest', 'oceanCalm', 'sunsetWarmth', 'lavenderDream', /* ...and 5 more */],
  
  rules: [
    'Empty content field = use default',
    'Request full descriptor only when needed',
    'Return only changed fields in output',
    'Keep responses under 75 words'
  ]
};
```
**Token Cost**: Approximately 50 tokens.

---

## 4. Core Components: Caching & Context

Two primary classes manage the conversation's state and efficiency.

### DescriptorCache
-   **Purpose**: Tracks which module descriptors have already been sent to the AI in the current session.
-   **Key Functions**:
    -   Prevents sending the same descriptor multiple times.
    -   Stores compressed versions of descriptors.
    -   Provides a summary of what the AI "knows".

### ContextManager
-   **Purpose**: Maintains the state of the user's editing session to provide the AI with relevant, minimal context for each request.
-   **State Tracked**:
    -   `currentPage`: The page currently being edited.
    -   `activeModules`: The last 3 modules the user interacted with.
    -   `knownDescriptors`: A list of descriptors the AI has received.
    -   `conversationHistory`: The last 10 user/AI messages.
    -   `siteConfig`: The current configuration of the entire site.

---

## 5. Typical Conversation Flow

This flow demonstrates the token optimization in practice.

1.  **Session Start**
    *   Client sends `SYSTEM_CONTEXT` to the AI (~50 tokens).
    *   *AI now understands the system, modules, and rules.*

2.  **User: "Add a hero section"**
    *   Client checks `DescriptorCache`: 'hero' is not known.
    *   Client sends the compressed `HERO_DESCRIPTOR` (~150 tokens).
    *   `DescriptorCache` is updated to mark 'hero' as sent.
    *   AI processes the request and returns a minimal change object.

3.  **AI Response (~100 tokens)**
    *   Message: "Done. I've added a centered hero section to your page."
    *   Changes: `[{ moduleId: 'hero-1', changed: { heading: "..." } }]`

4.  **User: "Change the hero heading"**
    *   Client checks `DescriptorCache`: 'hero' is already known.
    *   **No descriptor is sent.**
    *   Client sends the user's message with minimal context (e.g., current page).
    *   AI processes the request using its existing knowledge.

5.  **AI Response (~40 tokens)**
    *   Message: "The heading has been updated."
    *   Changes: `[{ moduleId: 'hero-1', changed: { heading: "New Text" } }]`

**Result**: The second interaction cost only ~50 tokens instead of ~200, thanks to caching.

---

## 6. Future Integration Roadmap

### Phase 1: Foundation (Current)
✅ Token optimization utilities, context management, and module descriptors are defined.

### Phase 2: AI Connection (Next)
-   [ ] Integrate with a live service like OpenAI API.
-   [ ] Implement real message processing and streaming responses.
-   [ ] Add robust error handling and retry logic.

### Phase 3: Advanced Features
-   [ ] Enable multi-modal input (e.g., design from an image).
-   [ ] Provide proactive design and SEO suggestions.
-   [ ] Implement AI-driven function calling for complex actions like `add_module` or `update_module`.

---

## 7. Best Practices Summary

-   **Always Send System Context First**: Establishes the operational rules for the AI.
-   **Cache Descriptors Aggressively**: Send each descriptor only once per session.
-   **Use Minimal Contexts**: Provide only the information needed for the current task.
-   **Enforce Compact Responses**: Mandate minimal changes and truncate verbose messages.
-   **Update Context on User Actions**: Keep the `ContextManager` synchronized with the UI state.
-   **Pre-load Essential Modules**: Send descriptors for `hero`, `about`, and `services` on editor load to speed up initial interactions.