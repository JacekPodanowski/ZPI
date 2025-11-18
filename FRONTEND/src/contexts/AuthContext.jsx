import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe, googleLogin as googleLoginService, login as loginService, logout as logoutService, register as registerService, updateUserPreferences } from '../services/authService';
import { clearUserCache } from '../utils/cache';

const AuthContext = createContext(null);

const DEMO_CREDENTIALS = {
    email: '777seeit@gmail.com',
    password: 'BogMnieKocha777'
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const hasTokens = () => Boolean(localStorage.getItem('accessToken'));

    const loadCurrentUser = useCallback(async () => {
        if (!hasTokens()) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const me = await fetchMe();
            setUser(me);
        } catch (error) {
            logoutService();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCurrentUser();
    }, [loadCurrentUser]);

    const handlePostAuthNavigation = useCallback(
        (fallbackPath = '/studio/sites') => {
            navigate(fallbackPath, { replace: true });
        },
        [navigate]
    );

    const login = useCallback(
        async (email, password, redirectTo) => {
            await loginService(email, password);
            await loadCurrentUser();
            handlePostAuthNavigation(redirectTo);
        },
        [loadCurrentUser, handlePostAuthNavigation]
    );

    const signup = useCallback(
        async (payload, redirectTo) => {
            // New flow: registration doesn't return tokens, just confirmation message
            const response = await registerService(payload);
            // Don't load user or navigate - user needs to verify email first
            return response;
        },
        []
    );

    const googleLogin = useCallback(
        async (accessToken, redirectTo) => {
            await googleLoginService(accessToken);
            await loadCurrentUser();
            handlePostAuthNavigation(redirectTo);
        },
        [loadCurrentUser, handlePostAuthNavigation]
    );

    const mockLogin = useCallback(
        async (redirectTo) => {
            try {
                await loginService(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
                await loadCurrentUser();
                handlePostAuthNavigation(redirectTo);
            } catch (error) {
                logoutService();
                setUser(null);
                throw error;
            }
        },
        [handlePostAuthNavigation, loadCurrentUser]
    );

    const logout = useCallback(() => {
        // Clear user-specific cache on logout
        if (user?.id) {
            clearUserCache(user.id);
        }
        logoutService();
        setUser(null);
        navigate('/', { replace: true });
    }, [navigate, user?.id]);

    const updatePreferences = useCallback(async (preferences) => {
        try {
            const updatedUser = await updateUserPreferences(preferences);
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Failed to update preferences:', error);
            throw error;
        }
    }, []);

    const updateUser = useCallback((updates) => {
        setUser((prev) => ({ ...prev, ...updates }));
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            logout,
            signup,
            googleLogin,
            mockLogin,
            refresh: loadCurrentUser,
            updatePreferences,
            updateUser
        }),
        [user, loading, login, logout, signup, googleLogin, mockLogin, loadCurrentUser, updatePreferences, updateUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
