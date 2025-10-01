import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { resolve } from 'path';
import purgecss from '@fullhuman/postcss-purgecss';

export default defineConfig({
    plugins: [
        react(),
        // Gzip compression for broader CDN compatibility
        viteCompression({ algorithm: 'gzip' }),
        // Brotli compression for modern clients
        viteCompression({ algorithm: 'brotliCompress' }),
    ],
    root: '.',
    publicDir: 'public',
  assetsInclude: ['**/*.avif', '**/*.webp', '**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.webm', '**/*.mp3'],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 3000,
        open: true,
        hmr: {
            overlay: false
        }
    },
    build: {
        outDir: 'build',
        sourcemap: true,
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    ui: ['@heroicons/react'],
                    utils: ['zustand', 'prop-types'],
                    welcome: [
                        './src/shared/components/WelcomeScreen',
                        './src/core/hooks/useParticleSystem.js',
                        './src/core/hooks/useImageGallery.js'
                    ]
                },
            },
        },
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
    },
    css: {
        postcss: {
            plugins: [
                purgecss.default({
                    content: ['./src/**/*.{js,jsx,ts,tsx}'],
                    safelist: [
                        'welcome-page',
                        'dark-theme',
                        'light-theme',
                        'cat-background',
                        'cat-background__stars',
                        'cat-background__nebula',
                        'cat-background__floating-cats',
                        'cat-background__cat',
                        'skip-link',
                        'main-content',
                        'global-loading-overlay'
                    ]
                })
            ]
        }
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        // Surface Vercel-provided envs (from legacy Next.js naming) to the client build
        'import.meta.env.BAG_NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.BAG_NEXT_PUBLIC_SUPABASE_URL || ''),
        'import.meta.env.BAG_NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.BAG_NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    },
});
