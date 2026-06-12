<script setup lang="ts">
const route = useRoute();

// Computed to always reflect current route active state exactly, as requested for useRoute() usage
const sidebarLinks = computed(() => [
  {
    label: "Inicio",
    icon: "i-lucide-home",
    to: "/",
    active: route.path === "/",
  },
  {
    label: "Pedidos",
    icon: "i-lucide-package",
    to: "/orders",
    active: route.path.startsWith("/orders"),
    children: [
      { label: "Todos los pedidos", to: "/orders" },
      { label: "Pedidos abandonados", to: "/orders/abandoned" },
    ],
  },
  {
    label: "Productos",
    icon: "i-lucide-box",
    to: "/producto",
    active: route.path.startsWith("/producto"),
    children: [
      { label: "Catálogo", to: "/producto" },
      { label: "Colecciones", to: "/producto/collections" },
      { label: "Inventarios", to: "/producto/inventory" },
      { label: "Órdenes de compra", to: "/producto/purchase-orders" },
      { label: "Transferencias", to: "/producto/transfers" },
      { label: "Tarjetas regalo", to: "/producto/gift-cards" },
    ],
  },
  {
    label: "Clientes",
    icon: "i-lucide-users",
    to: "/customers",
    active: route.path.startsWith("/customers"),
  },
  {
    label: "Marketing",
    icon: "i-lucide-megaphone",
    to: "/marketing",
    active: route.path.startsWith("/marketing"),
  },
  {
    label: "Descuentos",
    icon: "i-lucide-tag",
    to: "/discounts",
    active: route.path.startsWith("/discounts"),
  },
  {
    label: "Contenido",
    icon: "i-lucide-file-text",
    to: "/content",
    active: route.path.startsWith("/content"),
  },
  {
    label: "Informes y estadísticas",
    icon: "i-lucide-bar-chart-2",
    to: "/reports",
    active: route.path.startsWith("/reports"),
  },
  {
    label: "Mercados",
    icon: "i-lucide-globe",
    to: "/markets",
    active: route.path.startsWith("/markets"),
  },
  {
    label: "Tienda online",
    icon: "i-lucide-store",
    to: "/store",
    active: route.path.startsWith("/store"),
  },
  {
    label: "Apps",
    icon: "i-lucide-puzzle",
    to: "/apps",
    active: route.path.startsWith("/apps"),
  },
  {
    label: "Configuración",
    icon: "i-lucide-settings",
    to: "/settings",
    active: route.path.startsWith("/settings"),
  },
].map(link => {
  const enhancedLink: any = { ...link };
  
  if (isMini.value) {
    enhancedLink.tooltip = {
      text: link.label,
      placement: "right"
    };
  }

  if (link.children) {
    enhancedLink.click = (e: any) => {
      if (isSidebarCollapsed.value) {
        if (e && e.preventDefault) e.preventDefault();
        isSidebarCollapsed.value = false;
      }
    }
  }
  return enhancedLink;
}));

const pageTitle = computed(() => {
  const currentLink = sidebarLinks.value.find((l) => l.active);
  return currentLink ? currentLink.label : "Dashboard";
});

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});

const searchGroups = computed(() => [
  {
    key: "links",
    label: "Navegación",
    commands: sidebarLinks.value.map((l) => ({
      id: l.label,
      label: l.label,
      icon: l.icon,
      to: l.to,
    })),
  },
]);

const isSidebarCollapsed = ref(false);

const isMini = computed(() => isSidebarCollapsed.value);
const sidebarWidth = computed(() => (isMini.value ? 80 : 240));
</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel
      :width="sidebarWidth"
      :style="{ width: sidebarWidth + 'px !important', minWidth: sidebarWidth + 'px !important', maxWidth: sidebarWidth + 'px !important' }"
      class="transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800"
    >
      <UDashboardSidebar>
        <template #header>
          <div :class="['logo-container py-3 min-h-[64px] overflow-hidden transition-all duration-300 flex', isMini ? 'flex-col items-center gap-4 px-2' : 'flex-row items-center justify-between gap-1 px-4']">
             <div class="flex items-center gap-3 overflow-hidden">
               <div class="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-200 dark:border-gray-800 transition-transform duration-300">
                 <span class="text-white dark:text-gray-900 font-bold text-lg leading-none">F</span>
               </div>
               <span v-if="!isMini" class="font-bold text-xl tracking-tight text-gray-900 dark:text-white truncate transition-opacity duration-300">Foodfy</span>
             </div>
             
             <UButton
              color="gray"
              variant="ghost"
              :icon="isSidebarCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
              size="sm"
              class="shrink-0 transition-all duration-200"
              @click="isSidebarCollapsed = !isSidebarCollapsed"
            />
          </div>
        </template>
        
        <UDashboardSidebarLinks 
          :links="sidebarLinks" 
          :class="['transition-all duration-300', { 'is-mini': isMini }]" 
        />
      </UDashboardSidebar>
    </UDashboardPanel>

    <UDashboardPage>
      <UDashboardPanel grow>
        <!-- Top navbar for current page context -->
        <UDashboardNavbar :title="pageTitle">
          <template #center>
            <div class="hidden md:flex w-96 mx-auto justify-start border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 rounded-md">
              <UDashboardSearchButton class="w-full justify-start border-0 bg-transparent" />
            </div>
          </template>
          <template #right>
            <div class="flex items-center gap-2">
              <ClientOnly>
                <UButton
                  :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
                  color="gray"
                  variant="ghost"
                  aria-label="Theme"
                  class="text-gray-900 dark:text-white rounded-xl h-9 w-9 flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                  @click="isDark = !isDark"
                />
                <template #fallback>
                  <UButton
                    icon="i-lucide-sun"
                    color="gray"
                    variant="ghost"
                    aria-label="Theme"
                    class="text-gray-900 dark:text-white rounded-xl h-9 w-9 flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                  />
                </template>
              </ClientOnly>
              <UTooltip text="Configuración IA">
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-lucide-bot"
                  aria-label="Configuración de IA"
                  to="/ai-config"
                  class="text-gray-900 dark:text-white rounded-xl h-9 w-9 flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                />
              </UTooltip>
              
              <HeaderNotifications />
              
              <HeaderProfile />
            </div>
          </template>
        </UDashboardNavbar>

        <!-- Main Content -->
        <div class="p-6 h-full overflow-y-auto w-full bg-gray-50 dark:bg-black/30 relative">
          <slot />
        </div>
      </UDashboardPanel>
    </UDashboardPage>

    <!-- Global Search Modal -->
    <UDashboardSearch :groups="searchGroups" />
  </UDashboardLayout>
</template>

<style scoped>
/* Transition width smoothly */
.transition-width {
  transition: width 0.3s ease-in-out;
}

/* Hide labels and chevrons when in mini mode */
.is-mini :deep(.text-sm.truncate.relative),
.is-mini :deep(.ml-auto.w-5.h-5.transform),
/* Ocultar contenedores de submenús por completo */
.is-mini :deep(ul > li > div),
.is-mini :deep(ul > li > ul),
.is-mini :deep(.border-l) {
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
  display: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}

/* Centrar iconos y ajustar padding en modo mini */
.is-mini :deep(a),
.is-mini :deep(button) {
  justify-content: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  width: 100% !important;
}

.is-mini :deep(.iconify) {
  margin-right: 0 !important;
}

</style>
