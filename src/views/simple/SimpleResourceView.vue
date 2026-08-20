<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, toFormData, normalizeTranslatable } from '@/api/client'
import { useToastStore } from '@/stores/toast'
import { useLocaleStore } from '@/stores/locale'
import { confirmDialog } from '@/composables/useConfirm'
import { RESOURCES, type FieldConfig } from '@/config/resources'
import DataTable, { type Column } from '@/components/ui/DataTable.vue'
import TranslatableInput from '@/components/ui/TranslatableInput.vue'
import TranslatableList from '@/components/ui/TranslatableList.vue'
import MediaUploader from '@/components/ui/MediaUploader.vue'

const props = defineProps<{ resource: string }>()
const { t } = useI18n()
const toast = useToastStore()
const localeStore = useLocaleStore()

// The route param is constrained by a regex to known resource keys, so this
// is always defined at runtime — the `!` just satisfies the index signature.
const config = computed(() => RESOURCES[props.resource]!)
const rows = ref<any[]>([])
const loading = ref(false)
const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const imageFile = ref<File | null>(null)

const form = reactive<Record<string, any>>({})

function blankValue(field: FieldConfig) {
  if (field.type === 'translatable-text' || field.type === 'translatable-textarea') return { en: '', ar: '' }
  if (field.type === 'translatable-list') return { en: [], ar: [] }
  if (field.type === 'checkbox') return false
  return ''
}

function resetForm() {
  config.value.fields.forEach((f) => {
    if (f.type === 'image') return
    form[f.key] = blankValue(f)
  })
  if (config.value.hasSlug) form.slug = ''
  imageFile.value = null
}

const columns = computed<Column[]>(() =>
  config.value.listColumns.map((c) => ({ key: c.key, label: t(c.label), image: c.image })),
)

const displayRows = computed(() =>
  rows.value.map((row) => {
    const out: Record<string, any> = { id: row.id }
    config.value.listColumns.forEach((c) => {
      if (c.image) {
        out[c.key] = row[c.key]?.thumb || row[c.key]?.url || null
      } else if (c.translatable) {
        out[c.key] = row[c.key]?.[localeStore.current] ?? row[c.key]?.en ?? ''
      } else {
        out[c.key] = row[c.key]
      }
    })
    return out
  }),
)

async function load() {
  loading.value = true
  try {
    const { data } = await api.get(`/admin/${config.value.apiPath}`, { params: { per_page: 100 } })
    rows.value = data.data ?? data
  } finally {
    loading.value = false
  }
}

watch(() => props.resource, load, { immediate: true })

function openCreate() {
  resetForm()
  editingId.value = null
  showForm.value = true
}

async function openEdit(row: any) {
  resetForm()
  editingId.value = row.id
  config.value.fields.forEach((f) => {
    if (f.type === 'image') return
    if (f.type === 'translatable-text' || f.type === 'translatable-textarea') {
      // A never-set nullable translatable column comes back as `[]`, not
      // `{en,ar}` (spatie/laravel-translatable's default for no data) —
      // normalize it so TranslatableInput always gets the shape it expects.
      form[f.key] = normalizeTranslatable(row[f.key])
    } else if (f.type === 'translatable-list') {
      const value = row[f.key]
      form[f.key] =
        value && typeof value === 'object' && !Array.isArray(value)
          ? { en: value.en ?? [], ar: value.ar ?? [] }
          : { en: [], ar: [] }
    } else {
      form[f.key] = row[f.key] ?? blankValue(f)
    }
  })
  if (config.value.hasSlug) form.slug = row.slug ?? ''
  showForm.value = true
}

function existingImageUrl(): string | null {
  if (!editingId.value || !config.value.mediaField) return null
  const row = rows.value.find((r) => r.id === editingId.value)
  const mediaFieldKey = config.value.fields.find((f) => f.type === 'image')?.key
  const media = row?.[mediaFieldKey ?? '']
  // Fall back to the original upload if a resized conversion is missing
  // (e.g. a conversion job that failed before a since-fixed bug) rather
  // than showing a broken image icon.
  return media?.card || media?.url || null
}

