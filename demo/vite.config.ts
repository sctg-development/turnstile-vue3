import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  define: {
    "import.meta.env.CLOUDFLARE_TURNSTILE_SITE_KEY": JSON.stringify(process.env.CLOUDFLARE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"),
    "import.meta.env.CLOUDFLARE_TURNSTILE_SECRET_KEY": JSON.stringify(process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA" ),
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
});