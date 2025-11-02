import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe, googleLogin as googleLoginService, login as loginService, logout as logoutService, register as registerService, updateUserPreferences } from '../services/authService';

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
        (fallbackPath = '/admin') => {
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
            await registerService(payload);
            await loadCurrentUser();
            handlePostAuthNavigation(redirectTo);
        },
        [loadCurrentUser, handlePostAuthNavigation]
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
        logoutService();
        setUser(null);
        navigate('/', { replace: true });
    }, [navigate]);

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
            updatePreferences
        }),
        [user, loading, login, logout, signup, googleLogin, mockLogin, loadCurrentUser, updatePreferences]
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
