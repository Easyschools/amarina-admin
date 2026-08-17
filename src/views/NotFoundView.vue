<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocaleLink } from '@/composables/useLocaleLink'

const { t } = useI18n()
const { localeParams } = useLocaleLink()
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center">
    <h1 class="text-3xl font-bold text-navy-900">404</h1>
    <p class="text-slate-500">{{ t('not_found.body') }}</p>
    <RouterLink :to="{ name: 'dashboard', params: localeParams() }" class="mt-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
      {{ t('not_found.back_home') }}
    </RouterLink>
  </div>
</template>
