import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Build settings for the app she sees.
 *
 * Vite does two jobs: it runs the fast development server, and it packs
 * everything into a `dist` folder you can upload to a host.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      // Lets every file write `@/lib/haptics` instead of counting how many
      // ../../.. it takes to climb back out to src.
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },

  server: {
    port: Number(process.env.PORT ?? 5173),
    // 0.0.0.0 rather than localhost, so you can open the app on your PHONE
    // over the same wifi. This is a mobile app; testing it only in a desktop
    // browser will let real problems through.
    host: '0.0.0.0',

    /**
     * During development, anything starting with /api is quietly forwarded to
     * the backend on port 3001. That means the app can just call '/api/wishes'
     * and never needs to know which port the server is on, and there are no
     * cross-origin headaches.
     */
    proxy: {
      '/api': {
        target: process.env.API_URL ?? 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // Warn if any single JavaScript file goes over 400kb. On a phone at
    // midnight, a big bundle is the difference between instant and awkward.
    chunkSizeWarningLimit: 400,

    rollupOptions: {
      output: {
        /**
         * Split React out into its own file.
         *
         * React barely changes between your deploys, so giving it a separate
         * file means her browser can keep the cached copy and only download
         * your changes. It also means the page can start rendering sooner.
         */
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
});
