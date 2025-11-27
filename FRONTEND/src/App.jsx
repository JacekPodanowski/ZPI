import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './STUDIO/pages/Home/HomePage';
import LoginPage from './STUDIO/pages/Auth/LoginPage';
import StudioRoutes from './STUDIO/routes';
import NavigationLayout from './STUDIO/layouts/NavigationLayout';
import CookieConsentBanner from './components/CookieConsent/CookieConsentBanner';

// Lazy loaded pages
const TermsOfServicePage = lazy(() => import('./STUDIO/pages/Terms/TermsOfServicePage'));
const InfoPage = lazy(() => import('./STUDIO/pages/Info/InfoPage'));
const PolicyPage = lazy(() => import('./STUDIO/pages/Info/PolicyPage'));
const GuidePage = lazy(() => import('./STUDIO/pages/Info/GuidePage'));
const CancelBookingPage = lazy(() => import('./SITES/pages/CancelBookingPage'));
const PublicSiteRendererPage = lazy(() => import('./SITES/pages/PublicSiteRendererPage'));
const SiteListPage = lazy(() => import('./SITES/pages/SiteListPage'));
const NewsletterConfirmPage = lazy(() => import('./STUDIO/pages/Newsletter/NewsletterConfirmPage'));
const NewsletterUnsubscribePage = lazy(() => import('./STUDIO/pages/Newsletter/NewsletterUnsubscribePage'));

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
);

const App = () => {
    // Sprawdź tryb routingu ze zmiennej środowiskowej
    const isPathRoutingMode = import.meta.env.VITE_APP_ROUTING_MODE === 'path';

    return (
        <>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
            
            {/* Cookie Consent Banner */}
            <CookieConsentBanner />
        </>
    );
};

export default App;