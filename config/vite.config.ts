import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { componentTagger } from 'lovable-tagger';
import { fileURLToPath } from 'url';
import { dirname, resolve as pathResolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Gzip compression for broader CDN compatibility
    viteCompression({ algorithm: 'gzip' }),
    // Brotli compression for modern clients
    viteCompression({ algorithm: 'brotliCompress' }),
  ].filter(Boolean),
  root: '.',
  publicDir: 'public',
  assetsInclude: ['**/*.avif', '**/*.webp', '**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.webm', '**/*.mp3'],
  resolve: {
    alias: {
      '@': pathResolve(__dirname, 'src'),
    },
  },
  server: {
    host: '::',
    port: 8080,
    hmr: { overlay: false },
    open: false,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 1,
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // * Only chunk large vendor libraries to avoid build slowdown
          if (id.includes('node_modules')) {
            if (id.includes('@supabase/supabase-js')) return 'vendor-supabase';
            if (id.includes('@hello-pangea/dnd')) return 'vendor-dnd';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('zustand')) return 'vendor-zustand';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    cssCodeSplit: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
}));