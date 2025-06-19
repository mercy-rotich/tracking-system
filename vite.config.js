import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://kz017zc2-8090.inc1.devtunnels.ms',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
