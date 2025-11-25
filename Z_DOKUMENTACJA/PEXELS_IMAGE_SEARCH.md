# Pexels Image Search System - Documentation

## Overview

The Pexels Image Search System provides an intelligent, dual-mode interface for selecting and managing images in the editor. The system automatically detects whether the user is editing 1 image (Focused Mode) or multiple images (Bulk Mode) and adapts the UI accordingly.

## Architecture

### Backend (Django)

#### API Endpoints

1. **GET `/api/v1/sites/{site_id}/images/search/`**
   - Search for images on Pexels
   - Query parameters:
     - `query` (required): Search phrase
     - `mode`: 'focused' (10 images) or 'bulk' (80 images)
     - `page`: Page number for pagination
     - `orientation`: 'landscape', 'portrait', 'square', or 'all'
     - `color`: Color filter (optional)
   - Returns: Array of images with quota information
   - Implements caching: 24h for focused, 7 days for bulk

2. **GET `/api/v1/sites/{site_id}/images/quota/`**
   - Get user's daily search quota status
   - Returns: `{ used, limit, remaining, reset_at }`

#### User Quota System

- Each user has a daily limit of 50 searches
- Tracked via `PlatformUser` model:
  - `daily_image_searches`: Counter (resets daily)
  - `last_search_date`: Date of last search
- Quota resets at midnight (UTC)
- Cached results don't count against the quota

#### Caching Strategy

- Uses Django cache framework
- Cache keys: `pexels_{mode}_{query}_{page}_{orientation}_{color}`
- Duration:
  - Focused mode: 24 hours
  - Bulk mode: 7 days
- Reduces API calls to Pexels (200 requests/hour limit)

### Frontend (React)

#### Components

1. **ImageSearchIntegration.jsx**
   - Floating Action Button (FAB) in editor
   - Detects number of selected images
   - Opens appropriate interface (modal or panel)
   - Location: Bottom-right corner in Detail Mode

2. **ImageSelectorModal.jsx** (Focused Mode)
   - Opens for single image selection
   - Displays 10 images in 2x5 grid
   - Large thumbnails (200x150px)
   - Quick one-click selection
   - Shows photographer attribution on hover

3. **ImageLibraryPanel.jsx** (Bulk Mode)
   - Side panel (400px width)
   - Displays up to 100 images (80 + 20 from page 2)
   - 3-column grid with small thumbnails (100x75px)
   - Infinite scroll with lazy loading
   - Filters: orientation and color
   - Debounced search (500ms)

4. **EditableImage.jsx** (Updated)
   - Simple click to select/deselect
   - No more modal popup
   - Visual feedback when selected (outline + shadow)
   - Stores selection in localStorage
   - Requires `elementId` prop for tracking

#### State Management (Zustand)

**imageSearchStore.js**
```javascript
{
  searchResults: [],        // Array of Pexels images
  isLoading: boolean,        // Loading state
  error: string | null,      // Error message
  mode: 'focused' | 'bulk',  // Current mode
  quota: { used, limit, remaining },
  isPanelOpen: boolean,      // Panel visibility
  isModalOpen: boolean,      // Modal visibility
  orientation: string,       // Filter: 'all', 'landscape', etc.
  color: string,            // Filter: color name
  // ... methods
}
```

Key methods:
- `searchImages(siteId, query, options)` - Search Pexels
- `loadNextPage(siteId)` - Load more for infinite scroll
- `selectImage(imageUrl, elementId)` - Apply image to element
- `checkQuota(siteId)` - Get quota status

## User Workflows

### Workflow A: Single Image Edit

1. User clicks on an image element in editor
2. Image gets selected (blue outline)
3. Floating button shows badge "1"
4. User clicks floating button
5. **Modal opens** (Focused Mode)
6. User types search query (e.g., "mountain sunset")
7. System fetches 10 images from Pexels
8. User clicks desired image
9. Image is applied to selected element
10. Modal closes automatically
11. Selection is cleared

### Workflow B: Multiple Images Edit

1. User clicks on first image
2. Image gets selected
3. (Future: Multi-select with Shift+Click)
4. Floating button shows badge "2+"
5. User clicks floating button
6. **Side panel opens** (Bulk Mode)
7. User types search query (e.g., "spa wellness")
8. System fetches 80 images initially
9. User scrolls down, more images load (infinite scroll)
10. User clicks images to apply them to selected elements
11. Panel remains open for continued editing
12. User clicks "Close Library" when done

### Workflow C: AI-Assisted Image Selection

