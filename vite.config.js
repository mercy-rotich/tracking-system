import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://b1hq3nmr-8090.uks1.devtunnels.ms',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})