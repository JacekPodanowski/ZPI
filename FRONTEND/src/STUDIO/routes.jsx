import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import SitesPage from './pages/Sites/SitesPage';
import CategorySelectionPage from './pages/NewSite/CategorySelectionPage';
import NewProjectPage from './pages/NewSite/NewProjectPage';
import ManageModulesPage from './pages/NewSite/ManageModulesPage';
import StyleSelectionPage from './pages/NewSite/StyleSelectionPage';
import NewEditorPage from './pages/Editor/NewEditorPage';
import CreatorCalendarApp from './pages/Creator/CreatorCalendarApp';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import StudioLayout from './layouts/StudioLayout';
import NavigationLayout from './layouts/NavigationLayout';
import SettingsLayout from './layouts/SettingsLayout';
import ProfilePage from './pages/Settings/ProfilePage';
import OrdersPage from './pages/Settings/OrdersPage';
import BillingPage from './pages/Settings/BillingPage';
import AppearancePage from './pages/Settings/AppearancePage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotificationsPage from './pages/Settings/NotificationsPage';
import MailsPage from './pages/Settings/MailsPage';
import ToastTestPage from './pages/Settings/ToastTestPage';
import PaymentSuccessPage from './pages/Settings/PaymentSuccessPage';
import PaymentFailedPage from './pages/Settings/PaymentFailedPage';
import SiteLabPage from './pages/Lab/SiteLabPage';
import ComponentLabPage from './pages/Lab/ComponentLabPage';
import TeamPage from './pages/Team/TeamPage';
import DomainPage from './pages/Domain/DomainPage';
import DomainPurchaseSuccessPage from './pages/Domain/DomainPurchaseSuccessPage';
import AcceptTermsPage from './pages/Auth/AcceptTermsPage';
import ConfirmEmailPage from './pages/Auth/ConfirmEmailPage';
import MagicLoginPage from './pages/Auth/MagicLoginPage';
import AcceptInvitationPage from './pages/Auth/AcceptInvitationPage';
import SetupAccountPage from './pages/Auth/SetupAccountPage';
import BuildingLoginPage from './pages/Auth/BuildingLoginPage';
import TermsAdminPage from './pages/Admin/TermsAdminPage';
import ChangePasswordPage from './pages/Auth/ChangePasswordPage';

const StudioApp = () => (
  <Routes>
    {/* Default redirect when visiting /studio */}
    <Route index element={<Navigate to="sites" replace />} />

    {/* Terms of Service acceptance - OUTSIDE ProtectedRoute to avoid redirect loop */}
    <Route path="accept-terms" element={<AcceptTermsPage />} />
    
    {/* Email confirmation - PUBLIC route, no auth required */}
    <Route path="confirm-email/:key" element={<ConfirmEmailPage />} />
    
    {/* Magic link login - PUBLIC route, no auth required */}
    <Route path="magic-login/:token" element={<MagicLoginPage />} />
    
    {/* Accept team invitation - PUBLIC route, no auth required */}
    <Route path="accept-invitation/:token" element={<AcceptInvitationPage />} />
    
    {/* Setup account (new users from team invitation) */}
    <Route path="setup-account/:token" element={<SetupAccountPage />} />
    
    {/* Password reset - PUBLIC route, no auth required */}
    <Route path="reset-password/:token" element={<ChangePasswordPage />} />
    
    {/* Building login page - shown during site creation flow */}
    <Route path="building-login" element={<BuildingLoginPage />} />

    {/* Pages with persistent Navigation - shared NavigationLayout */}
    <Route element={<NavigationLayout />}>
      <Route path="sites" element={<ProtectedRoute><SitesPage /></ProtectedRoute>} />
      <Route path="domain/:siteId" element={<ProtectedRoute><DomainPage /></ProtectedRoute>} />
      <Route path="domain-purchase-success" element={<ProtectedRoute><DomainPurchaseSuccessPage /></ProtectedRoute>} />
      <Route path="team/:siteId" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
      <Route path="new" element={<CategorySelectionPage />} />
      <Route path="new_project" element={<NewProjectPage />} />
      <Route path="new/style" element={<StyleSelectionPage />} />
      <Route path="sites/modules/:siteId" element={<ManageModulesPage />} />
      <Route path="lab/components" element={<ProtectedRoute><ComponentLabPage /></ProtectedRoute>} />
      <Route path="lab/:siteId" element={<ProtectedRoute><SiteLabPage /></ProtectedRoute>} />
      <Route path="admin" element={<ProtectedRoute requireStaff><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="admin/terms" element={<ProtectedRoute requireStaff><TermsAdminPage /></ProtectedRoute>} />
    </Route>


    {/* LEGACY LAYOUT - USE NavigationLayout for new pages !!! */}
    <Route element={<StudioLayout />}>
      <Route path="calendar/creator" element={<ProtectedRoute><CreatorCalendarApp /></ProtectedRoute>} />
    </Route>

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
);

export default StudioApp;