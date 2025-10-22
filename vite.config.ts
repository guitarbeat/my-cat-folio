import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteCompression from 'vite-plugin-compression';
import { fileURLToPath } from 'url';
import { dirname, resolve as pathResolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Gzip compression for broader CDN compatibility
    viteCompression({ algorithm: 'gzip' }),
    // Brotli compression for modern clients
    viteCompression({ algorithm: 'brotliCompress' }),
  ].filter(Boolean),
  root: '.',
  publicDir: 'public',
  cacheDir: 'node_modules/.vite',
  assetsInclude: ['**/*.avif', '**/*.webp', '**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.webm', '**/*.mp3'],
  resolve: {
    alias: {
      '@': pathResolve(__dirname, './src'),
      // * Add more specific aliases for better tree shaking
      '@components': pathResolve(__dirname, './src/shared/components'),
      '@hooks': pathResolve(__dirname, './src/core/hooks'),
      '@utils': pathResolve(__dirname, './src/shared/utils'),
      '@services': pathResolve(__dirname, './src/shared/services'),
      '@styles': pathResolve(__dirname, './src/shared/styles'),
      '@features': pathResolve(__dirname, './src/features'),
      '@core': pathResolve(__dirname, './src/core'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  server: {
    host: '::',
    port: 5173,
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
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        // * Enhanced dead code elimination
        dead_code: true,
        unused: true,
        side_effects: false,
        passes: 2, // * Multiple passes for better optimization
      },
      mangle: {
        safari10: true,
        // * Mangle more aggressively for better compression
        properties: {
          regex: /^_/,
        },
      },
      // * Additional Terser options for better tree shaking
      toplevel: true,
      module: true,
    },
    rollupOptions: {
      // * Enhanced tree shaking configuration
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
      output: {
        // Disable manual chunking to avoid circular dependency issues
        // Let Vite handle chunking automatically
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // * Optimize chunk loading
        experimentalMinChunkSize: 1000,
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    cssCodeSplit: true, // * Enable CSS code splitting for better tree shaking
    // * Additional build optimizations
    reportCompressedSize: false, // * Disable for faster builds
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
}));