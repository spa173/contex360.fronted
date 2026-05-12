import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BusinessChart from './BusinessChart.vue'

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: class {
    static register() {}
    static defaults = {
        font: {},
        color: '',
        scale: { grid: {} },
        plugins: { tooltip: {} }
    }
    constructor() {}
    destroy() {}
    update() {}
  },
  registerables: []
}))

describe('BusinessChart', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(BusinessChart, {
      props: {
        title: 'Sales',
        type: 'line',
        data: { labels: ['Jan'], datasets: [{ data: [10] }] }
      }
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})
