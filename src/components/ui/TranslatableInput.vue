<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const model = defineModel<{ en: string; ar: string }>({ required: true })
defineProps<{ label?: string; required?: boolean; textarea?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <div>
    <label v-if="label" class="mb-1 block text-sm font-medium text-slate-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('common.english') }}</span>
        <textarea
          v-if="textarea"
          v-model="model.en"
          dir="ltr"
          rows="4"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
        <input
          v-else
          v-model="model.en"
          type="text"
          dir="ltr"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('common.arabic') }}</span>
        <textarea
          v-if="textarea"
          v-model="model.ar"
          dir="rtl"
          rows="4"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
        <input
          v-else
          v-model="model.ar"
          type="text"
          dir="rtl"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>
    </div>
  </div>
</template>
