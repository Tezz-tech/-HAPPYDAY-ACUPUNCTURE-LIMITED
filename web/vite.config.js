import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  server: {
    port: Number(process.env.WEB_PORT ?? 5173),
    strictPort: true,
    // In development the API runs on :4000 and the browser talks to it through this proxy (docs/05).
    proxy: { '/api': { target: process.env.API_ORIGIN ?? 'http://localhost:4000', changeOrigin: false } },
  },
  build: { cssMinify: true, modulePreload: { polyfill: false } },
});
