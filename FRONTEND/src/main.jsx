import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './theme/ThemeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not defined. Google login will be disabled.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <React.StrictMode>
      <GoogleOAuthProvider clientId={googleClientId || 'missing-google-client-id'}>
        <ThemeProvider initialTheme="studio">
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  </ErrorBoundary>
);
