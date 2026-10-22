
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { API_URL } from './src/api/const.js'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
       '/api': {
         target: `${API_URL}`, // или актуальный хост из доки https://media.green-api.com
         changeOrigin: true,
         rewrite: (path) => path.replace(/^\/api/, ''),
       },
   },
  },
  build: {
    sourcemap: false,
  },
})
