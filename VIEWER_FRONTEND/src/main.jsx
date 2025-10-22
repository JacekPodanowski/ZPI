import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@shared/theme/ThemeProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider initialTheme="studio">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
