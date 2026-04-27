import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'

function copyExtensionStatics() {
  return {
    name: 'copy-extension-statics',
    // Runs after the bundle is written to disk
    closeBundle() {
      // manifest
      copyFileSync('manifest.json', 'dist/manifest.json')

      // icons
      const iconsDir = 'icons'
      if (existsSync(iconsDir)) {
        mkdirSync('dist/icons', { recursive: true })
        for (const file of readdirSync(iconsDir)) {
          copyFileSync(`${iconsDir}/${file}`, `dist/icons/${file}`)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), copyExtensionStatics()],

  // Treat the project root as the base so /src/... paths in HTML resolve correctly
  root: '.',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        // Keys become the chunk names → entryFileNames pattern below
        // produces dist/popup.js, dist/offscreen.js, dist/service-worker.js
        popup:             resolve(__dirname, 'popup.html'),
        offscreen:         resolve(__dirname, 'offscreen.html'),
        'service-worker':  resolve(__dirname, 'src/service-worker/index.ts'),
      },
      output: {
        // JS entry files → flat in dist/
        entryFileNames: '[name].js',
        // Shared chunks → dist/chunks/
        chunkFileNames: 'chunks/[name]-[hash].js',
        // CSS / other assets → dist/assets/
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },

    // ES2020 is fine for Chrome 100+
    target: 'es2020',
    // Keep readable for debugging; flip to true for production
    minify: false,
  },
})
