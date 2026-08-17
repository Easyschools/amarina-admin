<script setup lang="ts">
import { useI18n } from 'vue-i18n'

export interface Column {
  key: string
  label: string
  image?: boolean
}

defineProps<{
  columns: Column[]
  rows: Record<string, any>[]
  loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div class="overflow-x-auto">
      <table class="w-full text-start text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          <tr>
            <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-start">{{ col.label }}</th>
            <th class="px-4 py-3 text-end">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td :colspan="columns.length + 1" class="px-4 py-8 text-center text-slate-400">
              {{ t('common.loading') }}
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td :colspan="columns.length + 1" class="px-4 py-8 text-center text-slate-400">
              {{ t('common.empty') }}
            </td>
          </tr>
          <tr v-for="row in rows" v-else :key="row.id" class="hover:bg-slate-50">
            <td v-for="col in columns" :key="col.key" class="px-4 py-3 align-middle">
              <img
                v-if="col.image"
                :src="row[col.key] || '/placeholder.svg'"
                class="h-10 w-10 rounded-md object-cover"
                alt=""
              />
              <span v-else>{{ row[col.key] }}</span>
            </td>
            <td class="px-4 py-3 text-end">
              <div class="flex items-center justify-end gap-1">
                <slot name="row-actions" :row="row" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
