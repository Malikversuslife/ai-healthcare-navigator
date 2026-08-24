import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { aiServerPlugin } from './server/vite-plugin'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY
  if (env.OPENAI_MODEL) process.env.OPENAI_MODEL = env.OPENAI_MODEL

  return {
    plugins: [
      react(),
      aiServerPlugin(),
    ],
    server: {
      allowedHosts: true,
    },
  }
})