1. User asks AI: "Change hero image to mountain landscape"
2. AI recognizes image change request
3. AI suggests: "Open image search (focused mode) for 'mountain landscape'"
4. System opens modal with pre-filled search
5. User selects from results
6. Image is applied via AI system

## Integration Points

### 1. EditableImage Component

All module components using images must pass `elementId`:

```jsx
<EditableImage
  value={imageUrl}
  onSave={handleImageSave}
  elementId={`${pageId}-${moduleId}-hero-image`}
  alt="Hero image"
  className="w-full h-full object-cover"
  isModuleSelected={true}
/>
```

ElementId format: `{pageId}-{moduleId}-{descriptive-name}-{index?}`

### 2. AI System

The AI agent (`SiteEditorAgent`) includes guidance about Pexels:

```
🖼️ PRACA Z OBRAZKAMI - INTEGRACJA PEXELS:
Gdy użytkownik prosi o zmianę obrazów, możesz SUGEROWAĆ wyszukiwanie w Pexels:
- Dla pojedynczego obrazu: "Otwórz wyszukiwarkę obrazów (tryb precyzyjny)"
- Dla wielu obrazów: "Otwórz bibliotekę obrazów (tryb masowy)"
```

### 3. Template Config

Images saved to `template_config` include attribution:

```json
{
  "backgroundImage": {
    "url": "https://images.pexels.com/.../large.jpg",
    "photographer": "Jan Kowalski",
    "photographerUrl": "https://pexels.com/@jan",
    "source": "pexels",
    "pexelsId": 12345
  }
}
```

## Configuration

### Environment Variables (.env)

```bash
PEXELS_API_KEY=your-pexels-api-key-here
```

Get your API key from: https://www.pexels.com/api/

### Rate Limits

- **Pexels API**: 200 requests per hour
- **User Quota**: 50 searches per day
- **Caching**: Reduces actual API calls significantly

### Django Settings

```python
# Cache configuration (uses Redis in production)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

## Security

1. **Authentication Required**: All endpoints require `IsAuthenticated`
2. **Site Ownership**: Validates user owns the site before searching
3. **Query Sanitization**: Search queries are sanitized before sending to Pexels
4. **Rate Limiting**: Max 20 requests/minute per user on endpoints
5. **Quota System**: Prevents abuse with daily limits

## Monitoring

Track in admin dashboard:
- Daily searches per user
- Most popular search queries
- Pexels API usage vs limit
- Cache hit rate
- Average images selected per session

## Future Enhancements

1. **Multi-Select**: Select multiple images with Shift+Click
2. **Drag & Drop**: Drag images from panel to elements
3. **Favorites**: Save frequently used images
4. **Collections**: Group images by project/theme
5. **Upload Integration**: Mix Pexels with uploaded images
6. **Smart Suggestions**: AI suggests relevant images based on content
7. **Batch Operations**: Apply same image to multiple elements
8. **Image History**: Track previously used images per site

## Troubleshooting

### Issue: "Daily limit exceeded"
- Wait until midnight (UTC) for quota reset
- Use cached results (search same query again)
- Contact admin for limit increase

### Issue: "No results found"
- Try different search terms
- Check spelling
- Use English keywords for better results
- Try broader terms (e.g., "nature" instead of "mountain sunset")

### Issue: Images not loading
- Check internet connection
- Verify PEXELS_API_KEY is set
- Check Pexels API status
- Clear browser cache

### Issue: Selection not working
- Check browser console for errors
- Verify localStorage is enabled
- Try refreshing the editor
- Check elementId prop is unique

## API Response Format

### Search Response
```json
{
  "images": [
    {
      "id": 12345,
      "width": 4000,
      "height": 3000,
      "photographer": "John Doe",
      "photographer_url": "https://pexels.com/@john",
      "src": {
        "original": "https://...",
        "large": "https://...",
        "medium": "https://...",
        "small": "https://...",
        "tiny": "https://..."
      },
      "alt": "Mountain landscape at sunset"
    }
  ],
  "query": "mountain sunset",
  "page": 1,
  "total_results": 8000,
  "mode": "focused",
  "from_cache": false,
  "quota": {
    "used": 15,
    "limit": 50,
    "remaining": 35
  }
}
```

### Quota Response
```json
{
  "used": 15,
  "limit": 50,
  "remaining": 35,
  "reset_at": "2025-11-26T00:00:00Z"
}
```

## Credits

- Images powered by [Pexels](https://www.pexels.com)
- All images are free for personal and commercial use
- Attribution not required but appreciated
- Stored in `template_config` for proper credit
