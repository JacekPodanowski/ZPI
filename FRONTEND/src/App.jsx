import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './STUDIO/pages/Home/HomePage';
import LoginPage from './STUDIO/pages/Auth/LoginPage';
import StudioRoutes from './STUDIO/routes';
import TermsOfServicePage from './STUDIO/pages/Terms/TermsOfServicePage';
import CancelBookingPage from './SITES/pages/CancelBookingPage';

const App = () => (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/cancel-booking/:bookingId" element={<CancelBookingPage />} />
        <Route path="/studio/*" element={<StudioRoutes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

export default App;