import { Outlet } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';
import { usePrefetch } from '../utils/usePrefetch';
import { useAuth } from '../../contexts/AuthContext';

/**
 * NavigationLayout - Minimal layout with just Navigation
 * Used for pages that want to handle their own backgrounds and styling
 * but need persistent navigation across route changes
 */
const NavigationLayout = () => {
    const { isAuthenticated } = useAuth();
    
    // Start prefetching other pages in background after current page loads
    // Priority order depends on auth status
    usePrefetch({ delay: 1500, isAuthenticated });

    return (
        <>
            <Navigation />
            <Outlet />
        </>
    );
};

export default NavigationLayout;
