import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe, googleLogin as googleLoginService, login as loginService, logout as logoutService, register as registerService } from '../services/authService';

const AuthContext = createContext(null);

const MOCK_DEMO_KEY = 'mockDemoSession';

const getMockAdminUser = () => ({
    id: 'demo-admin',
    email: 'mockadmin@example.com',
    first_name: 'Demo',
    last_name: 'Admin',
    account_type: 'Pro',
    role: 'admin'
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const hasTokens = () => Boolean(localStorage.getItem('accessToken'));

    const isDemoSession = () => localStorage.getItem(MOCK_DEMO_KEY) === 'true';

    const loadCurrentUser = useCallback(async () => {
        if (isDemoSession()) {
            setUser(getMockAdminUser());
            setLoading(false);
            return;
        }

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
            localStorage.removeItem(MOCK_DEMO_KEY);
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
            localStorage.removeItem(MOCK_DEMO_KEY);
            await googleLoginService(accessToken);
            await loadCurrentUser();
            handlePostAuthNavigation(redirectTo);
        },
        [loadCurrentUser, handlePostAuthNavigation]
    );

    const mockLogin = useCallback(
        (redirectTo) => {
            localStorage.setItem(MOCK_DEMO_KEY, 'true');
            setUser(getMockAdminUser());
            setLoading(false);
            handlePostAuthNavigation(redirectTo);
        },
        [handlePostAuthNavigation]
    );

    const logout = useCallback(() => {
        logoutService();
        setUser(null);
        localStorage.removeItem(MOCK_DEMO_KEY);
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
            mockLogin,
            refresh: loadCurrentUser
        }),
        [user, loading, login, logout, signup, googleLogin, mockLogin, loadCurrentUser]
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
