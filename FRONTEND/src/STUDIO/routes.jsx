import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import SitesPage from './pages/Sites/SitesPage';
import CategorySelectionPage from './pages/NewSite/CategorySelectionPage';
import NewProjectPage from './pages/NewSite/NewProjectPage';
import ManageModulesPage from './pages/NewSite/ManageModulesPage';
import EditorPage from './pages/Editor/EditorPage';
import NewEditorPage from './pages/Editor/NewEditorPage';
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
import NotificationsPage from './pages/Settings/NotificationsPage';
import SiteLabPage from './pages/Lab/SiteLabPage';
import ToastTestPage from './pages/Lab/ToastTestPage';
import ComponentLabPage from './pages/Lab/ComponentLabPage';
import EditorLabPage from './pages/Lab/EditorLabPage';

const StudioApp = () => (
  <Routes>
    {/* Default redirect when visiting /studio */}
    <Route index element={<Navigate to="" replace />} />

    {/* Site creation flow - OUTSIDE StudioLayout to avoid layout padding/footer */}
    <Route path="new" element={<ProtectedRoute><CategorySelectionPage /></ProtectedRoute>} />
    <Route path="new_project" element={<ProtectedRoute><NewProjectPage /></ProtectedRoute>} />
    <Route path="sites/modules/:siteId" element={<ProtectedRoute><ManageModulesPage /></ProtectedRoute>} />

    <Route element={<StudioLayout />}>
      {/* Studio dashboard and site management */}
      <Route path="sites" element={<ProtectedRoute><SitesPage /></ProtectedRoute>} />

      {/* Calendar previews for development */}
      <Route path="calendar/public" element={<PublicCalendarPage />} />
      <Route path="calendar/creator" element={<ProtectedRoute><CreatorCalendarApp /></ProtectedRoute>} />

      {/* Dev Lab */}
      <Route path="lab/toast" element={<ToastTestPage />} />
      <Route path="lab/components" element={<ProtectedRoute><ComponentLabPage /></ProtectedRoute>} />
      <Route path="lab/editor" element={<EditorLabPage />} />

      {/* Admin area */}
      <Route path="admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="creator" element={<ProtectedRoute><CreatorDashboardPage /></ProtectedRoute>} />
      <Route path="lab/:siteId" element={<ProtectedRoute><SiteLabPage /></ProtectedRoute>} />
    </Route>

    {/* Account settings routes with shared layout */}
    <Route path="account" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="notifications" replace />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="billing" element={<BillingPage />} />
      <Route path="appearance" element={<AppearancePage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>

    {/* Editor routes - New editor is now default */}
    <Route path="editor/new" element={<ProtectedRoute><NewEditorPage /></ProtectedRoute>} />
    <Route path="editor/:siteId" element={<ProtectedRoute><NewEditorPage /></ProtectedRoute>} />
    
    {/* Old Editor (v1) - kept for legacy/fallback, not easily accessible */}
    <Route path="legacy-editor/new" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
    <Route path="legacy-editor/:siteId" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default StudioApp;