import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api/v1': {
        target: 'http://backend:8080',
        changeOrigin: true,
      }
    }
  }
})
