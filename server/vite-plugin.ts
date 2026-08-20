import { Plugin } from 'vite'
import { handleNavigate } from '../server/ai-handler'

export function aiServerPlugin(): Plugin {
  return {
    name: 'ai-server',
    configureServer(server) {
      server.middlewares.use('/api/ai/navigate', async (req, res) => {
        await handleNavigate(req, res)
      })
    }
  }
}
