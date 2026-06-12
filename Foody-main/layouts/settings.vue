<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'

const route = useRoute()
const router = useRouter()
const settings = useSettingsStore()
const sidebarStoreName = computed(() => settings.storeName || 'Mi tienda')
const sidebarStoreInitial = computed(() => (settings.storeName || 'M').charAt(0).toUpperCase())

const colorMode = useColorMode()
const isDark = computed({
  get() { return colorMode.value === 'dark' },
  set() { colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark' },
})

const sidebarSearch = ref('')

interface SettingsNavItem {
  label: string
  icon: string
  to: string
}

interface SettingsNavGroup {
  title: string
  items: SettingsNavItem[]
}

const navGroups: SettingsNavGroup[] = [
  {
    title: 'Tienda',
    items: [
      { label: 'General', icon: 'i-lucide-settings', to: '/settings/general' },
      { label: 'Plan', icon: 'i-lucide-crown', to: '/settings/plan' },
      { label: 'Facturación', icon: 'i-lucide-receipt', to: '/settings/billing' },
    ],
  },
  {
    title: 'Personal',
    items: [
      { label: 'Usuarios', icon: 'i-lucide-users', to: '/settings/users' },
    ],
  },
  {
    title: 'Pagos',
    items: [
      { label: 'Pagos', icon: 'i-lucide-credit-card', to: '/settings/payments' },
      { label: 'Pago (Checkout)', icon: 'i-lucide-shopping-cart', to: '/settings/checkout' },
      { label: 'Cuentas de cliente', icon: 'i-lucide-user-circle', to: '/settings/customer-accounts' },
    ],
  },
  {
    title: 'Envío',
    items: [
      { label: 'Envío y entrega', icon: 'i-lucide-truck', to: '/settings/shipping' },
      { label: 'Impuestos y aranceles', icon: 'i-lucide-landmark', to: '/settings/taxes' },
    ],
  },
  {
    title: 'Infraestructura',
    items: [
      { label: 'Sucursales', icon: 'i-lucide-map-pin', to: '/settings/locations' },
      { label: 'Apps', icon: 'i-lucide-puzzle', to: '/settings/apps' },
      { label: 'Canales de venta', icon: 'i-lucide-megaphone', to: '/settings/channels' },
      { label: 'Dominios', icon: 'i-lucide-globe', to: '/settings/domains' },
    ],
  },
  {
    title: 'Clientes',
    items: [
      { label: 'Eventos de cliente', icon: 'i-lucide-calendar', to: '/settings/customer-events' },
      { label: 'Notificaciones', icon: 'i-lucide-bell', to: '/settings/notifications' },
      { label: 'Privacidad del cliente', icon: 'i-lucide-shield', to: '/settings/privacy' },
    ],
  },
  {
    title: 'Datos',
    items: [
      { label: 'Metacampos y metaobjetos', icon: 'i-lucide-database', to: '/settings/metafields' },
      { label: 'Idiomas', icon: 'i-lucide-languages', to: '/settings/languages' },
      { label: 'Políticas', icon: 'i-lucide-file-text', to: '/settings/policies' },
    ],
  },
]

const isActive = (to: string) => {
  if (to === '/settings/general') {
    return route.path === '/settings/general' || route.path.startsWith('/settings/general/')
  }
  return route.path === to || route.path.startsWith(to + '/')
}

const filteredNavGroups = computed(() => {
  if (!sidebarSearch.value.trim()) return navGroups
  const q = sidebarSearch.value.toLowerCase().trim()
  return navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.label.toLowerCase().includes(q)),
    }))
    .filter(group => group.items.length > 0)
})

const closeSettings = () => {
  router.push('/')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-950">
    <!-- Top Header Bar -->
    <header class="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-200 dark:border-gray-800">
          <span class="text-white dark:text-gray-900 font-bold text-lg leading-none">{{ sidebarStoreInitial }}</span>
        </div>
        <div class="hidden sm:block">
          <p class="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight">{{ sidebarStoreName }}</p>
          <p class="text-[11px] text-gray-500 leading-tight">{{ sidebarStoreName.toLowerCase().replace(/\s+/g, '') }}.com</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <ClientOnly>
          <UButton
            :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
            color="gray"
            variant="ghost"
            aria-label="Theme"
            class="rounded-lg h-9 w-9"
            @click="isDark = !isDark"
          />
        </ClientOnly>
        <UButton
          icon="i-lucide-x"
          color="gray"
          variant="ghost"
          size="lg"
          class="rounded-lg h-9 w-9"
          aria-label="Cerrar configuración"
          @click="closeSettings"
        />
      </div>
    </header>

    <!-- Body: Sidebar + Content -->
    <div class="flex flex-1 min-h-0">
      <!-- Settings Sidebar -->
      <nav class="w-[260px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col hidden lg:flex">
        <!-- Search -->
        <div class="px-4 pt-4 pb-2">
          <UInput
            v-model="sidebarSearch"
            icon="i-lucide-search"
            placeholder="Buscar"
            size="sm"
            :ui="{ rounded: 'rounded-lg', icon: { trailing: { pointer: '' } } }"
          />
        </div>

        <!-- Nav Groups -->
        <div class="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div v-for="group in filteredNavGroups" :key="group.title" class="mb-4">
            <h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 mb-1">{{ group.title }}</h4>
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-colors"
              :class="isActive(item.to)
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'"
            >
              <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>

        <!-- Bottom: Cerrar -->
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <button
            @click="closeSettings"
            class="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
          >
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            Cerrar
          </button>
        </div>
      </nav>

      <!-- Mobile nav -->
      <div class="lg:hidden flex flex-col w-full min-h-0">
        <div class="border-b border-gray-200 dark:border-gray-800 px-2 py-2 overflow-x-auto flex gap-1 flex-shrink-0">
          <template v-for="group in navGroups" :key="group.title">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
              :class="isActive(item.to)
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'"
            >
              <UIcon :name="item.icon" class="w-3.5 h-3.5" />
              {{ item.label }}
            </NuxtLink>
          </template>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <slot />
        </div>
      </div>

      <!-- Content Area (desktop) -->
      <div class="flex-1 overflow-y-auto p-8 hidden lg:block">
        <slot />
      </div>
    </div>
  </div>
</template>
