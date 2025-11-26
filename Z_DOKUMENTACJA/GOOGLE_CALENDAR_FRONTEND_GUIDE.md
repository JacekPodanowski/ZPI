# Google Calendar Integration - Frontend Implementation Guide

## Quick Start

### 1. Install Dependencies (if needed)
No additional dependencies required - uses standard fetch API.

### 2. API Service

Create `src/services/googleCalendarService.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const googleCalendarService = {
  // Get current integration status
  async getStatus(siteId, token) {
    const response = await fetch(`${API_URL}/sites/${siteId}/google-calendar/status/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get calendar status');
    }
    
    return response.json();
  },

  // Start OAuth connection flow
  async connect(siteId, token) {
    const response = await fetch(`${API_URL}/sites/${siteId}/google-calendar/connect/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to initiate connection');
    }
    
    const data = await response.json();
    
    // Redirect to Google OAuth
    window.location.href = data.authorization_url;
  },

  // Handle OAuth callback
  async handleCallback(siteId, code, state, token) {
    const response = await fetch(`${API_URL}/sites/${siteId}/google-calendar/callback/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete connection');
    }
    
    return response.json();
  },

  // Disconnect integration
  async disconnect(siteId, token) {
    const response = await fetch(`${API_URL}/sites/${siteId}/google-calendar/disconnect/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to disconnect');
    }
    
    return response.json();
  },

  // Toggle sync on/off
  async toggleSync(siteId, token) {
    const response = await fetch(`${API_URL}/sites/${siteId}/google-calendar/toggle-sync/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle sync');
    }
    
    return response.json();
  },

  // Manual sync all events
  async manualSync(siteId, token) {
    const response = await fetch(`${API_URL}/sites/${siteId}/google-calendar/manual-sync/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync');
    }
    
    return response.json();
  },
};
```

### 3. React Component Example

```javascript
import { useState, useEffect } from 'react';
import { googleCalendarService } from '../services/googleCalendarService';

function GoogleCalendarSettings({ siteId, token }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, [siteId]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await googleCalendarService.getStatus(siteId, token);
      setStatus(data);
    } catch (error) {
      console.error('Failed to load status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await googleCalendarService.connect(siteId, token);
      // User will be redirected to Google OAuth
    } catch (error) {
      alert('Failed to connect: ' + error.message);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) {
      return;
    }

    try {
      await googleCalendarService.disconnect(siteId, token);
      await loadStatus();
    } catch (error) {
      alert('Failed to disconnect: ' + error.message);
    }
  };

  const handleToggleSync = async () => {
    try {
      await googleCalendarService.toggleSync(siteId, token);
      await loadStatus();
    } catch (error) {
      alert('Failed to toggle sync: ' + error.message);
    }
  };

  const handleManualSync = async () => {
    try {
      setLoading(true);
      await googleCalendarService.manualSync(siteId, token);
      await loadStatus();
      alert('Sync completed successfully!');
    } catch (error) {
      alert('Failed to sync: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="google-calendar-settings">
      <h3>Google Calendar Integration</h3>
      
      {!status.connected ? (
        <div>
          <p>Connect your Google Calendar to automatically sync all events.</p>
          <button onClick={handleConnect}>
            Connect Google Calendar
          </button>
        </div>
      ) : (
        <div>
          <p>✓ Connected to: {status.integration.google_email}</p>
          <p>Calendar: {status.integration.calendar_name}</p>
          <p>Last sync: {status.integration.last_sync_at || 'Never'}</p>
          
          <div className="controls">
            <button onClick={handleToggleSync}>
              {status.integration.sync_enabled ? 'Disable' : 'Enable'} Sync
            </button>
            
            <button onClick={handleManualSync}>
              Manual Sync
            </button>
            
            <button onClick={handleDisconnect} className="danger">
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleCalendarSettings;
```

### 4. OAuth Callback Handler

Create a callback page at `/studio/auth/google/callback`:

```javascript
// src/STUDIO/pages/Auth/GoogleCalendarCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleCalendarService } from '../services/googleCalendarService';
import { useAuth } from '../contexts/AuthContext';

function GoogleCalendarCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Authorization was denied or cancelled');
      return;
    }

    if (!code || !state) {
      setError('Missing authorization code or state');
      return;
    }

    try {
      // Extract site ID from state (format: "site_123")
      const siteId = state.split('_')[1];
      
      await googleCalendarService.handleCallback(siteId, code, state, token);
      
      // Redirect back to calendar settings
      navigate(`/studio/sites/${siteId}/calendar`);
    } catch (error) {
      console.error('Callback error:', error);
      setError('Failed to complete connection: ' + error.message);
    }
  };

  if (error) {
    return (
      <div className="callback-error">
        <h2>Connection Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/studio')}>
          Back to Studio
        </button>
      </div>
    );
  }

  return (
    <div className="callback-loading">
      <h2>Connecting to Google Calendar...</h2>
      <p>Please wait while we complete the connection.</p>
    </div>
  );
}

export default GoogleCalendarCallback;
```

### 5. Add Route

In your router configuration:

```javascript
import GoogleCalendarCallback from './pages/Auth/GoogleCalendarCallback';

// Add to routes
{
  path: 'auth/google/callback',
  element: <GoogleCalendarCallback />
}
```

## UI Integration Options

### Option 1: Calendar Settings Page
Add a dedicated settings section in the calendar/events page.

### Option 2: Site Settings
Add to site settings under "Integrations" tab.

### Option 3: Quick Action Button
Add a "Sync to Google Calendar" button in the calendar toolbar.

## User Experience Flow

1. User clicks "Connect Google Calendar"
2. System redirects to Google OAuth consent screen
3. User authorizes access to their calendar
4. Google redirects back to `/studio/auth/google/callback`
5. Backend receives code, exchanges for tokens, creates integration
6. Backend automatically syncs all existing events
7. User is redirected back to calendar page
8. Success message shown

From this point:
- All new events → automatically created in Google Calendar
- All event updates → automatically updated in Google Calendar
- All event deletions → automatically deleted from Google Calendar

## Styling Suggestions

```css
.google-calendar-settings {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.google-calendar-settings h3 {
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.google-calendar-settings button {
  padding: 10px 20px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.google-calendar-settings button.danger {
  background: #dc3545;
  color: white;
}

.controls {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
```

## Testing

1. Ensure backend is running with proper Google OAuth credentials
2. Navigate to calendar settings
3. Click "Connect Google Calendar"
4. Authorize in Google consent screen
5. Verify you're redirected back
6. Check that integration status shows as connected
7. Create a test event and verify it appears in Google Calendar
8. Edit/delete the event and verify changes sync

## Troubleshooting

- **Redirect URI mismatch**: Ensure the redirect URI in Google Cloud Console matches exactly
- **Token expired**: The system automatically refreshes tokens - no user action needed
- **Sync not working**: Check browser console for errors and backend logs
- **Missing permissions**: Ensure user has proper permissions for the site
