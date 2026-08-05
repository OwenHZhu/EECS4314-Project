import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   test: {
    environment: "jsdom",
    globals: true,
    include: ["src/test/**/*.{test,spec}.{js,jsx}"]
  },
  preview: {
    allowedHosts: ['book-atlas-frontend-209112693939.us-west2.run.app']
  }
});
