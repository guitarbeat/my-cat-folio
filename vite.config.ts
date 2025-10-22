import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteCompression from 'vite-plugin-compression';

import { fileURLToPath } from 'url';
import { dirname, resolve as pathResolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl =
    env.SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    env.VITE_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    env.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY;

  const defineEnv: Record<string, string> = {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  };

  if (supabaseUrl !== undefined) {
    defineEnv['import.meta.env.SUPABASE_URL'] = JSON.stringify(supabaseUrl);
  }

  if (supabaseAnonKey !== undefined) {
    defineEnv['import.meta.env.SUPABASE_ANON_KEY'] = JSON.stringify(supabaseAnonKey);
  }

  return {
    plugins: [
      react(),
      
      // * Compression disabled - Vercel handles compression automatically
      // * The vite-plugin-compression was causing absolute path issues
      // viteCompression({ algorithm: 'gzip' }),
      // viteCompression({ algorithm: 'brotliCompress' }),
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
      // Ensure a single React instance to avoid hooks dispatcher being null
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    server: {
      host: '::',
      port: 8080,
      hmr: { overlay: false },
      open: false,
    },
    build: {
      outDir: 'build',
      sourcemap: 'hidden', // * Enable source maps for debugging production issues (hidden from public)
      minify: mode === 'development' ? false : 'terser',
      terserOptions: mode === 'development' ? undefined : {
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
        // NOTE: We intentionally omit `toplevel` and `module` here. Enabling
        // both flags simultaneously allows Terser to reorder top-level
        // bindings across chunks, which triggered "Cannot access '<var>'
        // before initialization" errors in the production preview build.
      },
      rollupOptions: {
        output: {
          manualChunks: mode === 'development' ? undefined : (id) => {
            // * Only use granular chunking in production
            if (id.includes('node_modules')) {
              if (id.includes('@supabase/supabase-js')) return 'vendor-supabase';
              if (id.includes('@hello-pangea/dnd')) return 'vendor-dnd';
              if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
              if (id.includes('zustand')) return 'vendor-zustand';
              if (id.includes('@heroicons')) return 'vendor-icons';
              if (id.includes('prop-types')) return 'vendor-prop-types';
              return 'vendor-misc';
            }
            if (id.includes('/features/')) {
              const feature = id.split('/features/')[1]?.split('/')[0];
              if (feature) return `feature-${feature}`;
            }
            if (id.includes('/shared/utils/coreUtils')) {
              return 'shared-utils';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          experimentalMinChunkSize: mode === 'development' ? undefined : 1000,
        },
      },
      chunkSizeWarningLimit: 1000,
      target: 'esnext',
      cssCodeSplit: true, // * Enable CSS code splitting for better tree shaking
      // * Additional build optimizations
      reportCompressedSize: false, // * Disable for faster builds
    },
    define: defineEnv,
  };
});
