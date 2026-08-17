<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { api, toFormData, normalizeTranslatable } from '@/api/client'
import { useToastStore } from '@/stores/toast'
import { useLocaleStore } from '@/stores/locale'
import { useLocaleLink } from '@/composables/useLocaleLink'
import TranslatableInput from '@/components/ui/TranslatableInput.vue'
import MediaUploader from '@/components/ui/MediaUploader.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const localeStore = useLocaleStore()
const { localeParams } = useLocaleLink()

const id = route.params.id ? Number(route.params.id) : null
const isEdit = !!id

const categories = ref<{ id: number; name: Record<string, string>; slug: string }[]>([])
const saving = ref(false)
const featuredImageFile = ref<File | null>(null)
const existingFeaturedImage = ref<string | null>(null)
const galleryFiles = ref<File[]>([])
const existingGallery = ref<{ id: number; url: string; thumb: string }[]>([])

const STATUSES = ['ready', 'under_construction', 'off_plan'] as const

const form = reactive({
  project_category_id: '' as number | '',
  title: { en: '', ar: '' },
  slug: '',
  location: { en: '', ar: '' },
  status: 'ready' as (typeof STATUSES)[number],
  bedrooms_min: '' as number | '',
  bedrooms_max: '' as number | '',
  price_from: '' as number | '',
  currency: 'EGP',
  description: { en: '', ar: '' },
  meta_title: { en: '', ar: '' },
  meta_description: { en: '', ar: '' },
  is_featured: false,
  order: 0,
  published_at: new Date().toISOString().slice(0, 10),
})

async function loadCategories() {
  const { data } = await api.get('/admin/project-categories', { params: { per_page: 100 } })
  categories.value = data.data
}

async function loadProject() {
  if (!id) return
  // Laravel wraps single-resource responses in {"data": {...}} just like
  // collections — same unwrap as loadCategories() above, one level deeper.
  const { data: body } = await api.get(`/admin/projects/${id}`)
  const data = body.data
  form.project_category_id = data.project_category_id ?? ''
  form.title = normalizeTranslatable(data.title)
  form.slug = data.slug
  form.location = normalizeTranslatable(data.location)
  form.status = data.status
  form.bedrooms_min = data.bedrooms_min ?? ''
  form.bedrooms_max = data.bedrooms_max ?? ''
  form.price_from = data.price_from ?? ''
  form.currency = data.currency ?? 'EGP'
  form.description = normalizeTranslatable(data.description)
  form.meta_title = normalizeTranslatable(data.meta_title)
  form.meta_description = normalizeTranslatable(data.meta_description)
  form.is_featured = data.is_featured
  form.order = data.order
  form.published_at = data.published_at ? data.published_at.slice(0, 10) : ''
  existingFeaturedImage.value = data.featured_image?.card ?? null
  existingGallery.value = data.gallery ?? []
}

onMounted(async () => {
  await loadCategories()
  await loadProject()
})

async function save() {
  saving.value = true
  try {
    const payload: Record<string, any> = { ...form }
    if (featuredImageFile.value) payload.featured_image = featuredImageFile.value
    if (galleryFiles.value.length) payload.gallery = galleryFiles.value

    if (isEdit) {
      await api.post(`/admin/projects/${id}`, toFormData(payload, 'PUT'))
    } else {
      const { data: body } = await api.post('/admin/projects', toFormData(payload))
      router.push({ name: 'projects-edit', params: localeParams({ id: body.data.id }) })
    }
    toast.success(t('common.saved'))
    galleryFiles.value = []
    await loadProject()
  } catch {
    toast.error('Something went wrong. Check the form and try again.')
  } finally {
    saving.value = false
  }
}

function onGalleryChange(e: Event) {
  galleryFiles.value = Array.from((e.target as HTMLInputElement).files ?? [])
}

async function removeGalleryImage(mediaId: number) {
  if (!id) return
  await api.delete(`/admin/projects/${id}/media/${mediaId}`)
  existingGallery.value = existingGallery.value.filter((m) => m.id !== mediaId)
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <h1 class="mb-6 text-xl font-bold text-navy-900">
      {{ isEdit ? t('common.edit') : t('common.add') }} — {{ t('nav.projects') }}
    </h1>

    <div class="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
      <TranslatableInput v-model="form.title" label="Title" required />

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">{{ t('common.slug') }}</label>
        <input v-model="form.slug" dir="ltr" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">{{ t('common.category') }}</label>
          <select v-model="form.project_category_id" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">{{ t('common.uncategorized') }}</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name[localeStore.current] ?? c.name.en }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">{{ t('common.status') }}</label>
          <select v-model="form.status" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option v-for="s in STATUSES" :key="s" :value="s">{{ s.replace('_', ' ') }}</option>
          </select>
        </div>
      </div>

      <TranslatableInput v-model="form.location" label="Location" />

      <div class="grid grid-cols-4 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Bedrooms Min</label>
          <input v-model.number="form.bedrooms_min" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Bedrooms Max</label>
          <input v-model.number="form.bedrooms_max" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Price From</label>
          <input v-model.number="form.price_from" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Currency</label>
          <input v-model="form.currency" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <TranslatableInput v-model="form.description" label="Description" textarea />

      <details class="rounded-lg border border-slate-200 p-3">
        <summary class="cursor-pointer text-sm font-semibold text-slate-700">SEO (meta title / description)</summary>
        <div class="mt-4 space-y-4">
          <TranslatableInput v-model="form.meta_title" label="Meta Title" />
          <TranslatableInput v-model="form.meta_description" label="Meta Description" textarea />
        </div>
      </details>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">{{ t('common.order') }}</label>
          <input v-model.number="form.order" type="number" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Published Date</label>
          <input v-model="form.published_at" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <label class="mt-6 flex items-center gap-2 text-sm text-slate-700">
          <input v-model="form.is_featured" type="checkbox" class="rounded border-slate-300" />
          {{ t('common.featured') }}
        </label>
      </div>

      <MediaUploader
        :label="'Featured Image'"
        :existing-url="existingFeaturedImage"
        @change="(f) => (featuredImageFile = f)"
      />

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">{{ t('common.gallery') }}</label>
        <div v-if="existingGallery.length" class="mb-3 flex flex-wrap gap-2">
          <div v-for="img in existingGallery" :key="img.id" class="group relative h-20 w-20">
            <img :src="img.thumb" class="h-full w-full rounded-lg object-cover" alt="" />
            <button
              type="button"
              class="absolute -top-1.5 -end-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white group-hover:flex"
              @click="removeGalleryImage(img.id)"
            >
              ✕
            </button>
          </div>
        </div>
        <input type="file" accept="image/*" multiple class="text-sm" @change="onGalleryChange" />
        <p class="mt-1 text-xs text-slate-400">{{ t('common.addImages') }}</p>
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <RouterLink :to="{ name: 'projects', params: localeParams() }" class="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
        {{ t('common.backToList') }}
      </RouterLink>
      <button
        :disabled="saving"
        class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        @click="save"
      >
        {{ t('common.save') }}
      </button>
    </div>
  </div>
</template>
