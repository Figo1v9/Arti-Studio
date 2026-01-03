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
        // Exclude critical static files from SPA navigation fallback
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/robots\.txt$/, /^\/ads\.txt$/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
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


