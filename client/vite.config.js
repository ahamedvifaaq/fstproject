import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Pre-bundle heavy deps up front so Vite doesn't re-optimize mid-session
  // (avoids the slow first hit when a lesson page pulls these in).
  optimizeDeps: {
    include: [
      '@monaco-editor/react',
      'xterm',
      '@xterm/addon-fit',
      'socket.io-client',
      'axios',
      'react-icons/fa',
    ],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  }
})
