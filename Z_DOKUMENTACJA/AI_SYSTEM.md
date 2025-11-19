# AI System Documentation: Interactive AI Editing System

## 1. Overview

YourEasySite uses a **WebSocket-powered interactive AI editing system** that provides real-time, collaborative editing experience. The AI assistant acts as an intelligent co-editor with full site context, processing natural language commands and returning complete, modified site configurations.

**Key Features:**
- **Full Context Processing**: AI receives entire site JSON for comprehensive understanding
- **Real-time Updates**: WebSocket delivery of complete modified configurations
- **Automatic History Tracking**: Every AI change creates an undo point
- **Seamless Integration**: Changes render immediately in the visual editor

---

## 2. System Architecture

### 2.1. Interactive Editing Flow

```
User Command (Chat Panel)
        ↓
    POST /api/v1/ai-task/
        ↓
    Celery Queue (execute_complex_ai_task)
        ↓
    Claude Processing (Full Site Context)
        ↓
    WebSocket Notification (ai_updates_{user_id})
        ↓
    Frontend Receives Full Site JSON
        ↓
    Store: Save Current State to History
        ↓
    Store: Replace Site State
        ↓
    Canvas Auto-Renders New State
```

### 2.2. Core Components

#### Backend Components

1. **Django Channels Infrastructure**
   - **ASGI Application** (`site_project/asgi.py`): ProtocolTypeRouter for HTTP + WebSocket
   - **Channel Layers** (`settings.py`): Redis-backed message passing
   - **WebSocket Routing** (`api/routing.py`): URL pattern `ws/ai-updates/{user_id}/`
   - **AI Consumer** (`api/consumers.py`): WebSocket connection handler

2. **AI Processing**
   - **ClaudeService** (`api/ai_services.py`): Returns complete `{site: {...}, explanation: "..."}` JSON
   - **Celery Task** (`api/tasks.py`): `execute_complex_ai_task(user_prompt, site_config, user_id, context)`
   - **API Endpoint** (`api/views.py`): `AITaskView` queues tasks with user_id

3. **Communication Flow**
   - User-specific WebSocket groups: `f'ai_updates_{user_id}'`
   - Channel layer `group_send()` broadcasts to all user connections
   - Asynchronous message delivery with automatic reconnection

#### Frontend Components

1. **WebSocket Listener** (`NewEditorPage.jsx`)
   ```javascript
   useEffect(() => {
     const socket = new WebSocket(`ws://${host}/ws/ai-updates/${user.id}/`);
     socket.onmessage = (event) => {
       const data = JSON.parse(event.data);
       if (data.status === 'success' && data.site) {
         replaceSiteStateWithHistory(data.site, {
           type: 'ai-update',
           explanation: data.explanation
         });
       }
     };
     return () => socket.close();
   }, [user?.id]);
   ```

2. **AI Chat Panel** (`MockAIChatPanel.jsx`)
   - Sends full `site` object to backend: `processAITask(userPrompt, site)`
   - Shows "Pracuję nad tym..." message
   - No local state updates (handled via WebSocket)

3. **Store Integration** (`newEditorStore.js`)
   ```javascript
   replaceSiteStateWithHistory: (newSiteConfig, metadata) => {
     // 1. Save current state to history BEFORE change
     const snapshot = createSnapshot(state);
     // 2. Normalize incoming site config
     const normalizedSite = newSiteConfig.site || newSiteConfig;
     // 3. Update history stack
     const historyUpdate = pushHistoryEntry(state, metadata, snapshot);
     // 4. Replace site state and mark as unsaved
     return { site: normalizedSite, hasUnsavedChanges: true, ...historyUpdate };
   }
   ```

---

## 3. Claude System Prompt & Response Format

### 3.1. System Prompt (Full Site Context)

The Claude model receives a comprehensive prompt that:
1. Explains the entire YourEasySite platform architecture
2. Provides full site JSON structure with all pages and modules
3. Requires **COMPLETE site JSON** in response (not just changes)
4. Enforces strict JSON format validation

**Critical Requirements:**
- **Input**: Entire `site` object with all pages, modules, theme, vibe
- **Output**: Complete modified `site` object + explanation
- **Token Limit**: 8192 (increased from 4096 for full configs)

### 3.2. Response Format

```json
{
  "site": {
    "vibe": "auroraMinimal",
    "theme": {
      "primary": "#920020",
      "secondary": "#2D5A7B",
      "neutral": "#E4E5DA"
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
            "content": { /* complete content */ },
            "enabled": true
          }
        ]
      }
    ]
  },
  "explanation": "Zmieniłem tytuł sekcji hero na 'Witaj w mojej pracowni' oraz zaktualizowałem opis..."
}
```

### 3.3. Example Interaction

**User Command:** "Zmień tytuł strony głównej na 'Moja Pracownia Jogi'"

**Claude Receives:**
```json
{
  "site": {
    "vibe": "auroraMinimal",
    "theme": { "primary": "#920020" },
    "pages": [
      {
        "id": "home",
        "modules": [
          {
            "id": "hero-1",
            "type": "hero",
            "content": { "title": "Stary Tytuł", "subtitle": "Opis" }
          }
        ]
      }
    ]
  }
}
```

**Claude Returns:**
```json
{
  "site": {
    "vibe": "auroraMinimal",
    "theme": { "primary": "#920020" },
    "pages": [
      {
        "id": "home",
        "modules": [
          {
            "id": "hero-1",
            "type": "hero",
            "content": { "title": "Moja Pracownia Jogi", "subtitle": "Opis" }
          }
        ]
      }
    ]
  },
  "explanation": "Zaktualizowałem tytuł sekcji hero na stronie głównej na 'Moja Pracownia Jogi'."
}
```

**Frontend Effect:**
1. WebSocket receives full site JSON
2. Current state saved to history (undo point created)
3. Site state replaced with new JSON
4. Canvas re-renders with new title
5. User sees change instantly

---

## 4. WebSocket Infrastructure

### 4.1. Backend Configuration

**Django Channels Setup** (`settings.py`):
```python
INSTALLED_APPS = [
    'channels',  # MUST be first
    'daphne',
    # ... other apps
]

