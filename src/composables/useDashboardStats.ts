import { computed } from 'vue'

export function useDashboardStats() {
  /**
   * Formats a number to COP currency string
   */
  const formatCOP = (value: number | undefined | null) => {
    if (value === null || value === undefined || value === 0) {
      return '---'
    }
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  /**
   * Formats large numbers into compact strings (e.g. 1.2M)
   */
  const formatCompact = (value: number | undefined | null) => {
    if (value === null || value === undefined || value === 0) {
      return '0.0'
    }
    
    return new Intl.NumberFormat('es-CO', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1
    }).format(value)
  }

  /**
   * Ensures safe array access
   */
  const safeLength = (arr: any[] | undefined | null) => {
    return (Array.isArray(arr) ? arr.length : 0) || 0
  }

  return {
    formatCOP,
    formatCompact,
    safeLength
  }
}
