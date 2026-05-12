<script setup>
import { computed } from 'vue'
import { useAccountingStore } from '../../stores/accountingStore'
import { formatCurrency, formatDate } from '../../utils/ui'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const store = useAccountingStore()

const summary = computed(() =>
  store.tenantLedgerEntries.reduce(
    (accumulator, entry) => {
      entry.lines.forEach((line) => {
        accumulator.debit += line.debit
        accumulator.credit += line.credit

        if (line.account.startsWith('1305')) {
          accumulator.receivable += line.debit - line.credit
        }

        if (line.account.startsWith('4135')) {
          accumulator.revenue += line.credit - line.debit
        }

        if (line.account.startsWith('2408')) {
          accumulator.tax += line.credit - line.debit
        }
      })

      return accumulator
    },
    { debit: 0, credit: 0, receivable: 0, revenue: 0, tax: 0 },
  ),
)
</script>

<template>
  <section :class="['view', { active: isActive }]">
    <div class="two-column">
      <article class="panel-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">Libro diario</p>
            <h3>Asientos generados</h3>
          </div>
        </div>

        <div v-if="store.tenantLedgerEntries.length" class="entry-list">
          <article
            v-for="entry in store.tenantLedgerEntries"
            :key="entry.id"
            :class="['entry-card', 'invoice-card', { active: entry.id === store.selections.entryId }]"
            @click="store.selectEntry(entry.id)"
          >
            <div class="invoice-card-head">
              <div>
                <p>{{ entry.reference }}</p>
                <p class="label-soft">{{ entry.description }}</p>
              </div>
              <span class="small-pill">{{ formatDate(entry.createdAt) }}</span>
            </div>
            <div class="mini-row">
              <span class="label-soft">Debito / Credito</span>
              <strong>{{ formatCurrency(entry.lines.reduce((sum, line) => sum + line.debit, 0)) }}</strong>
            </div>
          </article>
        </div>
        <p v-else class="empty-state">Aun no hay asientos para mostrar en el libro diario.</p>
      </article>

      <div class="stack-column">
        <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Balance rapido</p>
              <h3>Indicadores contables</h3>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-row">
              <span class="label-soft">Debitos</span>
              <strong class="value-strong">{{ formatCurrency(summary.debit) }}</strong>
            </div>
            <div class="summary-row">
              <span class="label-soft">Creditos</span>
              <strong class="value-strong">{{ formatCurrency(summary.credit) }}</strong>
            </div>
            <div class="summary-row">
              <span class="label-soft">CxC estimada</span>
              <strong class="value-strong">{{ formatCurrency(summary.receivable) }}</strong>
            </div>
            <div class="summary-row">
              <span class="label-soft">Ingresos</span>
              <strong class="value-strong">{{ formatCurrency(summary.revenue) }}</strong>
            </div>
            <div class="summary-row">
              <span class="label-soft">IVA generado</span>
              <strong class="value-strong">{{ formatCurrency(summary.tax) }}</strong>
            </div>
          </div>
        </article>

        <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Detalle</p>
              <h3>Comprobante seleccionado</h3>
            </div>
          </div>

          <template v-if="store.selectedEntry">
            <div class="summary-grid">
              <div class="summary-row">
                <span class="label-soft">Referencia</span>
                <strong class="value-strong">{{ store.selectedEntry.reference }}</strong>
              </div>
              <div class="summary-row">
                <span class="label-soft">Generado</span>
                <strong class="value-strong">{{ formatDate(store.selectedEntry.createdAt) }}</strong>
              </div>
            </div>

            <div class="entry-lines">
              <div v-for="(line, index) in store.selectedEntry.lines" :key="`${line.account}-${index}`" class="entry-line">
                <div>
                  <p>{{ line.account }} - {{ line.label }}</p>
                </div>
                <strong>{{ formatCurrency(line.debit) }}</strong>
                <strong>{{ formatCurrency(line.credit) }}</strong>
              </div>
            </div>
          </template>
          <p v-else class="empty-state">Selecciona un asiento para revisar sus lineas contables.</p>
        </article>
      </div>
    </div>
  </section>
</template>
