import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n, applyDocumentDirection, type Locale } from '@/i18n'

export const useLocaleStore = defineStore('locale', () => {
  const current = ref<Locale>('en')

  function set(locale: Locale) {
    current.value = locale
    ;(i18n.global.locale as unknown as { value: Locale }).value = locale
    applyDocumentDirection(locale)
    localStorage.setItem('amarina_admin_locale', locale)
  }

  return { current, set }
})
