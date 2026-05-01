import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    // Allow all host headers so ngrok tunnels (used for payment
    // redirect URLs in local dev) can serve the React app correctly.
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})