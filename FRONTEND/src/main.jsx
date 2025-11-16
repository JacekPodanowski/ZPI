import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import SiteApp from './SITES/SiteApp';
import { AuthProvider } from './contexts/AuthContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './theme/ThemeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const buildTarget = import.meta.env.VITE_BUILD_TARGET;
const routingMode = import.meta.env.VITE_APP_ROUTING_MODE;
const root = ReactDOM.createRoot(document.getElementById('root'));

// W trybie subdomeny, renderujemy bezpośrednio SiteApp, jeśli nie jesteśmy na domenie "studio" lub "localhost"
// To pozwala uniknąć ładowania całego routera Studio dla stron publicznych.
const hostname = window.location.hostname;
const isStudioDomain = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('studio.');
const renderSiteDirectly = routingMode === 'subdomain' && !isStudioDomain;

// If the build target is 'SITE', render only the user's public site
if (buildTarget === 'SITE' || renderSiteDirectly) {
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <ThemeProvider initialTheme="studio">
          <SiteApp />
        </ThemeProvider>
      </React.StrictMode>
    </ErrorBoundary>
  );
} else {
  // Otherwise, render the full Studio/SaaS application
  if (!googleClientId) {
    console.warn('VITE_GOOGLE_CLIENT_ID is not defined. Google login will be disabled.');
  }

  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <GoogleOAuthProvider clientId={googleClientId || 'missing-google-client-id'}>
          <BrowserRouter>
            <AuthProvider>
              <ThemeProvider initialTheme="studio">
                <PreferencesProvider>
                  <ToastProvider>
                    <App />
                  </ToastProvider>
                </PreferencesProvider>
              </ThemeProvider>
            </AuthProvider>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </React.StrictMode>
    </ErrorBoundary>
  );
}
