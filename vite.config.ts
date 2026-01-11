import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React vendor chunk
          if (id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

          // Firebase - very heavy (~500kb)
          if (id.includes('node_modules/firebase/') ||
            id.includes('node_modules/@firebase/')) {
            return 'vendor-firebase';
          }

          // Lucide icons - extremely heavy (~800kb in total)
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }

          // Animation libraries
          if (id.includes('node_modules/framer-motion/') ||
            id.includes('node_modules/gsap/')) {
            return 'vendor-animation';
          }

          // NOTE: Recharts/D3 are NOT split into separate chunks 
          // to avoid circular dependency issues that cause runtime errors
          // They will be bundled with Recharts usages directly

          // Sentry (optional, but can be large)
          if (id.includes('node_modules/@sentry/')) {
            return 'vendor-sentry';
          }

          // UI Components (Radix primitives)
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-ui';
          }

          // Data fetching & State
          if (id.includes('node_modules/@tanstack/') ||
            id.includes('node_modules/@supabase/')) {
            return 'vendor-data';
          }

          // Utilities
          if (id.includes('node_modules/lodash') ||
            id.includes('node_modules/date-fns/') ||
            id.includes('node_modules/clsx/') ||
            id.includes('node_modules/tailwind-merge/')) {
            return 'vendor-utils';
          }

          // Helmet (SEO)
          if (id.includes('node_modules/react-helmet')) {
            return 'vendor-seo';
          }

          // Sonner/Toast notifications
          if (id.includes('node_modules/sonner/')) {
            return 'vendor-toast';
          }

          // PDF/Excel export utilities
          if (id.includes('node_modules/xlsx/') ||
            id.includes('node_modules/file-saver/')) {
            return 'vendor-export';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
  },
  // Fix for Recharts/D3 circular dependency issue
  optimizeDeps: {
    include: [
      'recharts',
      'd3-scale',
      'd3-shape',
      'd3-array',
      'd3-interpolate',
      'd3-color',
      'd3-format',
      'd3-time',
      'd3-time-format',
    ],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script-defer",
      includeAssets: ["favicon.ico", "robots.txt", "sitemap.xml", "ads.txt"],
      manifest: {
        name: "Arti Studio",
        short_name: "Arti Studio",
        description: "AI Prompt Inspiration Platform",
        theme_color: "#8B5CF6",
        background_color: "#0a0a0a",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // ═══════════════════════════════════════════════════════════════
        // 🔧 SMART CACHE STRATEGY - Enterprise Grade
        // ═══════════════════════════════════════════════════════════════

        // Clean old caches on activate
        cleanupOutdatedCaches: true,

        // Skip waiting - activate new SW immediately
        skipWaiting: true,

        // Claim clients immediately - take over all open tabs
        clientsClaim: true,

        // Exclude static files from navigation fallback
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/robots\.txt$/, /^\/ads\.txt$/],

        // Don't precache index.html - always fetch fresh
        globIgnores: ['**/index.html'],

        runtimeCaching: [
          // ═══════════════════════════════════════════════════════════
          // 1. HTML Pages - Network First (always fresh)
          // ═══════════════════════════════════════════════════════════
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 3,
            },
          },
          // ═══════════════════════════════════════════════════════════
          // 2. JS/CSS Bundles - StaleWhileRevalidate (fast + fresh)
          // ═══════════════════════════════════════════════════════════
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
              },
            },
          },
          // ═══════════════════════════════════════════════════════════
          // 3. Images - Cache First (performance)
          // ═══════════════════════════════════════════════════════════
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
          // ═══════════════════════════════════════════════════════════
          // 4. Fonts - Cache First (rarely change)
          // ═══════════════════════════════════════════════════════════
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },
          // ═══════════════════════════════════════════════════════════
          // 5. API Calls - Network Only (always fresh data)
          // ═══════════════════════════════════════════════════════════
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api') ||
              url.hostname.includes('supabase') ||
              url.hostname.includes('googleapis'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    headers: {
      "Cache-Control": "no-store",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
  },
}));


