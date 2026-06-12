export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  const publicPaths = ['/login', '/register']

  if (publicPaths.includes(to.path)) {
    if (authStore.isLoggedIn && authStore.onboardingComplete && authStore.selectedStoreId) {
      return navigateTo('/')
    }
    return
  }

  if (!authStore.isLoggedIn) {
    return navigateTo('/login')
  }

  if (!authStore.onboardingComplete && to.path !== '/onboarding') {
    return navigateTo('/onboarding')
  }

  if (authStore.onboardingComplete && to.path !== '/stores' && !authStore.selectedStoreId) {
    return navigateTo('/stores')
  }
})
