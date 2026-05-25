import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
   base: '/lab-inventory-manager/',
  server: {
    port: 5173,
    host: true
  }
})
