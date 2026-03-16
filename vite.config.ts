import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk: React and router for long-term caching
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/wouter/')) {
            return 'vendor';
          }
          // Recharts in its own chunk so /charts loads it only when needed and it can be cached separately
          if (id.includes('node_modules/recharts')) {
            return 'recharts';
          }
          // Google OAuth only needed for auth pages
          if (id.includes('node_modules/@react-oauth/google')) {
            return 'google-oauth';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
