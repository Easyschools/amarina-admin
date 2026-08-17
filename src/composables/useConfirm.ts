import { ref } from 'vue'

interface ConfirmState {
  open: boolean
  title: string
  body: string
  resolve: ((value: boolean) => void) | null
}

const state = ref<ConfirmState>({ open: false, title: '', body: '', resolve: null })

export function useConfirmState() {
  return state
}

export function confirmDialog(title: string, body: string): Promise<boolean> {
  return new Promise((resolve) => {
    state.value = { open: true, title, body, resolve }
  })
}

export function resolveConfirm(value: boolean) {
  state.value.resolve?.(value)
  state.value.open = false
}
