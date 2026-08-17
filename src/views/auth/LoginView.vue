<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocaleLink } from '@/composables/useLocaleLink'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const { localeParams } = useLocaleLink()

const email = ref('admin@amarina.test')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push({ name: 'dashboard', params: localeParams() })
  } catch {
    error.value = t('auth.invalid')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl bg-white p-8 shadow-xl">
    <h1 class="mb-6 text-center text-xl font-bold text-navy-900">{{ t('auth.signIn') }}</h1>
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">{{ t('auth.email') }}</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">{{ t('auth.password') }}</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {{ t('auth.submit') }}
      </button>
    </form>
  </div>
</template>
