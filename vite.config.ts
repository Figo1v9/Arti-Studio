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

          // Charts (Recharts is HUGE - 367kb)
          if (id.includes('node_modules/recharts/') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/victory-')) {
            return 'vendor-charts';
          }

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
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"], // simplified
      manifest: {
        name: "Prompt Life",
        short_name: "Prompt Life",
        description: "The AI Prompt Engineering Platform",
        theme_color: "#ffffff",
        background_color: "#ffffff",
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
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
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
      "Cross-Origin-Embedder-Policy": "unsafe-none", // Allow popups to work easier in dev
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
  },
}));
