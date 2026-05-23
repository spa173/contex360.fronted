<script setup>
import { onMounted, ref, watch, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Set global Chart.js defaults for a premium look
Chart.defaults.font.family = "'Inter', 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
Chart.defaults.color = '#64748b'
Chart.defaults.scale.grid.color = 'rgba(203, 213, 225, 0.2)'
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)'
Chart.defaults.plugins.tooltip.padding = 10
Chart.defaults.plugins.tooltip.cornerRadius = 8

const props = defineProps({
  type: { type: String, default: 'bar' },
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({}) },
})

const canvasRef = ref(null)
let chartInstance = null

function renderChart() {
  if (chartInstance) {
    chartInstance.destroy()
  }
  if (!canvasRef.value) return

  chartInstance = new Chart(canvasRef.value, {
    type: props.type,
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...props.options,
    },
  })
}

onMounted(renderChart)

watch(() => props.data, renderChart, { deep: true })

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<template>
  <div
    class="chart-container"
    style="position: relative; height: 300px; width: 100%;"
  >
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped>
.chart-container {
  margin-top: 1rem;
}
</style>
