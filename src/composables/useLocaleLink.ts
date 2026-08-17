import { computed } from 'vue'
import { useLocaleStore } from '@/stores/locale'

/**
 * Every <RouterLink :to="{name: ..., params: localeParams(...)}"> needs the
 * current locale merged in, or navigating while on /ar/... would silently
 * drop back to the English URL. Spread the result into a route's params.
 */
export function useLocaleLink() {
  const localeStore = useLocaleStore()

  function localeParams(extra: Record<string, unknown> = {}) {
    return {
      ...extra,
      locale: localeStore.current === 'ar' ? 'ar' : undefined,
    }
  }

  const otherLocale = computed(() => (localeStore.current === 'ar' ? 'en' : 'ar'))

  return { localeParams, otherLocale }
}
