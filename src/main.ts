import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useLocaleStore } from '@/stores/locale'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(router)

// Restore the admin's last-used UI language before the first paint.
const savedLocale = localStorage.getItem('amarina_admin_locale')
if (savedLocale === 'ar') {
  useLocaleStore().set('ar')
}

app.mount('#app')
