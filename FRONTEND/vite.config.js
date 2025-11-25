import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const enablePolling = process.env.CHOKIDAR_USEPOLLING === 'true' || process.env.VITE_USE_POLLING === 'true';
const pollInterval = Number(process.env.VITE_POLL_INTERVAL ?? 200);
const hmrHost = process.env.VITE_HMR_HOST;
const hmrPort = process.env.VITE_HMR_PORT ? Number(process.env.VITE_HMR_PORT) : undefined;
const hmrProtocol = process.env.VITE_HMR_PROTOCOL;

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      '@mui/system',
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
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    cssCodeSplit: true, // Enable CSS code splitting
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk - core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // MUI chunk - Material-UI and Emotion
          'vendor-mui': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
            '@mui/system',
            '@mui/utils'
          ],
          // Animation and utilities
          'vendor-utils': [
            'framer-motion',
            'zustand',
            'chroma-js',
            'date-fns',
            'axios'
          ],
          // Content rendering
          'vendor-content': [
            'react-markdown',
            'remark-gfm',
            'react-syntax-highlighter'
          ]
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[ext]/[name]-[hash].${ext}`;
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable compression
    reportCompressedSize: true
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
    watch: {
      usePolling: enablePolling,
      interval: pollInterval,
    },
    hmr: hmrHost || hmrPort || hmrProtocol ? {
      host: hmrHost,
      port: hmrPort,
      protocol: hmrProtocol,
    } : undefined,
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
