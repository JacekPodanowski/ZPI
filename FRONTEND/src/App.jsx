import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './STUDIO/pages/Home/HomePage';
import LoginPage from './STUDIO/pages/Auth/LoginPage';
import StudioRoutes from './STUDIO/routes';
import TermsOfServicePage from './STUDIO/pages/Terms/TermsOfServicePage';
import CancelBookingPage from './SITES/pages/CancelBookingPage';
import PublicSiteRendererPage from './SITES/pages/PublicSiteRendererPage';
import SiteListPage from './SITES/pages/SiteListPage';

const App = () => {
    // Sprawdź tryb routingu ze zmiennej środowiskowej
    const isPathRoutingMode = import.meta.env.VITE_APP_ROUTING_MODE === 'path';

    return (
        <Routes>
            {/* Istniejące ścieżki dla Studio */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/cancel-booking/:bookingId" element={<CancelBookingPage />} />
            <Route path="/studio/*" element={<StudioRoutes />} />

            {/* Warunkowa ścieżka dla trybu deweloperskiego */}
            {isPathRoutingMode && (
                <>
                    <Route path="/viewer" element={<SiteListPage />} />
                    <Route path="/viewer/:siteIdentifier/*" element={<PublicSiteRendererPage />} />
                </>
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;