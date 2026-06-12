import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ name: string; email: string; provider: string } | null>(null)
  const onboardingComplete = ref(false)
  const selectedStoreId = ref<string | null>(null)

  const stores = ref([
    { id: 'loc-001', name: 'Restaurante Central', handle: 'central', color: '#14b891', active: true },
    { id: 'loc-002', name: 'Foodify Barrio', handle: 'barrio', color: '#3b82f6', active: true },
    { id: 'loc-003', name: 'Foodify Express', handle: 'express', color: '#f59e0b', active: false }
  ])

  const isLoggedIn = computed(() => !!user.value)

  // Load from localStorage on client side
  if (process.client) {
    const savedUser = localStorage.getItem('foodify_auth_user')
    const savedOnboarding = localStorage.getItem('foodify_onboarding_complete')
    const savedStore = localStorage.getItem('foodify_selected_store')

    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
    if (savedOnboarding) {
      onboardingComplete.value = savedOnboarding === 'true'
    }
    if (savedStore) {
      selectedStoreId.value = savedStore
    }
  }

  const register = (emailVal: string, provider: string) => {
    const name = emailVal ? emailVal.split('@')[0] : 'Usuario'
    user.value = { name, email: emailVal, provider }
    if (process.client) {
      localStorage.setItem('foodify_auth_user', JSON.stringify(user.value))
    }
  }

  const login = (emailVal: string, provider: string) => {
    const name = emailVal ? emailVal.split('@')[0] : 'Usuario'
    user.value = { name, email: emailVal, provider }
    // When logging in, we assume onboarding is complete
    onboardingComplete.value = true
    if (process.client) {
      localStorage.setItem('foodify_auth_user', JSON.stringify(user.value))
      localStorage.setItem('foodify_onboarding_complete', 'true')
    }
  }

  const completeOnboarding = () => {
    onboardingComplete.value = true
    if (process.client) {
      localStorage.setItem('foodify_onboarding_complete', 'true')
    }
  }

  const selectStore = (storeId: string) => {
    selectedStoreId.value = storeId
    if (process.client) {
      localStorage.setItem('foodify_selected_store', storeId)
    }
  }

  const logout = () => {
    user.value = null
    onboardingComplete.value = false
    selectedStoreId.value = null
    if (process.client) {
      localStorage.removeItem('foodify_auth_user')
      localStorage.removeItem('foodify_onboarding_complete')
      localStorage.removeItem('foodify_selected_store')
    }
  }

  return {
    user,
    onboardingComplete,
    selectedStoreId,
    stores,
    isLoggedIn,
    register,
    login,
    completeOnboarding,
    selectStore,
    logout
  }
})

