<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const route = useRoute()

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
</script>

<template>
  <div class="flex gap-0 h-full min-h-0">
    <!-- Settings Sidebar -->
    <nav class="w-[240px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 overflow-y-auto pr-4 py-1 hidden lg:block">
      <div v-for="group in navGroups" :key="group.title" class="mb-5">
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 mb-1">{{ group.title }}</h4>
        <NuxtLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-colors"
          :class="isActive(item.to)
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'"
        >
          <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </div>
    </nav>

    <!-- Mobile nav -->
    <div class="lg:hidden w-full">
      <div class="border-b border-gray-200 dark:border-gray-800 px-2 py-2 overflow-x-auto flex gap-1">
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
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto pl-0 lg:pl-6">
      <NuxtPage />
    </div>
  </div>
</template>