async function save() {
  saving.value = true
  try {
    const payload: Record<string, any> = { ...form }
    if (config.value.mediaField && imageFile.value) {
      payload[config.value.mediaField.formKey] = imageFile.value
    }

    if (editingId.value) {
      const body = toFormData(payload, 'PUT')
      await api.post(`/admin/${config.value.apiPath}/${editingId.value}`, body)
    } else {
      const body = toFormData(payload)
      await api.post(`/admin/${config.value.apiPath}`, body)
    }

    toast.success(t('common.saved'))
    showForm.value = false
    await load()
  } catch {
    toast.error('Something went wrong. Check the form and try again.')
  } finally {
    saving.value = false
  }
}

async function remove(row: any) {
  const ok = await confirmDialog(t('common.confirmDeleteTitle'), t('common.confirmDeleteBody'))
  if (!ok) return
  await api.delete(`/admin/${config.value.apiPath}/${row.id}`)
  toast.success(t('common.deleted'))
  await load()
}

async function move(row: any, direction: -1 | 1) {
  const index = rows.value.findIndex((r) => r.id === row.id)
  const swapWith = index + direction
  if (swapWith < 0 || swapWith >= rows.value.length) return
  const reordered = [...rows.value]
  ;[reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]]
  rows.value = reordered
  await api.post(`/admin/${config.value.apiPath}-reorder`, { ids: reordered.map((r) => r.id) })
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-navy-900">{{ t(config.titleKey) }}</h1>
      <button
        class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        @click="openCreate"
      >
        + {{ t('common.add') }}
      </button>
    </div>

    <DataTable :columns="columns" :rows="displayRows" :loading="loading">
      <template #row-actions="{ row }">
        <template v-if="config.hasOrder">
          <button class="rounded p-1.5 text-slate-400 hover:bg-slate-100" :title="t('common.moveUp')" @click="move(rows.find(r=>r.id===row.id), -1)">↑</button>
          <button class="rounded p-1.5 text-slate-400 hover:bg-slate-100" :title="t('common.moveDown')" @click="move(rows.find(r=>r.id===row.id), 1)">↓</button>
        </template>
        <button class="rounded px-2 py-1 text-sm text-brand-600 hover:bg-brand-50" @click="openEdit(rows.find(r=>r.id===row.id))">
          {{ t('common.edit') }}
        </button>
        <button class="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50" @click="remove(row)">
          {{ t('common.delete') }}
        </button>
      </template>
    </DataTable>

    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-40 flex items-stretch justify-end bg-slate-900/40">
        <div class="flex w-full max-w-xl flex-col overflow-y-auto bg-white p-4 shadow-2xl sm:p-6">
          <h2 class="mb-4 text-lg font-bold text-navy-900">
            {{ editingId ? t('common.edit') : t('common.add') }} — {{ t(config.titleKey) }}
          </h2>

          <div class="flex-1 space-y-5">
            <div v-for="field in config.fields" :key="field.key" :class="field.colSpan === 2 ? '' : ''">
              <template v-if="field.type === 'translatable-text'">
                <TranslatableInput v-model="form[field.key]" :label="field.label.startsWith('common.') ? t(field.label) : field.label" :required="field.required" />
              </template>
              <template v-else-if="field.type === 'translatable-textarea'">
                <TranslatableInput v-model="form[field.key]" :label="field.label.startsWith('common.') ? t(field.label) : field.label" textarea />
              </template>
              <template v-else-if="field.type === 'translatable-list'">
                <TranslatableList v-model="form[field.key]" :label="field.label" />
              </template>
              <template v-else-if="field.type === 'image'">
                <MediaUploader :label="t(field.label)" :existing-url="existingImageUrl()" @change="(f) => (imageFile = f)" />
              </template>
              <template v-else-if="field.type === 'checkbox'">
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input v-model="form[field.key]" type="checkbox" class="rounded border-slate-300" />
                  {{ field.label }}
                </label>
              </template>
              <template v-else>
                <label class="mb-1 block text-sm font-medium text-slate-700">
                  {{ field.label }} <span v-if="field.required" class="text-red-500">*</span>
                </label>
                <input
                  v-model="form[field.key]"
                  type="text"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </template>
            </div>

            <div v-if="config.hasSlug">
              <label class="mb-1 block text-sm font-medium text-slate-700">{{ t('common.slug') }}</label>
              <input
                v-model="form.slug"
                type="text"
                dir="ltr"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50" @click="showForm = false">
              {{ t('common.cancel') }}
            </button>
            <button
              :disabled="saving"
              class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
              @click="save"
            >
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
