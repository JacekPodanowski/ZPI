// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';

const ProtectedRoute = ({ children, allowedUserTypes }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Checking authentication...</div>; // Lub spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Sprawdzanie ról, jeśli `allowedUserTypes` jest zdefiniowane
    // Ta logika zależy od tego, jak `user_type` jest przechowywany w obiekcie `user` z AuthContext
    if (allowedUserTypes && user && user.user_type) {
        if (!allowedUserTypes.includes(user.user_type)) {
            // Użytkownik jest zalogowany, ale nie ma odpowiedniej roli
            console.warn(`User type ${user.user_type} not allowed for this route.`);
            return <Navigate to="/" state={{ from: location }} replace />; // Przekieruj na stronę główną
        }
    } else if (allowedUserTypes && !user) {
        // To nie powinno się zdarzyć, jeśli isAuthenticated jest true, ale dla bezpieczeństwa
        console.warn("User object not available for role check, but authenticated.");
        return <Navigate to="/" state={{ from: location }} replace />;
    }


    return children;
};

export default ProtectedRoute;