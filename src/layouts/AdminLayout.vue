<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import { useLocaleLink } from '@/composables/useLocaleLink'

const { t } = useI18n()
const route = useRoute()
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

// Sidebar is a slide-in drawer below the md breakpoint (see the <aside>
// classes below) — this is what makes every section actually reachable on
// a phone, instead of the nav being permanently hidden with no way to
// open it.
const mobileNavOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileNavOpen.value = false
  },
)

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
    <!-- Backdrop, mobile only, closes the drawer on tap -->
    <div
      v-if="mobileNavOpen"
      class="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
      @click="mobileNavOpen = false"
    />

    <aside
      class="fixed inset-y-0 start-0 z-40 flex w-72 shrink-0 flex-col border-e border-slate-200 bg-white transition-transform duration-200 md:static md:z-auto md:w-64 md:translate-x-0"
      :class="mobileNavOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'"
    >
      <div class="flex h-16 items-center justify-between border-b border-slate-200 px-5">
        <span class="text-lg font-bold text-navy-900">{{ t('app.name') }}</span>
        <button
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 md:hidden"
          :aria-label="t('common.cancel')"
          @click="mobileNavOpen = false"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div v-for="section in navSections" :key="section.titleKey">
          <p class="px-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">{{ t(section.titleKey) }}</p>
          <div class="mt-1 space-y-0.5">
            <RouterLink
              v-for="item in section.items"
              :key="item.name"
              :to="routeParamsFor(item.name)"
              class="block rounded-lg px-2.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-600 md:py-2"
              active-class="bg-brand-50! text-brand-600!"
            >
              {{ t(item.labelKey) }}
            </RouterLink>
          </div>
        </div>
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:px-5">
        <div class="flex min-w-0 items-center gap-2">
          <button
            class="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            :aria-label="t('nav.menu')"
            @click="mobileNavOpen = true"
          >
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span class="truncate text-sm text-slate-500">{{ auth.user?.email }}</span>
        </div>
        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 sm:px-3 sm:text-sm"
            @click="switchLocale"
          >
            {{ otherLocale === 'ar' ? 'العربية' : 'English' }}
          </button>
          <button
            class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 sm:px-3 sm:text-sm"
            @click="logout"
          >
            {{ t('nav.logout') }}
          </button>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
