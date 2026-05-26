import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Windows may have NODE_ENV=production globally; React Fast Refresh needs development
process.env.NODE_ENV = 'development'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
