<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api/client'
import { useToastStore } from '@/stores/toast'
import TranslatableInput from '@/components/ui/TranslatableInput.vue'
import MediaUploader from '@/components/ui/MediaUploader.vue'

interface SettingRow {
  id: number
  group: string
  key: string
  type: 'text' | 'textarea' | 'image'
  value: { en: string; ar: string } | null
  image: { id: number; url: string; thumb: string; card: string; name: string } | null
  order: number
}

const { t } = useI18n()
const toast = useToastStore()

const grouped = ref<Record<string, SettingRow[]>>({})
const activeGroup = ref('general')
const savingId = ref<number | null>(null)
const pendingFiles = reactive<Record<number, File | null>>({})

const groups = computed(() => Object.keys(grouped.value))

function humanize(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

async function load() {
  const { data } = await api.get('/admin/settings')
  grouped.value = data
  if (groups.value.length && !groups.value.includes(activeGroup.value)) {
    activeGroup.value = groups.value[0] ?? activeGroup.value
  }
}

onMounted(load)

async function saveText(row: SettingRow) {
  savingId.value = row.id
  try {
    await api.put(`/admin/settings/${row.id}`, { value: row.value })
    toast.success(t('common.saved'))
  } finally {
    savingId.value = null
  }
}

async function saveImage(row: SettingRow) {
  const file = pendingFiles[row.id]
  if (!file) return
  savingId.value = row.id
  try {
    const form = new FormData()
    form.append('image', file)
    form.append('_method', 'PUT')
    const { data } = await api.post(`/admin/settings/${row.id}`, form)
    const list = grouped.value[row.group]
    const idx = list?.findIndex((r) => r.id === row.id) ?? -1
    if (list && idx !== -1) list[idx] = data
    toast.success(t('common.saved'))
  } finally {
    savingId.value = null
  }
}
</script>

<template>
  <div>
    <h1 class="mb-4 text-xl font-bold text-navy-900">{{ t('nav.settings') }}</h1>

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

    <div class="space-y-6">
      <div
        v-for="row in grouped[activeGroup] ?? []"
        :key="row.id"
        class="rounded-xl border border-slate-200 bg-white p-5"
      >
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-800">{{ humanize(row.key) }}</h3>
          <button
            :disabled="savingId === row.id"
            class="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            @click="row.type === 'image' ? saveImage(row) : saveText(row)"
          >
            {{ t('common.save') }}
          </button>
        </div>

        <TranslatableInput
          v-if="row.type === 'text' && row.value"
          v-model="row.value"
        />
        <TranslatableInput
          v-else-if="row.type === 'textarea' && row.value"
          v-model="row.value"
          textarea
        />
        <MediaUploader
          v-else-if="row.type === 'image'"
          :existing-url="row.image?.card || row.image?.url"
          @change="(f) => (pendingFiles[row.id] = f)"
        />
      </div>

      <p v-if="!(grouped[activeGroup] ?? []).length" class="text-sm text-slate-400">{{ t('common.empty') }}</p>
    </div>
  </div>
</template>
