import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { resolve } from 'path';

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
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'build',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                },
            },
        },
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        // Surface Vercel-provided envs (from legacy Next.js naming) to the client build
        'import.meta.env.BAG_NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.BAG_NEXT_PUBLIC_SUPABASE_URL || ''),
        'import.meta.env.BAG_NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.BAG_NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    },
});
