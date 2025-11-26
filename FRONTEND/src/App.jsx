import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './STUDIO/pages/Home/HomePage';
import LoginPage from './STUDIO/pages/Auth/LoginPage';
import StudioRoutes from './STUDIO/routes';
import TermsOfServicePage from './STUDIO/pages/Terms/TermsOfServicePage';
import InfoPage from './STUDIO/pages/Info/InfoPage';
import PolicyPage from './STUDIO/pages/Info/PolicyPage';
import GuidePage from './STUDIO/pages/Info/GuidePage';
import CancelBookingPage from './SITES/pages/CancelBookingPage';
import PublicSiteRendererPage from './SITES/pages/PublicSiteRendererPage';
import SiteListPage from './SITES/pages/SiteListPage';
import NavigationLayout from './STUDIO/layouts/NavigationLayout';
import NewsletterConfirmPage from './STUDIO/pages/Newsletter/NewsletterConfirmPage';
import NewsletterUnsubscribePage from './STUDIO/pages/Newsletter/NewsletterUnsubscribePage';

const App = () => {
    // Sprawdź tryb routingu ze zmiennej środowiskowej
    const isPathRoutingMode = import.meta.env.VITE_APP_ROUTING_MODE === 'path';

    return (
        <Routes>
            {/* Istniejące ścieżki dla Studio */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/cancel-booking/:bookingId" element={<CancelBookingPage />} />
            <Route path="/newsletter/confirm/:token" element={<NewsletterConfirmPage />} />
            <Route path="/newsletter/unsubscribe/:token" element={<NewsletterUnsubscribePage />} />
            
            {/* Redirect /domain to /studio/domain */}
            <Route path="/domain" element={<Navigate to="/studio/domain" replace />} />
            <Route path="/domain/:siteId" element={<Navigate to="/studio/domain/:siteId" replace />} />
            
            <Route path="/studio/*" element={<StudioRoutes />} />

            {/* Warunkowa ścieżka dla trybu deweloperskiego */}
            {isPathRoutingMode && (
                <>
                    {/* Lista stron - Z nawigacją */}
                    <Route element={<NavigationLayout />}>
                        <Route path="/viewer" element={<SiteListPage />} />
                    </Route>
                    {/* Konkretna strona - BEZ nawigacji */}
                    <Route path="/viewer/:siteIdentifier/*" element={<PublicSiteRendererPage />} />
                </>
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;