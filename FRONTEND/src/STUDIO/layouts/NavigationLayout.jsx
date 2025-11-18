import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';

/**
 * NavigationLayout - Minimal layout with just Navigation
 * Used for pages that want to handle their own backgrounds and styling
 * but need persistent navigation across route changes
 */
const NavigationLayout = () => {
    return (
        <>
            <Navigation />
            <Outlet />
        </>
    );
};

export default NavigationLayout;
