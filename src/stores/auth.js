import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!user.value)
  const userType = computed(() => user.value?.type || null)

  function login(userData, authToken) {
    user.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function updateProfile(updates) {
    if (user.value) {
      user.value = { ...user.value, ...updates }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  // Initialize from localStorage
  const storedUser = localStorage.getItem('user')
  if (storedUser && token.value) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      logout()
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    userType,
    login,
    logout,
    updateProfile
  }
})
