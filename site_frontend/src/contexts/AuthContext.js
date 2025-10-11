import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, logout as logoutService, fetchMe as fetchCurrentUser, registerUser, googleLogin as googleLoginService } from '../services/authService.js';
import { createMeetingSession } from '../services/meetingService.js';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const initializeAuth = useCallback(async () => {
        try {
            const currentUser = await fetchCurrentUser();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } finally {
            if (loading) setLoading(false);
        }
    }, [loading]);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const handlePendingBooking = useCallback(async () => {
        const pendingBookingJSON = localStorage.getItem('pendingBooking');
        if (pendingBookingJSON) {
            const pendingBooking = JSON.parse(pendingBookingJSON);
            localStorage.removeItem('pendingBooking');
            
            try {
                if (!pendingBooking.time_slot_ids || pendingBooking.time_slot_ids.length === 0) {
                    throw new Error("Brak danych o terminach w oczekującej rezerwacji.");
                }

                const sessionData = {
                    time_slot_ids: pendingBooking.time_slot_ids,
                    subject: pendingBooking.subject || "Korepetycje",
                    notes: pendingBooking.notes,
                    platform: pendingBooking.platform
                };
                
                await createMeetingSession(sessionData);
                
                alert("Rezerwacja została pomyślnie dokończona!");
            } catch (error) {
                console.error("Błąd przy automatycznej rezerwacji:", error);
                alert(`Nie udało się automatycznie dokończyć rezerwacji: ${error.response?.data?.detail || error.message}. Spróbuj ponownie.`);
            }
        }
        navigate('/student-dashboard');
    }, [navigate]);

    const login = async (email, password) => {
        try {
            await loginService(email, password);
            await initializeAuth();
            await handlePendingBooking();
        } catch (error) {
            setUser(null);
            throw error;
        }
    };
    
    const signup = async (firstName, email, password, password2) => {
        const payload = { first_name: firstName, email: email, password: password, password2: password2 };
        try {
            await registerUser(payload);
            await initializeAuth();
            await handlePendingBooking();
        } catch (error) {
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            throw error;
        }
    };

    const googleLogin = useCallback(async (accessToken) => {
        try {
            await googleLoginService(accessToken);
            await initializeAuth();
            await handlePendingBooking();
        } catch (error) {
            console.error("Błąd logowania przez Google w AuthContext:", error);
            setUser(null);
            throw error;
        }
    }, [initializeAuth, handlePendingBooking]);

    const logout = () => {
        logoutService();
        setUser(null);
        navigate('/');
    };

    if (loading) {
        return <div>Ładowanie aplikacji...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, googleLogin, isAuthenticated: !!user, loading, initializeAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};