ASGI_APPLICATION = 'site_project.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}
```

**ASGI Application** (`asgi.py`):
```python
application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(api.routing.websocket_urlpatterns)
        )
    ),
})
```

**WebSocket Routing** (`api/routing.py`):
```python
websocket_urlpatterns = [
    re_path(r'ws/ai-updates/(?P<user_id>\w+)/$', AIConsumer.as_asgi()),
]
```

### 4.2. AI Consumer Implementation

**Connection Management** (`api/consumers.py`):
```python
class AIConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'ai_updates_{self.user_id}'
        
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
    
    async def send_ai_update(self, event):
        await self.send(text_data=json.dumps({
            'status': event['status'],
            'site': event.get('site'),
            'explanation': event.get('explanation'),
            'error': event.get('error')
        }))
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
```

### 4.3. Celery to WebSocket Bridge

**Task Implementation** (`api/tasks.py`):
```python
@shared_task(bind=True, max_retries=2)
def execute_complex_ai_task(self, user_prompt, site_config, user_id, context=None):
    try:
        result = claude_service.process_complex_task(user_prompt, site_config, context)
        
        # Send via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'ai_updates_{user_id}',
            {
                'type': 'send_ai_update',
                'status': 'success',
                'site': result['site'],
                'explanation': result['explanation'],
                'prompt': user_prompt
            }
        )
    except Exception as exc:
        async_to_sync(channel_layer.group_send)(
            f'ai_updates_{user_id}',
            {
                'type': 'send_ai_update',
                'status': 'error',
                'error': str(exc)
            }
        )
```

---

## 5. History & Undo System Integration

### 5.1. Automatic History Creation

Every AI update creates an undo point **BEFORE** applying changes:

```javascript
replaceSiteStateWithHistory: (newSiteConfig, metadata = {}) =>
  set((state) => {
    // 1. Create snapshot of CURRENT state (before change)
    const snapshotOverride = createSnapshot(state);
    
    // 2. Normalize incoming site config
    const normalizedSite = newSiteConfig.site || newSiteConfig;
    
    // 3. Push current state to history with AI metadata
    const historyUpdate = pushHistoryEntry(state, 'detail', {
      type: metadata.type || 'ai-update',
      prompt: metadata.prompt,
      explanation: metadata.explanation,
      timestamp: Date.now()
    }, snapshotOverride);
    
    // 4. Update site state
    return {
      site: normalizedSite,
      hasUnsavedChanges: true,
      ...historyUpdate
    };
  })
