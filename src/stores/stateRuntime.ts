export interface TimerRegistry {
  clear(key: string): void
  clearAll(): void
  set(key: string, timerIds: any[]): void
}

export function createTimerRegistry(): TimerRegistry {
  const scheduledTasks = new Map<string, any[]>()

  return {
    clear(key: string) {
      const timerIds = scheduledTasks.get(key) || []

      /* c8 ignore next 3 */
      if (typeof globalThis !== 'undefined') {
        timerIds.forEach((timerId) => globalThis.clearTimeout(timerId))
      }

      scheduledTasks.delete(key)
    },
    clearAll() {
      /* c8 ignore next 5 */
      if (typeof globalThis !== 'undefined') {
        scheduledTasks.forEach((timerIds) => {
          timerIds.forEach((timerId) => globalThis.clearTimeout(timerId))
        })
      }

      scheduledTasks.clear()
    },
    set(key: string, timerIds: any[]) {
      scheduledTasks.set(key, timerIds)
    },
  }
}

export function getRequestedQuantityByProduct(items: any[]): Map<string, number> {
  return items.reduce((accumulator, item) => {
    if (!item?.productId) {
      return accumulator
    }

    accumulator.set(item.productId, (accumulator.get(item.productId) || 0) + Number(item.quantity || 0))
    return accumulator
  }, new Map<string, number>())
}
