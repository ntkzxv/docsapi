import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api-voice': {
        target: 'https://api-voice.botnoi.ai',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api-voice/, ''),
      },
    },
  },
})
