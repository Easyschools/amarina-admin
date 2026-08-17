import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

// Vite env: set VITE_API_URL in .env (defaults to the local Laravel dev server).
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.clear()
      const locale = router.currentRoute.value.params.locale
      router.push(locale === 'ar' ? '/ar/login' : '/login')
    }
    return Promise.reject(error)
  },
)

/**
 * spatie/laravel-translatable's getTranslations() returns `[]`, not
 * `{en, ar}`, for a nullable column that's never been set — normalize that
 * to the shape every TranslatableInput/TranslatableList expects.
 */
export function normalizeTranslatable(value: unknown): { en: string; ar: string } {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const v = value as Record<string, unknown>
    return { en: typeof v['en'] === 'string' ? v['en'] : '', ar: typeof v['ar'] === 'string' ? v['ar'] : '' }
  }
  return { en: '', ar: '' }
}

/**
 * Build a FormData payload from a plain object, expanding nested
 * objects/arrays into bracket notation (title[en], features[ar][0], …) so
 * Laravel's request->validate('title.en') sees the same shape whether the
 * request carries files or not. Method-spoofs PUT/PATCH since browsers
 * can't send multipart bodies on those verbs directly.
 */
export function toFormData(payload: Record<string, unknown>, method: 'POST' | 'PUT' = 'POST'): FormData {
  const form = new FormData()
  if (method === 'PUT') {
    form.append('_method', 'PUT')
  }

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) return
    if (value instanceof File) {
      form.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => append(`${key}[${i}]`, v))
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) => append(`${key}[${k}]`, v))
    } else if (typeof value === 'boolean') {
      form.append(key, value ? '1' : '0')
    } else {
      form.append(key, String(value))
    }
  }

  Object.entries(payload).forEach(([key, value]) => append(key, value))

  return form
}
