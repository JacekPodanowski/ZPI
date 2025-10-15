import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SiteRendererPage from './SITES/pages/SiteRendererPage';

const DEFAULT_IDENTIFIER = import.meta.env.VITE_SITE_IDENTIFIER;

const App = () => (
  <Routes>
    <Route path="/" element={DEFAULT_IDENTIFIER ? <Navigate to={`/sites/${DEFAULT_IDENTIFIER}`} replace /> : <div>Missing VITE_SITE_IDENTIFIER</div>} />
    <Route path="/sites/:identifier" element={<SiteRendererPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
