import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import StudioDashboard from './pages/Dashboard/StudioDashboard';
import SitesPage from './pages/Sites/SitesPage';
import SiteCreationWizard from './pages/NewSite/SiteCreationWizard';
import EditorPage from './pages/Editor/EditorPage';
import CreatorDashboardPage from './pages/Creator/CreatorDashboardPage';
import CreatorCalendarApp from './pages/Creator/CreatorCalendarApp';
import PublicCalendarPage from './pages/Home/PublicCalendarPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import StudioLayout from './layouts/StudioLayout';
import SettingsLayout from './layouts/SettingsLayout';
import ProfilePage from './pages/Settings/ProfilePage';
import BillingPage from './pages/Settings/BillingPage';
import AppearancePage from './pages/Settings/AppearancePage';
import SettingsPage from './pages/Settings/SettingsPage';
import SiteLabPage from './pages/Lab/SiteLabPage';

const StudioApp = () => (
  <Routes>
    {/* Default redirect when visiting /studio */}
    <Route index element={<Navigate to="" replace />} />

    <Route element={<StudioLayout />}>
      {/* Studio dashboard and site management */}
      <Route path="dashboard" element={<ProtectedRoute><StudioDashboard /></ProtectedRoute>} />
      <Route path="sites" element={<ProtectedRoute><SitesPage /></ProtectedRoute>} />

      {/* Site creation flow */}
      <Route path="new" element={<ProtectedRoute><SiteCreationWizard /></ProtectedRoute>} />

      {/* Calendar previews for development */}
      <Route path="calendar/public" element={<PublicCalendarPage />} />
      <Route path="calendar/creator" element={<ProtectedRoute><CreatorCalendarApp /></ProtectedRoute>} />

      {/* Admin area */}
      <Route path="admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="creator" element={<ProtectedRoute><CreatorDashboardPage /></ProtectedRoute>} />
      <Route path="lab/:siteId" element={<ProtectedRoute><SiteLabPage /></ProtectedRoute>} />
    </Route>

    {/* Account settings routes with shared layout */}
    <Route path="account" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="billing" element={<BillingPage />} />
      <Route path="appearance" element={<AppearancePage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>

    {/* Editor routes remain outside the main layout to use editor-specific navigation */}
    <Route path="editor/new" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
    <Route path="editor/:siteId" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/studio/dashboard" replace />} />
  </Routes>
);

export default StudioApp;