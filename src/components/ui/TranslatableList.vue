<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const model = defineModel<{ en: string[]; ar: string[] }>({ required: true })
defineProps<{ label?: string }>()
const { t } = useI18n()

function addRow() {
  model.value.en.push('')
  model.value.ar.push('')
}

function removeRow(index: number) {
  model.value.en.splice(index, 1)
  model.value.ar.splice(index, 1)
}
</script>

<template>
  <div>
    <label v-if="label" class="mb-1 block text-sm font-medium text-slate-700">{{ label }}</label>
    <div class="space-y-2">
      <div
        v-for="(_, index) in Math.max(model.en.length, model.ar.length)"
        :key="index"
        class="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          v-model="model.en[index]"
          dir="ltr"
          :placeholder="t('common.english')"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
        <input
          v-model="model.ar[index]"
          dir="rtl"
          :placeholder="t('common.arabic')"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          @click="removeRow(index)"
        >
          ✕
        </button>
      </div>
    </div>
    <button
      type="button"
      class="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-brand-500 hover:text-brand-600"
      @click="addRow"
    >
      + Add row
    </button>
  </div>
</template>
