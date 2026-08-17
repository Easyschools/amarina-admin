<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api/client'
import { useToastStore } from '@/stores/toast'
import { confirmDialog } from '@/composables/useConfirm'

interface Submission {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

const { t } = useI18n()
const toast = useToastStore()
const rows = ref<Submission[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/contact-submissions', { params: { per_page: 100 } })
    rows.value = data.data
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function toggleRead(row: Submission) {
  const { data } = await api.put(`/admin/contact-submissions/${row.id}`, { is_read: !row.is_read })
  row.is_read = data.is_read
}

async function remove(row: Submission) {
  const ok = await confirmDialog(t('common.confirmDeleteTitle'), t('common.confirmDeleteBody'))
  if (!ok) return
  await api.delete(`/admin/contact-submissions/${row.id}`)
  toast.success(t('common.deleted'))
  await load()
}
</script>

<template>
  <div>
    <h1 class="mb-4 text-xl font-bold text-navy-900">{{ t('nav.contactSubmissions') }}</h1>

    <div v-if="loading" class="text-sm text-slate-400">{{ t('common.loading') }}</div>
    <div v-else-if="!rows.length" class="text-sm text-slate-400">{{ t('common.empty') }}</div>

    <div class="space-y-3">
      <div
        v-for="row in rows"
        :key="row.id"
        class="rounded-xl border bg-white p-4"
        :class="row.is_read ? 'border-slate-200' : 'border-brand-300 bg-brand-50/30'"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-semibold text-slate-800">{{ row.first_name }} {{ row.last_name }} · {{ row.subject }}</p>
            <p class="text-xs text-slate-500">{{ row.email }} <span v-if="row.phone">· {{ row.phone }}</span> · {{ row.created_at?.slice(0, 16).replace('T', ' ') }}</p>
          </div>
          <div class="flex shrink-0 gap-2">
            <button class="rounded-lg border border-slate-300 px-2.5 py-1 text-xs hover:bg-slate-50" @click="toggleRead(row)">
              {{ row.is_read ? 'Mark unread' : 'Mark read' }}
            </button>
            <button class="rounded-lg border border-red-300 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50" @click="remove(row)">
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
        <p class="mt-2 text-sm whitespace-pre-line text-slate-700">{{ row.message }}</p>
      </div>
    </div>
  </div>
</template>
