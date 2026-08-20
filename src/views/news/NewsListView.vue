<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { api } from '@/api/client'
import { useToastStore } from '@/stores/toast'
import { useLocaleStore } from '@/stores/locale'
import { useLocaleLink } from '@/composables/useLocaleLink'
import { confirmDialog } from '@/composables/useConfirm'
import DataTable, { type Column } from '@/components/ui/DataTable.vue'

const { t } = useI18n()
const toast = useToastStore()
const localeStore = useLocaleStore()
const { localeParams } = useLocaleLink()

const rows = ref<any[]>([])
const loading = ref(false)

const columns: Column[] = [
  { key: 'featured_image', label: '', image: true },
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'common.category' },
  { key: 'published_at', label: 'Published' },
]

const displayRows = computed(() =>
  rows.value.map((p) => ({
    id: p.id,
    featured_image: p.featured_image?.thumb || p.featured_image?.url || null,
    title: p.title?.[localeStore.current] ?? p.title?.en,
    category: p.category?.name?.[localeStore.current] ?? p.category?.name?.en ?? t('common.uncategorized'),
    published_at: p.published_at ? String(p.published_at).slice(0, 10) : '—',
  })),
)

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/news-posts', { params: { per_page: 100 } })
    rows.value = data.data
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function remove(row: any) {
  const ok = await confirmDialog(t('common.confirmDeleteTitle'), t('common.confirmDeleteBody'))
  if (!ok) return
  await api.delete(`/admin/news-posts/${row.id}`)
  toast.success(t('common.deleted'))
  await load()
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-navy-900">{{ t('nav.news') }}</h1>
      <RouterLink
        :to="{ name: 'news-create', params: localeParams() }"
        class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
      >
        + {{ t('common.add') }}
      </RouterLink>
    </div>

    <DataTable :columns="columns.map(c => ({...c, label: c.label.startsWith('common.') ? t(c.label) : c.label}))" :rows="displayRows" :loading="loading">
      <template #row-actions="{ row }">
        <RouterLink
          :to="{ name: 'news-edit', params: localeParams({ id: row.id }) }"
          class="rounded px-2 py-1 text-sm text-brand-600 hover:bg-brand-50"
        >
          {{ t('common.edit') }}
        </RouterLink>
        <button class="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50" @click="remove(row)">
          {{ t('common.delete') }}
        </button>
      </template>
    </DataTable>
  </div>
</template>
