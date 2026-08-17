<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api/client'
import { useToastStore } from '@/stores/toast'
import { confirmDialog } from '@/composables/useConfirm'
import DataTable, { type Column } from '@/components/ui/DataTable.vue'

const { t } = useI18n()
const toast = useToastStore()
const rows = ref<any[]>([])
const loading = ref(false)

const columns: Column[] = [
  { key: 'email', label: 'Email' },
  { key: 'created_at', label: 'Subscribed' },
]

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/newsletter-subscribers', { params: { per_page: 200 } })
    rows.value = data.data.map((r: any) => ({ ...r, created_at: r.created_at?.slice(0, 10) }))
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function remove(row: any) {
  const ok = await confirmDialog(t('common.confirmDeleteTitle'), t('common.confirmDeleteBody'))
  if (!ok) return
  await api.delete(`/admin/newsletter-subscribers/${row.id}`)
  toast.success(t('common.deleted'))
  await load()
}

async function exportCsv() {
  const response = await api.get('/admin/newsletter-subscribers/export', { responseType: 'blob' })
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = 'newsletter-subscribers.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-navy-900">{{ t('nav.newsletter') }}</h1>
      <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50" @click="exportCsv">
        Export CSV
      </button>
    </div>

    <DataTable :columns="columns" :rows="rows" :loading="loading">
      <template #row-actions="{ row }">
        <button class="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50" @click="remove(row)">
          {{ t('common.delete') }}
        </button>
      </template>
    </DataTable>
  </div>
</template>
