import { defineConfig } from 'vite'

// Use '/' for Vercel, and '/meme-generator/' for GitHub Pages
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true'

export default defineConfig({
  base: isVercel ? '/' : '/meme-generator/',
})
