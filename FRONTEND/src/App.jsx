import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './STUDIO/pages/Home/HomePage';
import StylesPage from './STUDIO/pages/Home/StylesPage';
import LoginPage from './STUDIO/pages/Auth/LoginPage';
import StudioRoutes from './STUDIO/routes';

const App = () => (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/styles" element={<StylesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/studio/*" element={<StudioRoutes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

export default App;