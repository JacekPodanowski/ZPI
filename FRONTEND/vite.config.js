import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      '@mui/system',
      '@mui/base',
      '@mui/utils',
      '@emotion/cache',
      'framer-motion',
      'zustand',
      'react-router-dom',
      '@react-oauth/google',
    ],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  esbuild: {
    target: 'es2022',
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'youreasysite.pl',
      'www.youreasysite.pl',
      '.railway.app',
      '.up.railway.app',
    ],
    // SSL configuration for HTTPS (port 3001)
    https: process.env.VITE_HTTPS === 'true' && process.env.VITE_SSL_CERT ? {
      cert: process.env.VITE_SSL_CERT,
      key: process.env.VITE_SSL_KEY,
    } : false,
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
