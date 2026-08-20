import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { aiServerPlugin } from './server/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    aiServerPlugin(),
  ],
})
