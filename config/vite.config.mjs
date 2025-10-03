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
                manualChunks: (id) => {
                    // Vendor libraries
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'vendor-react';
                        }
                        if (id.includes('@supabase')) {
                            return 'vendor-supabase';
                        }
                        if (id.includes('@hello-pangea/dnd') || id.includes('@dnd-kit')) {
                            return 'vendor-dnd';
                        }
                        if (id.includes('@heroicons') || id.includes('heroicons')) {
                            return 'vendor-icons';
                        }
                        if (id.includes('zustand') || id.includes('prop-types')) {
                            return 'vendor-state';
                        }
                        // Other node_modules go to vendor
                        return 'vendor';
                    }

                    // Feature-specific chunks
                    if (id.includes('/features/auth/') || id.includes('/features/auth')) {
                        return 'feature-auth';
                    }
                    if (id.includes('/features/tournament/') || id.includes('/features/tournament')) {
                        return 'feature-tournament';
                    }
                    if (id.includes('/features/profile/') || id.includes('/features/profile')) {
                        return 'feature-profile';
                    }

                    // Core utilities
                    if (id.includes('/core/hooks/') || id.includes('/core/store/')) {
                        return 'core-utils';
                    }

                    // Services
                    if (id.includes('/shared/services/')) {
                        return 'services';
                    }

                    // Shared components
                    if (id.includes('/shared/components/')) {
                        return 'shared-components';
                    }
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
                ...(process.env.NODE_ENV === 'production'
                    ? [
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
                                'global-loading-overlay',
                                // WelcomeScreen classes
                                'welcomeWrapper',
                                'welcomeWrapper.visible',
                                'welcomeWrapper.animating',
                                'welcomeWrapper.transitioning',
                                'backgroundContainer',
                                'backgroundImage',
                                'overlay',
                                'contentContainer',
                                'themeToggle',
                                'themeIcon',
                                'themeText',
                                'particleContainer',
                                'particle',
                                'celebrationContainer',
                                'confetti',
                                // WelcomeCard classes
                                'rotatedCard',
                                'cardHeader',
                                'headerText',
                                'catNameSection',
                                'cardFooter',
                                'footerButton',
                                'footerButtonText',
                                'footerButtonEmoji'
                            ]
                        })
                    ]
                    : [])
            ]
        }
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        // Surface Vercel-provided envs (from legacy Next.js naming) to the client build
        'import.meta.env.BAG_NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.BAG_NEXT_PUBLIC_SUPABASE_URL || ''),
        'import.meta.env.BAG_NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.BAG_NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
        // Also expose VITE_ prefixed variables
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || process.env.BAG_NEXT_PUBLIC_SUPABASE_URL || ''),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.BAG_NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    },
});
