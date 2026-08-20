/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_MODE: 'mock' | 'openai'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
