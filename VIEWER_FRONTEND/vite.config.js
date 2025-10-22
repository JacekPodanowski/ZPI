import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Check if we're in Docker (absolute path) or local development (relative path)
const frontendPath = existsSync('/FRONTEND') 
  ? '/FRONTEND/src' 
  : path.resolve(__dirname, '../FRONTEND/src')

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Disable source maps to avoid warnings
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
  },
  preview: {
    port: 3001,
  },
  resolve: {
    alias: {
      '@shared/components': path.join(frontendPath, 'components'),
      '@shared/services': path.join(frontendPath, 'services'),
      '@shared/theme': path.join(frontendPath, 'theme'),
      '@shared/SITES': path.join(frontendPath, 'SITES'),
      '@shared/utils': path.join(frontendPath, 'utils'),
      '@shared/config': path.join(frontendPath, 'config'),
      '@shared/constants': path.join(frontendPath, 'constants'),
      // Force React to use VIEWER_FRONTEND's version to avoid duplication
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    extensions: ['.js', '.jsx', '.json'],
    dedupe: ['react', 'react-dom'],
  },
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(
      'http://192.168.0.104:8000'
    ),
    'import.meta.env.VITE_MEDIA_BASE_URL': JSON.stringify(
      'http://192.168.0.104:8000'
    ),
  },
})
