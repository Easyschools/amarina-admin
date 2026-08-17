<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api/client'

const { t } = useI18n()

const stats = ref({
  projects_count: 0,
  news_posts_count: 0,
  contact_submissions_count: 0,
  unread_contact_submissions_count: 0,
  newsletter_subscribers_count: 0,
})

onMounted(async () => {
  const { data } = await api.get('/admin/dashboard')
  stats.value = data
})

const cards = [
  { key: 'projects_count', label: 'dashboard.projects' },
  { key: 'news_posts_count', label: 'dashboard.newsPosts' },
  { key: 'contact_submissions_count', label: 'dashboard.submissions' },
  { key: 'unread_contact_submissions_count', label: 'dashboard.unreadSubmissions' },
  { key: 'newsletter_subscribers_count', label: 'dashboard.subscribers' },
] as const
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-navy-900">{{ t('dashboard.title') }}</h1>
    <p class="mt-1 text-sm text-slate-500">{{ t('dashboard.welcome') }}</p>

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div v-for="card in cards" :key="card.key" class="rounded-xl border border-slate-200 bg-white p-5">
        <p class="text-2xl font-bold text-navy-900">{{ stats[card.key] }}</p>
        <p class="mt-1 text-sm text-slate-500">{{ t(card.label) }}</p>
      </div>
    </div>
  </div>
</template>
