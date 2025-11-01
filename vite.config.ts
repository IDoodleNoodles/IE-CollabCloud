import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Proxy API routes to the Spring Boot backend during development
            '/auth': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
            '/api': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
            '/projects': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
            '/comments': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
            '/versions': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
            '/users': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
            '/forums': { target: 'http://localhost:8080', changeOrigin: true, secure: false }
        }
    }
})
