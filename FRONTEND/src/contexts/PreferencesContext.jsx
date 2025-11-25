import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import useDebounce from '../hooks/useDebounce';
import useTheme from '../theme/useTheme';
import { getCache, setCache, CACHE_KEYS } from '../utils/cache';

const PreferencesContext = createContext(null);

/**
 * Default preferences structure
 */
const DEFAULT_PREFERENCES = {
    theme: {
        mode: null, // 'light' | 'dark' | null (system default)
        themeId: null, // ID of selected theme or null for default
    },
    calendar: {
        operating_start_hour: '06:00',
        operating_end_hour: '22:00',
    },
    // Future: notifications, language, etc.
};

/**
 * PreferencesProvider
 * 
 * Manages user preferences with automatic persistence to the backend.
 * Integrates with AuthContext to load/save preferences with the user profile.
 * 
 * Features:
 * - Automatic loading of preferences when user logs in
 * - Debounced saves to prevent API spam
 * - Category-based updates (theme, calendar, etc.)
 * - Fallback to defaults when user has no saved preferences
 */
export const PreferencesProvider = ({ children }) => {
    const { user, updatePreferences: updateUserPreferences, isAuthenticated } = useAuth();
    
    // Initialize preferences from cache, user data, or defaults
    const [preferences, setPreferences] = useState(() => {
        // Try cache first for instant load
        const cacheKey = user?.id ? `${CACHE_KEYS.USER_PREFERENCES}_${user.id}` : CACHE_KEYS.USER_PREFERENCES;
        const cached = getCache(cacheKey);
        if (cached) {
            return cached;
        }
        
        // Fall back to user data
        if (user?.preferences && Object.keys(user.preferences).length > 0) {
            const prefs = {
                ...DEFAULT_PREFERENCES,
                ...user.preferences,
                theme: {
                    ...DEFAULT_PREFERENCES.theme,
                    ...(user.preferences.theme || {})
                },
                calendar: {
                    ...DEFAULT_PREFERENCES.calendar,
                    ...(user.preferences.calendar || {})
                }
            };
            // Cache it immediately
            setCache(cacheKey, prefs, 1000 * 60 * 60 * 24); // 24 hour cache
            return prefs;
        }
        return DEFAULT_PREFERENCES;
    });

    const [hasInitialized, setHasInitialized] = useState(false);
    
    // Get theme context - will be null initially but that's fine
    const theme = useTheme();
    
    // Debounce theme preferences to avoid too many API calls during theme selection
    // Calendar preferences are saved immediately (no debounce)
    const debouncedThemePreferences = useDebounce(preferences.theme, 1000);

    // Sync theme from ThemeProvider to preferences on mount and when theme changes
    useEffect(() => {
        if (!theme || !theme.themeId || !theme.mode) {
            return; // Theme context not ready yet
        }
        
        const currentThemePrefs = preferences.theme || {};
        if (currentThemePrefs.themeId !== theme.themeId || currentThemePrefs.mode !== theme.mode) {
            setPreferences(prev => ({
                ...prev,
                theme: {
                    themeId: theme.themeId,
                    mode: theme.mode
                }
            }));
        }
    }, [theme?.themeId, theme?.mode]);

    // Apply theme preferences to ThemeProvider when preferences load
    useEffect(() => {
        if (!theme || !theme.selectTheme || !theme.toggleMode) {
            return; // Theme context not ready yet
        }
        
        if (preferences.theme?.themeId) {
            if (preferences.theme.themeId !== theme.themeId) {
                theme.selectTheme(preferences.theme.themeId);
            }
        }
        if (preferences.theme?.mode && theme.mode) {
            if (preferences.theme.mode !== theme.mode) {
                theme.toggleMode();
            }
        }
    }, []);  // Run only once on mount

    // Update local preferences when user data changes
    // Only sync on initial load, not on every user.preferences change to avoid overwriting local edits
    useEffect(() => {
        if (user?.preferences && Object.keys(user.preferences).length > 0 && !hasInitialized) {
            const prefs = {
                ...DEFAULT_PREFERENCES,
                ...user.preferences,
                theme: {
                    ...DEFAULT_PREFERENCES.theme,
                    ...(user.preferences.theme || {})
                },
                calendar: {
                    ...DEFAULT_PREFERENCES.calendar,
                    ...(user.preferences.calendar || {})
                }
            };
            setPreferences(prefs);
            
            // Cache the preferences
            const cacheKey = user.id ? `${CACHE_KEYS.USER_PREFERENCES}_${user.id}` : CACHE_KEYS.USER_PREFERENCES;
            setCache(cacheKey, prefs, 1000 * 60 * 60 * 24); // 24 hour cache
            
            setHasInitialized(true);
        }
    }, [user?.id, hasInitialized]); // Only depend on user ID, not preferences

    // Persist debounced THEME preferences to backend (theme changes are debounced)
    useEffect(() => {
        const persistThemePreferences = async () => {
            if (!isAuthenticated || !hasInitialized) {
                return;
            }

            try {
                await updateUserPreferences({
                    ...preferences,
                    theme: debouncedThemePreferences
                });
            } catch (error) {
                console.error('[PreferencesContext] Failed to save theme preferences:', error);
            }
        };

        persistThemePreferences();
    }, [debouncedThemePreferences, isAuthenticated, hasInitialized]);

    /**
     * Update theme preferences (debounced save via useEffect above)
     */
    const updateThemePreferences = useCallback((updates) => {
        setPreferences(prev => ({
            ...prev,
            theme: {
                ...prev.theme,
                ...updates
            }
        }));
        // Theme preferences are saved via debounced effect
    }, []);

    /**
     * Update calendar preferences - saves immediately (no debounce)
     */
    const updateCalendarPreferences = useCallback(async (updates) => {
        const newPreferences = {
            ...preferences,
            calendar: {
                ...preferences.calendar,
                ...updates
            }
        };
        
        setPreferences(newPreferences);
        
        // Update cache immediately for instant response
        const cacheKey = user?.id ? `${CACHE_KEYS.USER_PREFERENCES}_${user.id}` : CACHE_KEYS.USER_PREFERENCES;
        setCache(cacheKey, newPreferences, 1000 * 60 * 60 * 24); // 24 hour cache
        
        // Save to backend in background (no debounce for calendar changes)
        if (isAuthenticated) {
            try {
                await updateUserPreferences(newPreferences);
            } catch (error) {
                console.error('[PreferencesContext] Failed to save calendar preferences:', error);
            }
        }
    }, [preferences, isAuthenticated, updateUserPreferences, user?.id]);

    /**
     * Update any preferences (for bulk updates)
     */
    const updatePreferences = useCallback(async (updates) => {
        const newPreferences = {
            ...preferences,
            ...updates
        };
        
        setPreferences(newPreferences);
        
        // Update cache immediately
        const cacheKey = user?.id ? `${CACHE_KEYS.USER_PREFERENCES}_${user.id}` : CACHE_KEYS.USER_PREFERENCES;
        setCache(cacheKey, newPreferences, 1000 * 60 * 60 * 24); // 24 hour cache
        
        // Save to backend in background
        if (isAuthenticated) {
            try {
                await updateUserPreferences(newPreferences);
            } catch (error) {
                console.error('[PreferencesContext] Failed to save preferences:', error);
            }
        }
    }, [preferences, isAuthenticated, updateUserPreferences, user?.id]);

    /**
     * Reset preferences to defaults
     */
    const resetPreferences = useCallback(async () => {
        setPreferences(DEFAULT_PREFERENCES);
        
        // Save immediately to backend
        if (isAuthenticated) {
            try {
                await updateUserPreferences(DEFAULT_PREFERENCES);
            } catch (error) {
                console.error('[PreferencesContext] Failed to reset preferences:', error);
            }
        }
    }, [isAuthenticated, updateUserPreferences]);

    const value = useMemo(
        () => ({
            preferences,
            theme: preferences.theme,
            calendar: preferences.calendar,
            updateThemePreferences,
            updateCalendarPreferences,
            updatePreferences,
            resetPreferences
        }),
        [
            preferences,
            updateThemePreferences,
            updateCalendarPreferences,
            updatePreferences,
            resetPreferences
        ]
    );

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
};

PreferencesProvider.propTypes = {
    children: PropTypes.node.isRequired
};

/**
 * Hook to access preferences context
 */
export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};

export default PreferencesContext;
