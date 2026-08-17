import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'

interface AdminUser {
  id: number
  name: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('amarina_admin_token'))
  const user = ref<AdminUser | null>(JSON.parse(localStorage.getItem('amarina_admin_user') ?? 'null'))

  function setSession(newToken: string, newUser: AdminUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('amarina_admin_token', newToken)
    localStorage.setItem('amarina_admin_user', JSON.stringify(newUser))
  }

  function clear() {
    token.value = null
    user.value = null
    localStorage.removeItem('amarina_admin_token')
    localStorage.removeItem('amarina_admin_user')
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/admin/auth/login', { email, password })
    setSession(data.token, data.user)
  }

  async function logout() {
    try {
      await api.post('/admin/auth/logout')
    } finally {
      clear()
    }
  }

  return { token, user, login, logout, clear, isAuthenticated: () => !!token.value }
})
