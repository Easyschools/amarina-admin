<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api/client'
import { useToastStore } from '@/stores/toast'
import TranslatableInput from '@/components/ui/TranslatableInput.vue'

interface StringRow {
  id: number
  group: string
  key: string
  value: { en: string; ar: string }
}

const { t } = useI18n()
const toast = useToastStore()

const grouped = ref<Record<string, StringRow[]>>({})
const activeGroup = ref('nav')
const savingId = ref<number | null>(null)
const search = ref('')

const groups = computed(() => Object.keys(grouped.value))

function humanize(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const visibleRows = computed(() => {
  const rows = grouped.value[activeGroup.value] ?? []
  if (!search.value) return rows
  const q = search.value.toLowerCase()
  return rows.filter(
    (r) => r.key.toLowerCase().includes(q) || r.value.en.toLowerCase().includes(q) || r.value.ar.includes(q),
  )
})

async function load() {
  const { data } = await api.get('/admin/ui-strings')
  grouped.value = data
  if (groups.value.length && !groups.value.includes(activeGroup.value)) {
    activeGroup.value = groups.value[0] ?? activeGroup.value
  }
}

onMounted(load)

async function save(row: StringRow) {
  savingId.value = row.id
  try {
    await api.put(`/admin/ui-strings/${row.id}`, { value: row.value })
    toast.success(t('common.saved'))
  } finally {
    savingId.value = null
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-navy-900">{{ t('nav.labels') }}</h1>
      <input
        v-model="search"
        :placeholder="t('common.search')"
        class="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
      />
    </div>

    <div class="mb-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      <button
        v-for="g in groups"
        :key="g"
        class="rounded-full px-3 py-1.5 text-sm font-medium"
        :class="activeGroup === g ? 'bg-brand-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'"
        @click="activeGroup = g"
      >
        {{ humanize(g) }}
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="row in visibleRows" :key="row.id" class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="mb-2 flex items-center justify-between">
          <code class="text-xs text-slate-400">{{ row.group }}.{{ row.key }}</code>
          <button
            :disabled="savingId === row.id"
            class="rounded-lg bg-brand-500 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            @click="save(row)"
          >
            {{ t('common.save') }}
          </button>
        </div>
        <TranslatableInput v-model="row.value" />
      </div>

      <p v-if="!visibleRows.length" class="text-sm text-slate-400">{{ t('common.empty') }}</p>
    </div>
  </div>
</template>
