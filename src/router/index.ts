import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const RESOURCE_NAMES =
  'project-categories|news-categories|services|team|milestones|awards|core-values|sales-offices'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      // Optional leading /ar segment — every admin route exists at both
      // '/…' (English) and '/ar/…' (Arabic), mirroring the public site.
      path: '/:locale(ar)?',
      children: [
        {
          // A distinct literal segment, not another empty path — Vue Router
          // tries siblings in order and stops at the first match, so this
          // can't share `path: ''` with the AdminLayout branch below or
          // '/' would always match this one first (with no 'login' child
          // to render at that point) and never reach AdminLayout's own
          // empty-path redirect to the dashboard.
          path: 'login',
          component: AuthLayout,
          children: [{ path: '', name: 'login', component: () => import('@/views/auth/LoginView.vue') }],
        },
        {
          path: '',
          component: AdminLayout,
          meta: { requiresAuth: true },
          children: [
            { path: '', redirect: { name: 'dashboard' } },
            { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
            { path: 'settings', name: 'settings', component: () => import('@/views/settings/SiteSettingsView.vue') },
            { path: 'labels', name: 'labels', component: () => import('@/views/settings/UiStringsView.vue') },

            { path: 'projects', name: 'projects', component: () => import('@/views/projects/ProjectListView.vue') },
            {
              path: 'projects/create',
              name: 'projects-create',
              component: () => import('@/views/projects/ProjectFormView.vue'),
            },
            {
              path: 'projects/:id/edit',
              name: 'projects-edit',
              component: () => import('@/views/projects/ProjectFormView.vue'),
              props: true,
            },

            { path: 'news', name: 'news', component: () => import('@/views/news/NewsListView.vue') },
            { path: 'news/create', name: 'news-create', component: () => import('@/views/news/NewsFormView.vue') },
            {
              path: 'news/:id/edit',
              name: 'news-edit',
              component: () => import('@/views/news/NewsFormView.vue'),
              props: true,
            },

            {
              path: `:resource(${RESOURCE_NAMES})`,
              name: 'simple-resource',
              component: () => import('@/views/simple/SimpleResourceView.vue'),
              props: true,
            },

            {
              path: 'contact-submissions',
              name: 'contact-submissions',
              component: () => import('@/views/ContactSubmissionsView.vue'),
            },
            {
              path: 'newsletter-subscribers',
              name: 'newsletter-subscribers',
              component: () => import('@/views/NewsletterSubscribersView.vue'),
            },
          ],
        },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
})

router.beforeEach((to) => {
  const localeStore = useLocaleStore()
  const locale = to.params.locale === 'ar' ? 'ar' : 'en'
  if (localeStore.current !== locale) localeStore.set(locale)

  const auth = useAuthStore()
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

  if (requiresAuth && !auth.isAuthenticated()) {
    return { name: 'login', params: { locale: to.params.locale } }
  }

  if (to.name === 'login' && auth.isAuthenticated()) {
    return { name: 'dashboard', params: { locale: to.params.locale } }
  }

  return true
})

export default router
