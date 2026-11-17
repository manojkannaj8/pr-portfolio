import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  server: { port: 5173, host: true },
  build: {
    // three.js is the stage itself and loads with the first frame; one ~210 KB (gzip) chunk is expected
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
      },
    },
  },
})
