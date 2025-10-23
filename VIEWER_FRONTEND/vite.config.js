import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const resolveSharedSrcPath = () => {
  const candidates = [
    process.env.SHARED_FRONTEND_PATH,
    path.resolve(__dirname, '../FRONTEND/src'),
    path.resolve(__dirname, './frontend/src'),
  ].filter(Boolean)

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate)
    if (existsSync(resolved)) {
      return resolved
    }
  }

  return null
}

const sharedSrcPath = resolveSharedSrcPath()

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
      ...(sharedSrcPath
        ? {
            '@shared/components': path.join(sharedSrcPath, 'components'),
            '@shared/services': path.join(sharedSrcPath, 'services'),
            '@shared/theme': path.join(sharedSrcPath, 'theme'),
            '@shared/SITES': path.join(sharedSrcPath, 'SITES'),
            '@shared/utils': path.join(sharedSrcPath, 'utils'),
            '@shared/config': path.join(sharedSrcPath, 'config'),
            '@shared/constants': path.join(sharedSrcPath, 'constants'),
            '@shared/styles': sharedSrcPath,
          }
        : {}),
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