```

### 5.2. Undo Behavior

User clicks "Undo" → Previous state restored → AI change reverted
- History stack maintains full site snapshots
- Redo available after undo
- History metadata shows "AI modification: [explanation]"

---

## 6. Cost Optimization

### 6.1. Token Usage Strategy

**Simplified Architecture** (All requests → Claude):
- **Per Request**: ~2000-4000 tokens (full site config) + ~1000-2000 tokens (response)
- **Cost**: ~$0.012-$0.024 per request (input + output)
- **Target**: < $1.00 per 100 user interactions

**Why No Flash Triage:**
- Eliminates double API calls
- Simpler architecture, easier maintenance
- Claude Sonnet 4.5 handles all tasks reliably
- WebSocket enables async processing without UX penalty

### 6.2. Future Optimizations

- **Caching**: Store common transformations (e.g., "change color to X")
- **Incremental Context**: Send only changed pages/modules for follow-up edits
- **Batch Processing**: Group multiple rapid commands
- **Smart Prompting**: Compress system prompt while preserving accuracy

---

## 7. Error Handling & Resilience

### 7.1. WebSocket Error Scenarios

| Scenario | Backend Behavior | Frontend Behavior |
|----------|-----------------|-------------------|
| Connection Lost | Consumer logs disconnect | Auto-reconnect on page refresh |
| Invalid Message | Log error, skip processing | Show generic error to user |
| User Not Found | Reject connection | Show "Authentication required" |
| Task Timeout | Send error via WebSocket | Display retry option |

### 7.2. Celery Task Resilience

```python
@shared_task(
    bind=True,
    max_retries=2,
    soft_time_limit=25*60,  # 25 min soft limit
    time_limit=30*60        # 30 min hard limit
)
def execute_complex_ai_task(self, ...):
    try:
        # Process with Claude
    except SoftTimeLimitExceeded:
        # Graceful degradation
        send_timeout_message_via_websocket()
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
```

### 7.3. Frontend Error Display

```javascript
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.status === 'error') {
    setMessages(prev => [...prev, {
      sender: 'ai',
      text: `Wystąpił błąd: ${data.error}. Spróbuj ponownie.`
    }]);
  }
};
```

---

## 8. Development & Testing

### 8.1. Local Development Setup

**Required Services:**
```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  backend:
    build: ./BACKEND
    environment:
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - redis
  
  celery:
    build: ./BACKEND
    command: celery -A site_project worker --loglevel=info
    depends_on:
      - redis
  
  frontend:
    build: ./FRONTEND
    environment:
      - REACT_APP_API_URL=http://backend:8000
```

**Environment Variables:**
```bash
CLAUDE_API_KEY=sk-ant-api03-...
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

### 8.2. Testing Workflow

1. **Start Services**: `docker-compose up`
2. **Open Editor**: Navigate to `/editor/{site_id}`
3. **Send AI Command**: Type in chat panel
4. **Monitor Logs**:
   - Backend: `AITaskView queued task {task_id}`
   - Celery: `execute_complex_ai_task: Processing...`
   - WebSocket: `Received AI update: {status: 'success'}`
   - Frontend: `Applying AI-generated site update`
5. **Verify**:
   - Changes appear in canvas
   - Undo restores previous state
   - History shows AI metadata

### 8.3. Key Metrics to Monitor

- **WebSocket Connection Success Rate**: > 99%
- **Task Processing Time**: < 30s for 90% of requests
- **Token Usage per Request**: 3000-6000 tokens average
- **Error Rate**: < 2%
- **User Satisfaction**: Measured via feedback widget

---

## 9. Future Enhancements

### 9.1. Phase 1: Enhanced Feedback (Next)
- [ ] Real-time progress indicators ("Analyzing...", "Generating...", "Finalizing...")
- [ ] AI confidence scores for suggestions
- [ ] Inline explanations with highlighted changes
- [ ] Voice input support

### 9.2. Phase 2: Advanced AI Features
- [ ] Multi-turn conversations with context retention
- [ ] Proactive design suggestions ("This section could use more contrast")
- [ ] A/B testing content variations
- [ ] SEO optimization recommendations
- [ ] Image generation integration

### 9.3. Phase 3: Collaborative Editing
- [ ] Multiple users editing same site with AI assistance
- [ ] Conflict resolution for simultaneous AI + manual edits
- [ ] Shared undo/redo history
- [ ] AI-powered design review mode

---

## 10. Best Practices

### 10.1. For Developers

1. **Always send full site context** to Claude (not just modules)
2. **Validate WebSocket messages** before processing
3. **Log all AI interactions** with user_id correlation
4. **Test WebSocket reconnection** scenarios
5. **Monitor token usage** and optimize prompts regularly

### 10.2. For Users (via UI Guidance)

1. **Be specific in commands** for better results
2. **Review AI changes** before publishing
3. **Use Undo freely** - every AI change is reversible
4. **Provide context** in multi-step edits
5. **Save frequently** - AI changes mark site as unsaved

---

## 11. Conclusion

The interactive AI editing system provides:

✅ **Real-time Collaboration**: WebSocket-powered instant updates
✅ **Full Context Understanding**: AI sees entire site, not fragments
✅ **Seamless Undo**: Automatic history tracking for every AI change
✅ **Simplified Architecture**: No Flash triage, direct Claude processing
✅ **Scalable**: Celery + Redis handle concurrent users
✅ **Resilient**: Comprehensive error handling and reconnection

This system positions YourEasySite as a cutting-edge AI-powered site builder with a **conversational editing experience** that feels natural, reliable, and powerful.

---

**Document Version**: 2.0 (WebSocket Interactive System)
**Last Updated**: 2025
**Status**: ✅ Fully Implemented
