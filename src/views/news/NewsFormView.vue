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
import RichTextEditor from '@/components/ui/RichTextEditor.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const localeStore = useLocaleStore()
const { localeParams } = useLocaleLink()

const id = route.params.id ? Number(route.params.id) : null
const isEdit = !!id

const categories = ref<{ id: number; name: Record<string, string> }[]>([])
const saving = ref(false)
const featuredImageFile = ref<File | null>(null)
const existingFeaturedImage = ref<string | null>(null)

const form = reactive({
  news_category_id: '' as number | '',
  title: { en: '', ar: '' },
  slug: '',
  excerpt: { en: '', ar: '' },
  body: { en: '', ar: '' },
  author: 'Amarina Team',
  read_time: '3 min read',
  is_featured: false,
  meta_title: { en: '', ar: '' },
  meta_description: { en: '', ar: '' },
  published_at: new Date().toISOString().slice(0, 10),
})

async function loadCategories() {
  const { data } = await api.get('/admin/news-categories', { params: { per_page: 100 } })
  categories.value = data.data
}

async function loadPost() {
  if (!id) return
  // Laravel wraps single-resource responses in {"data": {...}} just like
  // collections — same unwrap as loadCategories() above, one level deeper.
  const { data: body } = await api.get(`/admin/news-posts/${id}`)
  const data = body.data
  form.news_category_id = data.news_category_id ?? ''
  form.title = normalizeTranslatable(data.title)
  form.slug = data.slug
  form.excerpt = normalizeTranslatable(data.excerpt)
  form.body = normalizeTranslatable(data.body)
  form.author = data.author ?? ''
  form.read_time = data.read_time ?? ''
  form.is_featured = data.is_featured
  form.meta_title = normalizeTranslatable(data.meta_title)
  form.meta_description = normalizeTranslatable(data.meta_description)
  form.published_at = data.published_at ? data.published_at.slice(0, 10) : ''
  existingFeaturedImage.value = data.featured_image?.card || data.featured_image?.url || null
}

onMounted(async () => {
  await loadCategories()
  await loadPost()
})

async function save() {
  saving.value = true
  try {
    const payload: Record<string, any> = { ...form }
    if (featuredImageFile.value) payload.featured_image = featuredImageFile.value

    if (isEdit) {
      await api.post(`/admin/news-posts/${id}`, toFormData(payload, 'PUT'))
    } else {
      const { data: body } = await api.post('/admin/news-posts', toFormData(payload))
      router.push({ name: 'news-edit', params: localeParams({ id: body.data.id }) })
    }
    toast.success(t('common.saved'))
    await loadPost()
  } catch {
    toast.error('Something went wrong. Check the form and try again.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <h1 class="mb-6 text-xl font-bold text-navy-900">
      {{ isEdit ? t('common.edit') : t('common.add') }} — {{ t('nav.news') }}
    </h1>

    <div class="space-y-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <TranslatableInput v-model="form.title" label="Title" required />

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">{{ t('common.slug') }}</label>
        <input v-model="form.slug" dir="ltr" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">{{ t('common.category') }}</label>
          <select v-model="form.news_category_id" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">{{ t('common.uncategorized') }}</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name[localeStore.current] ?? c.name.en }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Published Date</label>
          <input v-model="form.published_at" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Author</label>
          <input v-model="form.author" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Read Time</label>
          <input v-model="form.read_time" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <TranslatableInput v-model="form.excerpt" label="Excerpt" textarea />

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Body (English)</label>
        <RichTextEditor v-model="form.body.en" dir="ltr" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Body (Arabic)</label>
        <RichTextEditor v-model="form.body.ar" dir="rtl" />
      </div>

      <details class="rounded-lg border border-slate-200 p-3">
        <summary class="cursor-pointer text-sm font-semibold text-slate-700">SEO (meta title / description)</summary>
        <div class="mt-4 space-y-4">
          <TranslatableInput v-model="form.meta_title" label="Meta Title" />
          <TranslatableInput v-model="form.meta_description" label="Meta Description" textarea />
        </div>
      </details>

      <label class="flex items-center gap-2 text-sm text-slate-700">
        <input v-model="form.is_featured" type="checkbox" class="rounded border-slate-300" />
        {{ t('common.featured') }}
      </label>

      <MediaUploader label="Featured Image" :existing-url="existingFeaturedImage" @change="(f) => (featuredImageFile = f)" />
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <RouterLink :to="{ name: 'news', params: localeParams() }" class="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
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
