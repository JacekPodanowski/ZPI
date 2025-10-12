import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import PublicCalendarPage from './pages/PublicCalendar/PublicCalendarPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import StylesPage from './pages/Styles';
import ProtectedRoute from './routes/ProtectedRoute';
import EditorApp from './editor/EditorApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/calendar" element={<PublicCalendarPage />} />
          <Route path="/styles" element={<StylesPage />} />
          <Route
            path="/admin"
            element={(
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            )}
          />
          <Route path="/editor/*" element={<EditorApp />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
