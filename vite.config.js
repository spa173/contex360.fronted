import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        transformAssetUrls: {
          includeAbsolute: false,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Re-enabled: Vite injects <link rel="modulepreload"> for each async chunk,
    // eliminating waterfall loading when navigating between app modules.
    // modulePreload: false was causing N round-trips for lazy-loaded views.
    modulePreload: { polyfill: true },
    chunkSizeWarningLimit: 600,
    // es2022 supports top-level await (used in stateSeed.ts) and is supported by
    // all browsers from 2022+ (well within our audience in 2026).
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor: Vue ecosystem
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/@vue')) {
            return 'vendor-vue'
          }
          // Vendor: PDF / canvas — large, only needed in billing/reports
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'vendor-pdf'
          }
          // Vendor: Chart.js — only needed in dashboard/reports
          if (id.includes('node_modules/chart.js')) {
            return 'vendor-chart'
          }
          // Vendor: UI / notifications
          if (id.includes('node_modules/vue-sonner') || id.includes('node_modules/reka-ui') || id.includes('node_modules/@radix-ui')) {
            return 'vendor-ui'
          }
          // Vendor: everything else in node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
          // Landing page — split so it doesn't block the authenticated app shell
          if (id.includes('/LandingPage') || id.includes('/views/PricingView') || id.includes('/views/DemoRequestView') || id.includes('/views/AboutView')) {
            return 'chunk-landing'
          }
          // App views — split into logical groups
          if (id.includes('/views/BillingView') || id.includes('/views/PurchasesView') || id.includes('/views/QuotesView')) {
            return 'chunk-billing'
          }
          if (id.includes('/views/InventoryView') || id.includes('/views/ThirdPartiesView')) {
            return 'chunk-inventory'
          }
          if (id.includes('/views/AccountingView') || id.includes('/views/TreasuryView') || id.includes('/views/ReportsView')) {
            return 'chunk-accounting'
          }
          if (id.includes('/views/AdminConsoleView') || id.includes('/views/UsersView') || id.includes('/views/TwoFactorView') || id.includes('/views/ProfileView')) {
            return 'chunk-admin'
          }
          if (id.includes('/views/DashboardView') || id.includes('/views/AiView') || id.includes('/ai/')) {
            return 'chunk-dashboard'
          }
          // Legal pages — rarely visited, split out
          if (id.includes('/views/PrivacyPolicyView') || id.includes('/views/TermsOfUseView') || id.includes('/views/DataProcessingView') || id.includes('/views/BusinessContinuityView')) {
            return 'chunk-legal'
          }
        },
      },
    },
  },
})
