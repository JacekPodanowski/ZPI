# AI Assistant Components

This directory contains all components and utilities for the integrated AI Assistant in the YourEasySite editor.

## Files

### `AIChatPanel.jsx`
The main chat interface component that appears in both Detail and Structure modes.

**Features:**
- Persistent chat session (singleton instance)
- Context-aware messaging (knows current mode and page)
- Visual processing indicators (loading, success)
- Automatic scroll to latest messages
- Refresh button to start new session
- Token optimization and module detection

**Props:**
- `onClose`: Function to close the chat panel
- `onProcessingChange`: Callback when processing state changes
- `onTaskComplete`: Callback when AI task finishes (success/error)
- `mode`: 'detail' or 'structure' - defines current editor context

### `aiHelpers.js`
Utility functions for AI operations.

**Key Functions:**
- `estimateTokens(text)` - Calculate rough token count for logging
- `extractModuleTypes(message)` - Detect module mentions in user messages
- `prepareSiteForContext(site)` - Prepare site data (currently returns full site)
- `buildContextMessage(mode, site, currentPageId)` - Build formatted context
- `validateAIResponse(response)` - Validate response structure
- `extractSiteFromResponse(response)` - Safely extract site data
- `formatErrorMessage(error)` - Format errors for display

### `system-prompt.md`
Complete system prompt and documentation for the AI assistant.

**Contains:**
- Role definition and responsibilities
- Site structure schema
- Available module types
- Context information format
- Response format specifications
- Example interactions
- Important rules and guidelines

## Architecture

The AI helpers provide basic utilities to prepare context and validate responses. Full site structure is sent to give AI complete information in the first message, avoiding back-and-forth delays.

### Data Flow

```
User Input → extractModuleTypes() (logging) → buildContextMessage()
                                            ↓
                                    Full Site Context
                                            ↓
                                    processAITask() → Backend
                                            ↓
                                    Poll for Result
                                            ↓
validateAIResponse() → extractSiteFromResponse() → Apply Changes
```

### Context Passing

The AI receives different context based on the current mode:

**Detail Mode:**
```json
{
  "mode": "detail",
  "viewContext": "Użytkownik jest w trybie szczegółów na stronie 'Home'",
  "currentPageId": "home",
  "currentPageName": "Home",
  "structure": { /* site object */ }
}
```

**Structure Mode:**
```json
{
  "mode": "structure",
  "viewContext": "Użytkownik jest w trybie struktury (widok wszystkich stron)",
  "structure": { /* site object */ }
}
```

### Response Handling

1. **Success Response**: Site object is extracted and applied via `replaceSiteStateWithHistory`
2. **Error Response**: Error message is displayed in chat
3. **Clarification Request**: AI asks for more details before proceeding

## Integration Points

### In DetailMode (`pages/Editor/DetailMode.jsx`)
```jsx
import AIChatPanel from '../../components_STUDIO/AI/AIChatPanel';

<AIChatPanel 
  onClose={() => setAiChatOpen(false)}
  onProcessingChange={setIsAiProcessing}
  onTaskComplete={(success) => setAiTaskCompleted(success)}
  mode="detail"
/>
```

### In StructureMode (`pages/Editor/StructureMode.jsx`)
```jsx
import AIChatPanel from '../../components_STUDIO/AI/AIChatPanel';

<AIChatPanel 
  onClose={() => setAiChatOpen(false)}
  onProcessingChange={setIsAiProcessing}
  onTaskComplete={(success) => setAiTaskCompleted(success)}
  mode="structure"
/>
```

### In NewEditorPage (`pages/Editor/NewEditorPage.jsx`)
Handles AI updates and applies them to the site state:

```jsx
const handleAIUpdate = (data) => {
  if (data.status === 'success' && data.site) {
    // Unwrap context if needed
    let siteData = data.site;
    if (data.site.mode && data.site.structure) {
      siteData = data.site.structure;
    }
    
    replaceSiteStateWithHistory(siteData, {
      type: 'ai-update',
      prompt: data.prompt,
      explanation: data.explanation
    });
  }
};
```

## State Management

The chat panel maintains its own state:
- `messages`: Array of chat messages
- `input`: Current input text
- `isProcessing`: Whether AI is currently processing
- `processingMessageId`: ID of the message being processed

Parent components track:
- `aiChatOpen`: Whether chat panel is visible
- `isAiProcessing`: Whether AI is working (for button indicator)
- `aiTaskCompleted`: Whether last task completed successfully

## API Integration

### Request Format
```javascript
POST /api/v1/ai-task/
{
  "prompt": "user request text",
  "context": { /* context object */ }
}
```

### Polling Format
```javascript
GET /api/v1/ai-task/{task_id}/poll/
```

### Response Format
```javascript
{
  "status": "success|error|pending|clarification",
  "site": { /* updated site object */ },
  "explanation": "What was changed",
  "prompt": "Original request"
}
```

## Best Practices

1. **Always provide mode context** - helps AI understand user's intent
2. **Unwrap responses properly** - check for context wrapper objects
3. **Handle all response types** - success, error, clarification
4. **Maintain session state** - use singleton pattern for chat panel
5. **Show clear feedback** - loading indicators, success icons
6. **Log extensively** - helps debug AI response issues

## Future Enhancements

- [ ] Add undo/redo for AI changes
- [ ] Support for multi-step workflows
- [ ] Image generation integration
- [ ] Voice input support
- [ ] Suggested actions/prompts
- [ ] Chat history persistence across sessions
