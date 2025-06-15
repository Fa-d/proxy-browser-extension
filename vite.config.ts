import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, 'src/manifest.json'),
          dest: '.' // copies to the root of dist
        },
        {
          src: path.resolve(__dirname, 'src/assets/img'), // copy the whole img folder
          dest: '.' // copies 'img' folder to 'dist/img'
        }
      ]
    })
  ],
  build: {
    sourcemap: true,  // Changed to 'hidden'
    minify: false,        // Disable minification for better debugging
    rollupOptions: {
      input: {
        // Ensure 'index.html' is correctly resolved if it's not at root or adjust as needed.
        // Default is 'index.html' at project root. If your index.html is in src, it should be src/index.html
        main: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: assetInfo => {
          // For the background script, output it as background.js directly in dist
          if (assetInfo.name === 'background') {
            return 'background.js';
          }
          // For other JS entries (like the main app), use assets folder with hash
          return 'assets/[name]-[hash].js';
        },
        // Ensure other assets like CSS, fonts, etc., also go into the assets directory
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    }
  },
  define: {
    __DEV__: true
  }
});
