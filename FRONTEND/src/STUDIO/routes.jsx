import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import StudioDashboard from './pages/Dashboard/StudioDashboard';
import SiteCreationWizard from './pages/NewSite/SiteCreationWizard';
import TemplatePicker from './pages/NewSite/TemplatePicker';
import ModuleConfig from './pages/NewSite/ModuleConfig';
import EditorPage from './pages/Editor/EditorPage';
import CreatorDashboardPage from './pages/Creator/CreatorDashboardPage';
import CreatorCalendarApp from './pages/Creator/CreatorCalendarApp';
import PublicCalendarPage from './pages/Home/PublicCalendarPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import MainLayout from './layouts/MainLayout';

const StudioApp = () => (
  <Routes>
    {/* Default redirect when visiting /studio */}
    <Route index element={<Navigate to="dashboard" replace />} />

    <Route element={<MainLayout />}>
      {/* Studio dashboard and site management */}
      <Route path="dashboard" element={<ProtectedRoute><StudioDashboard /></ProtectedRoute>} />
      <Route path="sites" element={<ProtectedRoute><StudioDashboard /></ProtectedRoute>} />

      {/* Site creation flow */}
      <Route path="templates" element={<ProtectedRoute><TemplatePicker /></ProtectedRoute>} />
      <Route path="configure/:templateId" element={<ProtectedRoute><ModuleConfig /></ProtectedRoute>} />
      <Route path="new" element={<ProtectedRoute><SiteCreationWizard /></ProtectedRoute>} />

      {/* Calendar previews for development */}
      <Route path="calendar/public" element={<PublicCalendarPage />} />
      <Route path="calendar/creator" element={<ProtectedRoute><CreatorCalendarApp /></ProtectedRoute>} />

      {/* Admin area */}
      <Route path="admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="creator" element={<ProtectedRoute><CreatorDashboardPage /></ProtectedRoute>} />
    </Route>

    {/* Editor routes remain outside the main layout to use editor-specific navigation */}
    <Route path="editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
    <Route path="editor/new" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
    <Route path="editor/:siteId" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/studio/dashboard" replace />} />
  </Routes>
);

export default StudioApp;