import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

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

    if (requireStaff && !user?.is_staff) {
        return <Navigate to="/" replace />;
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
