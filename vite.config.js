import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Some locked-down Windows environments block directory deletes (EPERM).
    // Avoid cleaning `dist/` so builds can still succeed.
    emptyOutDir: false,
  },
})
