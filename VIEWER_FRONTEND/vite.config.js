import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
  },
  preview: {
    port: 3001,
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      '192.168.0.104' || 'http://localhost:8000/api/v1'
    ),
  },
})
