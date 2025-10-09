import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.js';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme.js';
import { GoogleOAuthProvider } from '@react-oauth/google';
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.error(
    "FATAL ERROR: Zmienna REACT_APP_GOOGLE_CLIENT_ID nie jest zdefiniowana w pliku .env! Logowanie przez Google nie będzie działać."
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);