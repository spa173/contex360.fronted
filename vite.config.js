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
    modulePreload: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor: Vue ecosystem
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/@vue')) {
            return 'vendor-vue'
          }
          // Vendor: UI / utilities
          if (id.includes('node_modules/vue-sonner') || id.includes('node_modules/chart.js') || id.includes('node_modules/html2canvas') || id.includes('node_modules/jspdf')) {
            return 'vendor-ui'
          }
          // Vendor: everything else in node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc'
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
        },
      },
    },
  },
})
