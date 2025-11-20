import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import NotFoundPage from './pages/NotFound/NotFoundPage';

const ProtectedRoute = ({ children, requireStaff = false, allowedAccountTypes }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has temporary password and needs to change it
    // BUT only if not already on the change-password page
    if (user?.is_temporary_password && location.pathname !== '/studio/change-password') {
        return <Navigate to="/studio/change-password" replace />;
    }

    // Show 404 for non-admin users trying to access admin routes
    if (requireStaff && !user?.is_staff) {
        return <NotFoundPage />;
    }

    if (allowedAccountTypes && user?.account_type && !allowedAccountTypes.includes(user.account_type)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requireStaff: PropTypes.bool,
    allowedAccountTypes: PropTypes.arrayOf(PropTypes.string)
};

ProtectedRoute.defaultProps = {
    requireStaff: false,
    allowedAccountTypes: null
};

export default ProtectedRoute;
