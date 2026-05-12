import { ref } from 'vue'

const toasts = ref([])

function pushToast(message, detail = '') {
  if (!message) {
    return
  }

  const toast = {
    id: `${Date.now()}-${Date.now().toString(16).slice(-8)}`,
    message,
    detail,
  }

  toasts.value.push(toast)

  globalThis.setTimeout(() => {
    toasts.value = toasts.value.filter((item) => item.id !== toast.id)
  }, 3600)
}

export function clearToasts() {
  toasts.value = []
}

export function useToasts() {
  return {
    toasts,
    pushToast,
  }
}
