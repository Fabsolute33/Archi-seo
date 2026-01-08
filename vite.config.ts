import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy pour le scraping - contourne CORS
      '/api/scrape': {
        target: 'https://r.jina.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/scrape/, ''),
        headers: {
          'Accept': 'text/html',
        },
      },
    },
  },
})
