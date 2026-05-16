<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useBillingStore } from '../../stores/billingStore'
import { useDashboardStats } from '../../composables/useDashboardStats'
import { useTranslationStore } from '../../stores/translationStore'

const props = defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const auth = useAuthStore()
const billing = useBillingStore()
const { formatCompact } = useDashboardStats()
const translationStore = useTranslationStore()

const totalRevenue = computed(() => (billing.tenantInvoices || []).reduce((sum, inv) => sum + (inv?.total || 0), 0))
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in duration-500">
    <!-- Dashboard Header -->
    <div class="mb-10 flex justify-between items-end border-b border-[#F4F4F5] pb-8">
      <div>
        <h2 class="text-[32px] font-bold text-[#18181B] tracking-tight mb-2">{{ translationStore.t('Performance Overview', 'Resumen de Rendimiento') }}</h2>
        <p class="text-[14px] font-medium text-[#71717A]">{{ translationStore.t('Financial metrics and operational insights', 'Métricas financieras e insights operativos') }}</p>
      </div>
      <div class="flex gap-4">
        <button class="flex items-center gap-2 px-4 py-2 bg-white border border-[#E4E4E7] rounded-lg text-[#18181B] hover:bg-[#FAFAFA] transition-all text-[13px] font-bold shadow-sm">
          <span class="material-symbols-outlined text-[18px]">calendar_today</span>
          Current Period
        </button>
        <button class="flex items-center gap-2 px-6 py-2 bg-[#18181B] text-white rounded-lg hover:opacity-90 transition-all text-[13px] font-bold shadow-sm">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div class="metric-card">
        <div class="flex justify-between items-start mb-6">
          <div>
            <p class="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-1">Total Revenue (MTD)</p>
            <h3 class="text-[28px] font-bold text-[#18181B] tracking-tight">{{ formatCompact(totalRevenue) }}</h3>
          </div>
          <div class="w-10 h-10 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined">trending_up</span>
          </div>
        </div>
        <div class="flex items-center gap-2 border-t border-[#F4F4F5] pt-4">
          <span class="text-[#059669] text-[12px] font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">arrow_upward</span> 12.5%
          </span>
          <span class="text-[11px] font-medium text-[#A1A1AA]">vs previous period</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="flex justify-between items-start mb-6">
          <div>
            <p class="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-1">Expenditures (MTD)</p>
            <h3 class="text-[28px] font-bold text-[#18181B] tracking-tight">$0.00</h3>
          </div>
          <div class="w-10 h-10 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined">trending_down</span>
          </div>
        </div>
        <div class="flex items-center gap-2 border-t border-[#F4F4F5] pt-4">
          <span class="text-[#DC2626] text-[12px] font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">arrow_upward</span> 4.2%
          </span>
          <span class="text-[11px] font-medium text-[#A1A1AA]">vs previous period</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="flex justify-between items-start mb-6">
          <div>
            <p class="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-1">Open Invoices</p>
            <h3 class="text-[28px] font-bold text-[#18181B] tracking-tight">0</h3>
          </div>
          <div class="w-10 h-10 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined">receipt_long</span>
          </div>
        </div>
        <div class="flex items-center gap-2 border-t border-[#F4F4F5] pt-4">
          <span class="text-[#D97706] text-[12px] font-bold">0 Overdue</span>
          <span class="text-[11px] font-medium text-[#A1A1AA] flex-1">Requires review</span>
        </div>
      </div>

      <div class="metric-card border-t-4 border-t-[#2563EB]">
        <div class="flex justify-between items-start mb-6">
          <div>
            <p class="text-[11px] font-bold text-[#2563EB] uppercase tracking-widest mb-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">auto_awesome</span> IA Agent Tasks
            </p>
            <h3 class="text-[28px] font-bold text-[#18181B] tracking-tight">0</h3>
          </div>
          <div class="w-10 h-10 rounded-lg bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#2563EB]">
            <span class="material-symbols-outlined">smart_toy</span>
          </div>
        </div>
        <div class="flex items-center gap-2 border-t border-[#F4F4F5] pt-4">
          <span class="text-[12px] font-bold text-[#18181B]">OCR Automated</span>
          <span class="text-[11px] font-medium text-[#A1A1AA]">Ready for validation</span>
        </div>
      </div>
    </div>

    <!-- Charts & Alerts Row -->
    <div class="grid grid-cols-12 gap-8">
      <div class="col-span-12 lg:col-span-8 bg-white border border-[#E4E4E7] rounded-2xl p-8 shadow-sm flex flex-col h-[480px]">
        <div class="flex justify-between items-center mb-8 pb-6 border-b border-[#F4F4F5]">
          <div>
            <h3 class="text-[20px] font-bold text-[#18181B] tracking-tight">Financial Forecast</h3>
            <p class="text-[13px] font-medium text-[#71717A]">Projected cash flow vs historical data</p>
          </div>
          <div class="flex gap-6">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-[#18181B]"></div>
              <span class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Historical</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full border-2 border-dashed border-[#2563EB]"></div>
              <span class="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">IA Prediction</span>
            </div>
          </div>
        </div>
        <div class="flex-1 relative chart-area border-l border-b border-[#F4F4F5]">
          <svg class="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path d="M0,240 Q150,200 300,220 T600,150" fill="none" stroke="#18181B" stroke-width="2.5" />
            <path d="M600,150 Q750,100 900,120 T1000,50" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-dasharray="8,5" />
          </svg>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-4 bg-white border border-[#E4E4E7] rounded-2xl shadow-sm flex flex-col">
        <div class="p-6 border-b border-[#F4F4F5] flex justify-between items-center bg-[#FAFAFA] rounded-t-2xl">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#18181B]">notifications</span>
            <h3 class="text-[16px] font-bold text-[#18181B]">IA Intelligence Bar</h3>
          </div>
          <span class="bg-white border border-[#E4E4E7] text-[#18181B] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Operational</span>
        </div>
        <div class="p-8 flex-1 flex flex-col items-center justify-center text-center">
          <div class="w-20 h-20 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-6 border border-[#E4E4E7]">
            <span class="material-symbols-outlined text-[#A1A1AA] text-[32px]">check_circle</span>
          </div>
          <h4 class="text-[18px] font-bold text-[#18181B] mb-2">Systems Synchronized</h4>
          <p class="text-[14px] text-[#71717A] font-medium leading-relaxed">The AI has analyzed all recent movements. No anomalies detected in current operations.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chart-area {
  background-size: 50px 50px;
  background-image: linear-gradient(to right, #F4F4F5 1px, transparent 1px),
                    linear-gradient(to bottom, #F4F4F5 1px, transparent 1px);
}
</style>
