import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Proxy only backend API routes; let SPA routes be handled client-side
            '/auth': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
            '/api': { target: 'http://localhost:8080', changeOrigin: true, secure: false }
        }
    }
})
