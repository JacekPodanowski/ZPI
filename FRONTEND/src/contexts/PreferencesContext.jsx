import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import useDebounce from '../hooks/useDebounce';
import useTheme from '../theme/useTheme';

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
    const theme = useTheme();
    
    // Initialize preferences from user data or defaults
    const [preferences, setPreferences] = useState(() => {
        if (user?.preferences && Object.keys(user.preferences).length > 0) {
            return {
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
        }
        return DEFAULT_PREFERENCES;
    });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    
    // Debounce preferences to avoid too many API calls
    const debouncedPreferences = useDebounce(preferences, 1000);

    // Sync theme from ThemeProvider to preferences on mount and when theme changes
    useEffect(() => {
        if (theme?.themeId && theme?.mode) {
            const currentThemePrefs = preferences.theme || {};
            if (currentThemePrefs.themeId !== theme.themeId || currentThemePrefs.mode !== theme.mode) {
                setPreferences(prev => ({
                    ...prev,
                    theme: {
                        themeId: theme.themeId,
                        mode: theme.mode
                    }
                }));
                setHasUnsavedChanges(true);
            }
        }
    }, [theme?.themeId, theme?.mode]);

    // Apply theme preferences to ThemeProvider when preferences load
    useEffect(() => {
        if (preferences.theme?.themeId && theme?.selectTheme) {
            if (preferences.theme.themeId !== theme.themeId) {
                theme.selectTheme(preferences.theme.themeId);
            }
        }
        if (preferences.theme?.mode && theme?.mode && theme?.toggleMode) {
            if (preferences.theme.mode !== theme.mode) {
                theme.toggleMode();
            }
        }
    }, []);  // Run only once on mount

    // Update local preferences when user data changes
    // Only sync on initial load, not on every user.preferences change to avoid overwriting local edits
    useEffect(() => {
        if (user?.preferences && Object.keys(user.preferences).length > 0 && !hasInitialized) {
            setPreferences({
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
            });
            setHasUnsavedChanges(false);
            setHasInitialized(true);
        }
    }, [user?.id, hasInitialized]); // Only depend on user ID, not preferences

    // Persist debounced preferences to backend
    useEffect(() => {
        const persistPreferences = async () => {
            if (!isAuthenticated || !hasUnsavedChanges) {
                return;
            }

            try {
                await updateUserPreferences(debouncedPreferences);
                setHasUnsavedChanges(false);
            } catch (error) {
                console.error('[PreferencesContext] Failed to save preferences:', error);
            }
        };

        persistPreferences();
    }, [debouncedPreferences, isAuthenticated, hasUnsavedChanges, updateUserPreferences]);

    /**
     * Update theme preferences
     */
    const updateThemePreferences = useCallback((updates) => {
        setPreferences(prev => ({
            ...prev,
            theme: {
                ...prev.theme,
                ...updates
            }
        }));
        setHasUnsavedChanges(true);
    }, []);

    /**
     * Update calendar preferences
     */
    const updateCalendarPreferences = useCallback((updates) => {
        setPreferences(prev => ({
            ...prev,
            calendar: {
                ...prev.calendar,
                ...updates
            }
        }));
        setHasUnsavedChanges(true);
    }, []); // No dependencies needed since we use the functional update form

    /**
     * Update any preferences (for bulk updates)
     */
    const updatePreferences = useCallback((updates) => {
        setPreferences(prev => ({
            ...prev,
            ...updates
        }));
        setHasUnsavedChanges(true);
    }, []);

    /**
     * Reset preferences to defaults
     */
    const resetPreferences = useCallback(() => {
        setPreferences(DEFAULT_PREFERENCES);
        setHasUnsavedChanges(true);
    }, []);

    const value = useMemo(
        () => ({
            preferences,
            theme: preferences.theme,
            calendar: preferences.calendar,
            updateThemePreferences,
            updateCalendarPreferences,
            updatePreferences,
            resetPreferences,
            hasUnsavedChanges
        }),
        [
            preferences,
            updateThemePreferences,
            updateCalendarPreferences,
            updatePreferences,
            resetPreferences,
            hasUnsavedChanges
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
