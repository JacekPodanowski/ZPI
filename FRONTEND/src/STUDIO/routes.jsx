import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import NavigationLayout from './layouts/NavigationLayout';
import SettingsLayout from './layouts/SettingsLayout';

// Lazy loaded pages
const SitesPage = lazy(() => import('./pages/Sites/SitesPage'));
const CategorySelectionPage = lazy(() => import('./pages/NewSite/CategorySelectionPage'));
const NewProjectPage = lazy(() => import('./pages/NewSite/NewProjectPage'));
const ManageModulesPage = lazy(() => import('./pages/NewSite/ManageModulesPage'));
const StyleSelectionPage = lazy(() => import('./pages/NewSite/StyleSelectionPage'));
const NewEditorPage = lazy(() => import('./pages/Editor/NewEditorPage'));
const CreatorCalendarApp = lazy(() => import('./pages/Creator/CreatorCalendarApp'));
const EventsPage = lazy(() => import('./pages/Events/EventsPage'));
const AdminDashboardPage = lazy(() => import('./pages/Admin/AdminDashboardPage'));
const ProfilePage = lazy(() => import('./pages/Settings/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/Settings/OrdersPage'));
const BillingPage = lazy(() => import('./pages/Settings/BillingPage'));
const AppearancePage = lazy(() => import('./pages/Settings/AppearancePage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/Settings/NotificationsPage'));
const MailsPage = lazy(() => import('./pages/Settings/MailsPage'));
const EmailEditorPage = lazy(() => import('./pages/EmailEditor/EmailEditorPage'));
const ToastTestPage = lazy(() => import('./pages/Settings/ToastTestPage'));
const PaymentSuccessPage = lazy(() => import('./pages/Settings/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('./pages/Settings/PaymentFailedPage'));
const SiteLabPage = lazy(() => import('./pages/Lab/SiteLabPage'));
const TeamPage = lazy(() => import('./pages/Team/TeamPage'));
const DomainPage = lazy(() => import('./pages/Domain/DomainPage'));
const BuyDomainPage = lazy(() => import('./pages/Domain/BuyDomainPage'));
const DomainPurchaseSuccessPage = lazy(() => import('./pages/Domain/DomainPurchaseSuccessPage'));
const AcceptTermsPage = lazy(() => import('./pages/Auth/AcceptTermsPage'));
const ConfirmEmailPage = lazy(() => import('./pages/Auth/ConfirmEmailPage'));
const MagicLoginPage = lazy(() => import('./pages/Auth/MagicLoginPage'));
const AcceptInvitationPage = lazy(() => import('./pages/Auth/AcceptInvitationPage'));
const SetupAccountPage = lazy(() => import('./pages/Auth/SetupAccountPage'));
const BuildingLoginPage = lazy(() => import('./pages/Auth/BuildingLoginPage'));
const LegalDocumentsAdminPage = lazy(() => import('./pages/Admin/LegalDocumentsAdminPage'));
const ChangePasswordPage = lazy(() => import('./pages/Auth/ChangePasswordPage'));
const ForceChangePasswordPage = lazy(() => import('./pages/Auth/ForceChangePasswordPage'));
const NewsletterConfirmPage = lazy(() => import('./pages/Newsletter/NewsletterConfirmPage'));
const NewsletterUnsubscribePage = lazy(() => import('./pages/Newsletter/NewsletterUnsubscribePage'));
const GoogleCalendarCallback = lazy(() => import('./pages/Auth/GoogleCalendarCallback'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
  </div>
);

const StudioApp = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
    {/* Default redirect when visiting /studio */}
    <Route index element={<Navigate to="sites" replace />} />

    {/* Terms of Service acceptance - OUTSIDE ProtectedRoute to avoid redirect loop */}
    <Route path="accept-terms" element={<AcceptTermsPage />} />
    
    {/* Email confirmation - PUBLIC route, no auth required */}
    <Route path="confirm-email/:key" element={<ConfirmEmailPage />} />
    
    {/* Magic link login - PUBLIC route, no auth required */}
    <Route path="magic-login/:token" element={<MagicLoginPage />} />
    
    {/* Google Calendar OAuth callback - PUBLIC route, no auth required */}
    <Route path="auth/google/callback" element={<GoogleCalendarCallback />} />
    
    {/* Newsletter confirmation - PUBLIC route, no auth required */}
    <Route path="newsletter/confirm/:token" element={<NewsletterConfirmPage />} />
    
    {/* Newsletter unsubscribe - PUBLIC route, no auth required */}
    <Route path="newsletter/unsubscribe/:token" element={<NewsletterUnsubscribePage />} />
    
    {/* Accept team invitation - PUBLIC route, no auth required */}
    <Route path="accept-invitation/:token" element={<AcceptInvitationPage />} />
    
    {/* Setup account (new users from team invitation) */}
    <Route path="setup-account/:token" element={<SetupAccountPage />} />
    
    {/* Password reset - PUBLIC route, no auth required */}
    <Route path="reset-password/:token" element={<ChangePasswordPage />} />
    
    {/* Force change password - for users with temporary password */}
    <Route path="change-password" element={<ProtectedRoute><ForceChangePasswordPage /></ProtectedRoute>} />
    
    {/* Building login page - shown during site creation flow */}
    <Route path="building-login" element={<BuildingLoginPage />} />

    {/* Pages with persistent Navigation - shared NavigationLayout */}
    <Route element={<NavigationLayout />}>
      <Route path="calendar/creator" element={<ProtectedRoute><CreatorCalendarApp /></ProtectedRoute>} />
      <Route path="events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
      <Route path="sites" element={<ProtectedRoute><SitesPage /></ProtectedRoute>} />
      <Route path="domain" element={<ProtectedRoute><DomainPage /></ProtectedRoute>} />
      <Route path="domain/buy" element={<ProtectedRoute><BuyDomainPage /></ProtectedRoute>} />
      <Route path="domain-purchase-success" element={<ProtectedRoute><DomainPurchaseSuccessPage /></ProtectedRoute>} />
      <Route path=":siteId/domain" element={<ProtectedRoute><DomainPage /></ProtectedRoute>} />
      <Route path=":siteId/domain/buy" element={<ProtectedRoute><BuyDomainPage /></ProtectedRoute>} />
      <Route path="team/:siteId" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
      <Route path="new" element={<CategorySelectionPage />} />
      <Route path="new_project" element={<NewProjectPage />} />
      <Route path="new/style" element={<StyleSelectionPage />} />
      <Route path="sites/modules/:siteId" element={<ManageModulesPage />} />
      <Route path="lab/:siteId" element={<ProtectedRoute><SiteLabPage /></ProtectedRoute>} />
      <Route path="admin" element={<ProtectedRoute requireStaff><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="admin/terms" element={<ProtectedRoute requireStaff><LegalDocumentsAdminPage /></ProtectedRoute>} />
    </Route>

    {/* Email Editor - Standalone page with own navigation */}
    <Route path="email-editor" element={<ProtectedRoute><EmailEditorPage /></ProtectedRoute>} />

    {/* Payment success/failed pages - PUBLIC routes */}
    <Route path="payment/success" element={<PaymentSuccessPage />} />
    <Route path="payment/failed" element={<PaymentFailedPage />} />

    {/* Account settings routes with shared layout */}
    <Route path="account" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="notifications" replace />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="mails" element={<MailsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="billing" element={<BillingPage />} />
      <Route path="appearance" element={<AppearancePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="toast" element={<ToastTestPage />} />
    </Route>

    {/* Editor routes - Has own editor navigation*/}
    <Route path="editor/new" element={<ProtectedRoute><NewEditorPage /></ProtectedRoute>} />
    <Route path="editor/:siteId" element={<ProtectedRoute><NewEditorPage /></ProtectedRoute>} />
    
    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  </Suspense>
);

export default StudioApp;