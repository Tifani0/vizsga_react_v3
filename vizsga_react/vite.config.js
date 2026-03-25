import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',        // böngészőszerű környezet a tesztekhez
    setupFiles: './src/setupTest.js',
    globals: true,               // hogy ne kelljen minden fájlba importálni a describe/it/expect-et
  },
})
