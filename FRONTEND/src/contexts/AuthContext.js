import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe, googleLogin as googleLoginService, login as loginService, logout as logoutService, register as registerService } from '../services/authService';

const AuthContext = createContext(null);

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

    const logout = useCallback(() => {
        logoutService();
        setUser(null);
        navigate('/', { replace: true });
    }, [navigate]);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            logout,
            signup,
            googleLogin,
            refresh: loadCurrentUser
        }),
        [user, loading, login, logout, signup, googleLogin, loadCurrentUser]
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
