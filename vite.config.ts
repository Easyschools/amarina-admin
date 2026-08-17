import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Vite's dev server already falls back to index.html for unmatched paths
  // (appType: 'spa' is the default), so refreshing a deep route works out of
  // the box here. Production needs the try_files rewrite documented in the
  // README.
  server: {
    port: 5173,
  },
})
