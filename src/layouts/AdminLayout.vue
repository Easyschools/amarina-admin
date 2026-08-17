<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import { useLocaleLink } from '@/composables/useLocaleLink'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const localeStore = useLocaleStore()
const { localeParams, otherLocale } = useLocaleLink()

const navSections: { titleKey: string; items: { name: string; labelKey: string }[] }[] = [
  { titleKey: 'nav.dashboard', items: [{ name: 'dashboard', labelKey: 'nav.dashboard' }] },
  {
    titleKey: 'nav.content',
    items: [
      { name: 'settings', labelKey: 'nav.settings' },
      { name: 'labels', labelKey: 'nav.labels' },
      { name: 'projects', labelKey: 'nav.projects' },
      { name: 'project-categories', labelKey: 'nav.projectCategories' },
      { name: 'services', labelKey: 'nav.services' },
      { name: 'news', labelKey: 'nav.news' },
      { name: 'news-categories', labelKey: 'nav.newsCategories' },
      { name: 'team', labelKey: 'nav.team' },
      { name: 'milestones', labelKey: 'nav.milestones' },
      { name: 'awards', labelKey: 'nav.awards' },
      { name: 'core-values', labelKey: 'nav.coreValues' },
      { name: 'sales-offices', labelKey: 'nav.salesOffices' },
    ],
  },
  {
    titleKey: 'nav.leads',
    items: [
      { name: 'contact-submissions', labelKey: 'nav.contactSubmissions' },
      { name: 'newsletter-subscribers', labelKey: 'nav.newsletter' },
    ],
  },
]

function routeParamsFor(name: string) {
  if (['project-categories', 'news-categories', 'services', 'team', 'milestones', 'awards', 'core-values', 'sales-offices'].includes(name)) {
    return { name: 'simple-resource', params: localeParams({ resource: name }) }
  }
  return { name, params: localeParams() }
}

async function logout() {
  await auth.logout()
  router.push({ name: 'login', params: localeParams() })
}

function switchLocale() {
  const target = otherLocale.value
  const current = router.currentRoute.value
  router.push({
    name: current.name ?? undefined,
    params: { ...current.params, locale: target === 'ar' ? 'ar' : undefined },
    query: current.query,
  })
}
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="hidden w-64 shrink-0 flex-col border-e border-slate-200 bg-white md:flex">
      <div class="flex h-16 items-center border-b border-slate-200 px-5">
        <span class="text-lg font-bold text-navy-900">{{ t('app.name') }}</span>
      </div>
      <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div v-for="section in navSections" :key="section.titleKey">
          <p class="px-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">{{ t(section.titleKey) }}</p>
          <div class="mt-1 space-y-0.5">
            <RouterLink
              v-for="item in section.items"
              :key="item.name"
              :to="routeParamsFor(item.name)"
              class="block rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-600"
              active-class="bg-brand-50! text-brand-600!"
            >
              {{ t(item.labelKey) }}
            </RouterLink>
          </div>
        </div>
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
        <span class="text-sm text-slate-500">{{ auth.user?.email }}</span>
        <div class="flex items-center gap-3">
          <button
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            @click="switchLocale"
          >
            {{ otherLocale === 'ar' ? 'العربية' : 'English' }}
          </button>
          <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50" @click="logout">
            {{ t('nav.logout') }}
          </button>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto bg-slate-50 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
