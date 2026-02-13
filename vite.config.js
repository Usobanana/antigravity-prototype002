import { defineConfig } from 'vite'

export default defineConfig({
  // Mobile optimization: ensure assets are handled correctly relative to root
  base: '/antigravity-prototype002/',
  server: {
    host: true // Expose to network for mobile testing
  }
})
