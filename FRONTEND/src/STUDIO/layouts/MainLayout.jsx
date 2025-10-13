import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navigation from '../../components/Navigation/Navigation';

const MainLayout = () => (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Navigation />
        <Box component="main" sx={{ py: { xs: 4, md: 8 } }}>
            <Outlet />
        </Box>
    </Box>
);

export default MainLayout;
