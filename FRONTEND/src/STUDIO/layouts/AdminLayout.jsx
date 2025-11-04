import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminNavigation from '../../components/Navigation/AdminNavigation';

/**
 * AdminLayout - A dedicated layout for the admin area
 * Uses AdminNavigation instead of the regular Navigation component
 */
const AdminLayout = () => {
    return (
        <>
            <AdminNavigation />
            
            <Box
                sx={{
                    minHeight: 'calc(100vh - 60px)',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'background.default'
                }}
            >
                <Box
                    component="main"
                    sx={{
                        flex: '1 1 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        py: { xs: 4, md: 6 },
                        px: { xs: 3, md: 6 }
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </>
    );
};

export default AdminLayout;
