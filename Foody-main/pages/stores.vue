<script setup lang="ts">
import { useAuthStore } from '~/stores/useAuthStore'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

if (!authStore.isLoggedIn) {
  await navigateTo('/login')
}

const handleSelectStore = async (storeId: string, active: boolean) => {
  if (!active) {
    toast.add({
      title: 'Tienda inactiva',
      description: 'Esta tienda no está disponible actualmente.',
      color: 'yellow',
    })
    return
  }
  authStore.selectStore(storeId)
  await router.push('/')
}

const handleCreateStore = () => {
  toast.add({
    title: 'Próximamente',
    description: 'La creación de nuevas tiendas estará disponible pronto.',
    color: 'blue',
  })
}

/* ── Avatar initials from store name ── */
const initials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

/* ── Text color contrast: pick white or black based on bg ── */
const contrastColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#000000' : '#ffffff'
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-8 py-14">

    <!-- Header -->
    <div class="text-center">
      <h1 class="text-white text-3xl font-bold mb-1">
        Te damos la bienvenida de nuevo, {{ authStore.user?.name }}
      </h1>
      <p class="text-gray-400 text-sm">Elige una tienda o crea una nueva</p>
    </div>

    <!-- Card -->
    <div class="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden">

      <!-- Crear nueva tienda -->
      <button
        class="w-full flex items-center gap-4 px-6 py-5 hover:bg-gray-50 transition-colors group"
        @click="handleCreateStore"
      >
        <div class="w-10 h-10 rounded-full border-2 border-gray-300 group-hover:border-gray-400 flex items-center justify-center flex-shrink-0 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-gray-500">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <div class="text-left">
          <p class="text-sm font-semibold text-gray-900">Crear una tienda nueva</p>
          <p class="text-xs text-gray-500">Empieza gratis</p>
        </div>
      </button>

      <!-- Divider -->
      <div class="h-px bg-gray-100 mx-0" />

      <!-- Tiendas recientes -->
      <div class="px-6 py-3 flex items-center justify-between">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiendas recientes</p>
        <button class="text-xs text-gray-400 hover:text-gray-600 transition-colors">Ver todas</button>
      </div>

      <!-- Store list -->
      <div class="divide-y divide-gray-100">
        <button
          v-for="store in authStore.stores"
          :key="store.id"
          class="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
          @click="handleSelectStore(store.id, store.active)"
        >
          <!-- Avatar -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
            :style="{ backgroundColor: store.color, color: contrastColor(store.color) }"
          >
            {{ initials(store.name) }}
          </div>

          <!-- Info -->
          <div class="flex-1 text-left min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ store.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ store.handle }}.foodify.com</p>
          </div>

          <!-- Badge + chevron -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <span
              v-if="!store.active"
              class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium"
            >
              Inactiva
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </button>
      </div>

    </div>

    <!-- Footer -->
    <p class="text-gray-600 text-xs text-center">
      ¿No eres {{ authStore.user?.name }}?
      <button class="underline hover:text-gray-400 transition-colors" @click="authStore.logout(); $router.push('/login')">
        Cerrar sesión
      </button>
    </p>

  </div>
</template>
