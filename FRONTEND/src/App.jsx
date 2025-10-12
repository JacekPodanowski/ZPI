import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/Home/HomePage';
import EditorPage from './editor/pages/EditorPage';
import LoginPage from './pages/Login/LoginPage';
import PublicCalendarPage from './pages/PublicCalendar/PublicCalendarPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import StylesPage from './pages/Styles';
import StudioDashboard from './pages/Studio/StudioDashboard';
import SiteCreationWizard from './pages/Studio/SiteCreationWizard';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => (
    <Routes>
        <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/calendar" element={<PublicCalendarPage />} />
            <Route path="/styles" element={<StylesPage />} />
            <Route
                path="/studio"
                element={(
                    <ProtectedRoute>
                        <StudioDashboard />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/studio/new"
                element={(
                    <ProtectedRoute>
                        <SiteCreationWizard />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/editor/new"
                element={(
                    <ProtectedRoute>
                        <EditorPage />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/editor/:siteId"
                element={(
                    <ProtectedRoute>
                        <EditorPage />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/admin"
                element={(
                    <ProtectedRoute>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                )}
            />
            <Route path="*" element={<NotFoundPage />} />
        </Route>
    </Routes>
);

export default App;
