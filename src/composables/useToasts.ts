import { ref } from 'vue'

interface Toast {
  id: string
  message: string
  detail: string
}

const toasts = ref<Toast[]>([])

function pushToast(message: string, detail: string = '') {
  if (!message) {
    return
  }

  const toast: Toast = {
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
