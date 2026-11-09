import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'
import { getToken, clearToken } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken())
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))
  const role = computed(() => user.value?.role ?? null)
  const communityIds = computed(() => user.value?.community_ids ?? [])
  const acolyteId = computed(() => user.value?.acolyte_id ?? null)
  const fullName = computed(() => user.value?.full_name ?? '')
  const mustChangePassword = computed(() => Boolean(user.value?.must_change_password))

  async function login(username, password) {
    loading.value = true
    error.value = null
    try {
      await authApi.login(username, password)
      token.value = getToken()
      await fetchMe()
    } catch (err) {
      error.value = err.response?.data?.detail || 'Falha no login'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!getToken()) {
      user.value = null
      token.value = null
      return null
    }
    loading.value = true
    try {
      user.value = await authApi.fetchMe()
      token.value = getToken()
      return user.value
    } catch (err) {
      logout()
      throw err
    } finally {
      loading.value = false
    }
  }

  async function completePasswordChange(newPassword, confirmPassword) {
    const updated = await authApi.resetProvisionalPassword(newPassword, confirmPassword)
    user.value = { ...user.value, ...updated, must_change_password: false }
    return user.value
  }

  function logout() {
    authApi.logout()
    clearToken()
    token.value = null
    user.value = null
  }

  function hasRole(...roles) {
    return roles.includes(role.value)
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    role,
    communityIds,
    acolyteId,
    fullName,
    mustChangePassword,
    login,
    fetchMe,
    completePasswordChange,
    logout,
    hasRole,
  }
})
