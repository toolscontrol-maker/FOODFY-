<script setup lang="ts">
import { useOnlineStoreStore } from '~/stores/useOnlineStoreStore'
import { THEME_LIBRARY } from '~/data/themeLibrary'

const store = useOnlineStoreStore()
const toast = useToast()
const router = useRouter()

/* ── Library installation ── */
const installedIds = computed(() => new Set(store.themes.map(t => t.id)))
const isInstalledInDB = (id: string) => installedIds.value.has(id)

const handleInstall = async (libraryTheme: typeof THEME_LIBRARY[0]) => {
  const result = await store.installLibraryTheme(libraryTheme)
  if (result) {
    toast.add({ title: `Tema "${result.name}" instalado`, description: 'Ya puedes personalizarlo desde la biblioteca.', color: 'green' })
  } else if (store.installError) {
    toast.add({ title: 'Error al instalar', description: store.installError, color: 'red' })
  }
}

// Fetch themes from backend on mount
onMounted(() => {
  if (!store.themes.length) store.fetchThemes()
})

/* ── Performance ── */
const rangeOptions = [
  { label: 'Hoy', value: 'today' as const },
  { label: 'Últimos 7 días', value: '7d' as const },
  { label: 'Últimos 30 días', value: '30d' as const },
]
const selectedRange = ref(store.performanceRange)
watch(selectedRange, (v) => store.loadPerformance(v))

const getLcpColor = (v: number | null) => {
  if (v === null) return 'gray'
  return v <= 2500 ? 'green' : v <= 4000 ? 'amber' : 'red'
}
const getInpColor = (v: number | null) => {
  if (v === null) return 'gray'
  return v <= 200 ? 'green' : v <= 500 ? 'amber' : 'red'
}
const getClsColor = (v: number | null) => {
  if (v === null) return 'gray'
  return v <= 0.1 ? 'green' : v <= 0.25 ? 'amber' : 'red'
}

/* ── Import dropdown ── */
const importItems = [
  [
    { label: 'Subir archivo ZIP', icon: 'i-lucide-upload', click: () => toast.add({ title: 'Subir ZIP', description: 'Funcionalidad disponible próximamente.', color: 'blue' }) },
    { label: 'Importar desde URL', icon: 'i-lucide-link', click: () => toast.add({ title: 'Importar URL', description: 'Funcionalidad disponible próximamente.', color: 'blue' }) },
    { label: 'Conectar repositorio', icon: 'i-lucide-git-branch', click: () => toast.add({ title: 'Conectar repo', description: 'Funcionalidad disponible próximamente.', color: 'blue' }) },
  ],
]

/* ── Theme actions ── */
const showRenameModal = ref(false)
const showDeleteModal = ref(false)
const actionThemeId = ref<string | null>(null)
const renameValue = ref('')

const openRename = (id: string, currentName: string) => {
  actionThemeId.value = id
  renameValue.value = currentName
  showRenameModal.value = true
}

const confirmRename = () => {
  if (actionThemeId.value && renameValue.value.trim()) {
    store.renameTheme(actionThemeId.value, renameValue.value.trim())
    toast.add({ title: 'Tema renombrado', color: 'green' })
  }
  showRenameModal.value = false
}

const openDelete = (id: string) => {
  actionThemeId.value = id
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (actionThemeId.value) {
    store.deleteTheme(actionThemeId.value)
    toast.add({ title: 'Tema eliminado', color: 'red' })
  }
  showDeleteModal.value = false
}

const handleDuplicate = (id: string) => {
  store.duplicateTheme(id)
  toast.add({ title: 'Tema duplicado', color: 'green' })
}

const handlePublish = (id: string) => {
  store.publishTheme(id)
  toast.add({ title: 'Tema publicado', description: 'El tema es ahora el tema activo de tu tienda.', color: 'green' })
}

const getThemeActions = (theme: any) => {
  const items: any[][] = [[]]
  items[0].push({ label: 'Renombrar', icon: 'i-lucide-pencil', click: () => openRename(theme.id, theme.name) })
  items[0].push({ label: 'Duplicar', icon: 'i-lucide-copy', click: () => handleDuplicate(theme.id) })
  items[0].push({ label: 'Descargar', icon: 'i-lucide-download', click: () => toast.add({ title: 'Descargando tema...', color: 'blue' }) })
  if (theme.role !== 'main') {
    items.push([
      { label: 'Publicar', icon: 'i-lucide-globe', click: () => handlePublish(theme.id) },
    ])
  }
  items.push([
    { label: 'Editar código', icon: 'i-lucide-code', disabled: true, click: () => {} },
  ])
  if (theme.role !== 'main') {
    items.push([
      { label: 'Eliminar', icon: 'i-lucide-trash', class: 'text-red-500', click: () => openDelete(theme.id) },
    ])
  }
  return items
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-5xl space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <p class="text-xs font-medium text-gray-500 mb-0.5">Tienda online</p>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Temas</h2>
      </div>
      <div class="flex items-center gap-2">
        <UButton color="white" variant="solid" size="sm" class="font-medium border border-gray-300 dark:border-gray-700" icon="i-lucide-external-link" @click="toast.add({ title: 'Vista previa de la tienda', description: 'Se abrirá en una nueva pestaña.', color: 'blue' })">
          Ver tu tienda
        </UButton>
        <UDropdown :items="importItems" :popper="{ placement: 'bottom-end' }">
          <UButton color="black" size="sm" class="font-semibold" trailing-icon="i-lucide-chevron-down">
            Importar tema
          </UButton>
        </UDropdown>
      </div>
    </div>

    <!-- Performance Card -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-activity" class="w-4 h-4 text-gray-500" />
            <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Rendimiento de la tienda online</h3>
          </div>
          <USelectMenu v-model="selectedRange" :options="rangeOptions" value-attribute="value" size="xs" class="w-40" />
        </div>
      </template>

      <!-- Loading skeleton -->
      <div v-if="store.performanceLoading" class="grid grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="space-y-2">
          <div class="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div class="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div class="h-2 w-20 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
        </div>
      </div>

      <!-- Data -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <p class="text-[12px] font-medium text-gray-500 mb-1">LCP P75</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ store.performanceMetrics.lcp ?? '—' }}</span>
            <span class="text-[12px] text-gray-500">ms</span>
          </div>
          <UBadge v-if="store.performanceMetrics.lcp !== null" :color="getLcpColor(store.performanceMetrics.lcp)" variant="soft" size="xs" class="mt-1">
            {{ store.performanceMetrics.lcp! <= 2500 ? 'Bueno' : store.performanceMetrics.lcp! <= 4000 ? 'Mejorable' : 'Deficiente' }}
          </UBadge>
        </div>
        <div>
          <p class="text-[12px] font-medium text-gray-500 mb-1">INP P75</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ store.performanceMetrics.inp ?? '—' }}</span>
            <span class="text-[12px] text-gray-500">ms</span>
          </div>
          <UBadge v-if="store.performanceMetrics.inp !== null" :color="getInpColor(store.performanceMetrics.inp)" variant="soft" size="xs" class="mt-1">
            {{ store.performanceMetrics.inp! <= 200 ? 'Bueno' : store.performanceMetrics.inp! <= 500 ? 'Mejorable' : 'Deficiente' }}
          </UBadge>
        </div>
        <div>
          <p class="text-[12px] font-medium text-gray-500 mb-1">CLS</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ store.performanceMetrics.cls ?? '—' }}</span>
          </div>
          <UBadge v-if="store.performanceMetrics.cls !== null" :color="getClsColor(store.performanceMetrics.cls)" variant="soft" size="xs" class="mt-1">
            {{ store.performanceMetrics.cls! <= 0.1 ? 'Bueno' : store.performanceMetrics.cls! <= 0.25 ? 'Mejorable' : 'Deficiente' }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- Current Theme Card -->
    <UCard v-if="store.currentTheme" :ui="{ body: { padding: 'p-0' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <div class="flex items-center gap-2">
          <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Tema actual</h3>
          <UBadge color="green" variant="soft" size="xs" class="font-semibold">Publicado</UBadge>
        </div>
      </template>

      <div class="flex flex-col sm:flex-row">
        <!-- Preview -->
        <div class="sm:w-[320px] flex-shrink-0 border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center p-6">
          <div class="w-full aspect-[4/3] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-hidden shadow-sm">
            <!-- Mini preview -->
            <div class="h-8 bg-gray-100 dark:bg-gray-800 flex items-center px-3 gap-1.5">
              <div class="w-2 h-2 rounded-full bg-red-400" />
              <div class="w-2 h-2 rounded-full bg-amber-400" />
              <div class="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div class="flex-1 p-3 space-y-2">
              <div class="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div class="h-12 bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 rounded" />
              <div class="grid grid-cols-3 gap-1">
                <div class="h-6 bg-gray-100 dark:bg-gray-800 rounded" />
                <div class="h-6 bg-gray-100 dark:bg-gray-800 rounded" />
                <div class="h-6 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
              <div class="h-2 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>

        <!-- Details -->
        <div class="flex-1 p-5 flex flex-col justify-between min-h-[180px]">
          <div>
            <div class="flex items-start justify-between">
              <div>
                <h4 class="text-[15px] font-semibold text-gray-900 dark:text-white">{{ store.currentTheme.name }}</h4>
                <p class="text-[12px] text-gray-500 mt-0.5">Versión {{ store.currentTheme.version }}</p>
              </div>
              <UDropdown :items="getThemeActions(store.currentTheme)" :popper="{ placement: 'bottom-end' }">
                <UButton icon="i-lucide-more-horizontal" color="gray" variant="ghost" size="xs" />
              </UDropdown>
            </div>
            <p class="text-[12px] text-gray-500 mt-3">
              <UIcon name="i-lucide-clock" class="w-3 h-3 inline-block mr-1 -mt-0.5" />
              Último guardado {{ formatDate(store.currentTheme.lastSaved) }}
            </p>
          </div>
          <div class="flex items-center gap-2 mt-4">
            <UButton color="black" size="sm" class="font-semibold" icon="i-lucide-paintbrush" @click="router.push(`/online-store/themes/${store.currentTheme!.id}/editor`)">
              Personalizar
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <!-- System Theme Library (Meridional + Drop) -->
    <div>
      <div class="mb-4">
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Plantillas del sistema</h3>
        <p class="text-[12px] text-gray-500 mt-0.5">Templates listos para instalar. Puedes personalizarlos al completo después de instalar.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UCard
          v-for="libTheme in THEME_LIBRARY"
          :key="libTheme.id"
          :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }"
        >
          <!-- Preview tile -->
          <div
            class="w-full aspect-[16/7] rounded-lg mb-4 flex items-center justify-center overflow-hidden relative"
            :style="{ backgroundColor: libTheme.globalSettings.colors.schemes[0].background }"
          >
            <!-- Simulated page skeleton -->
            <div class="w-full h-full flex flex-col gap-1 p-3">
              <div class="h-3 rounded-sm w-1/3" :style="{ backgroundColor: libTheme.globalSettings.colors.schemes[0].text + '20' }" />
              <div class="flex-1 rounded-sm" :style="{ backgroundColor: libTheme.globalSettings.colors.schemes[0].primary + '30' }" />
              <div class="flex gap-1">
                <div class="h-4 flex-1 rounded-sm" :style="{ backgroundColor: libTheme.globalSettings.colors.schemes[0].text + '10' }" />
                <div class="h-4 flex-1 rounded-sm" :style="{ backgroundColor: libTheme.globalSettings.colors.schemes[0].text + '10' }" />
                <div class="h-4 flex-1 rounded-sm" :style="{ backgroundColor: libTheme.globalSettings.colors.schemes[0].text + '10' }" />
              </div>
            </div>
            <!-- Installed badge -->
            <div v-if="isInstalledInDB(libTheme.id)" class="absolute top-2 right-2">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500 text-white">
                <UIcon name="i-lucide-check" class="w-3 h-3" />
                Instalado
              </span>
            </div>
          </div>

          <!-- Info -->
          <h4 class="text-[14px] font-bold text-gray-900 dark:text-white">{{ libTheme.name }}</h4>
          <p class="text-[12px] text-gray-500 mt-1 leading-relaxed line-clamp-2">{{ libTheme.description }}</p>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="tag in libTheme.tags.slice(0, 3)"
              :key="tag"
              class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 mt-4">
            <UButton
              v-if="!isInstalledInDB(libTheme.id)"
              color="black"
              size="sm"
              class="font-semibold"
              icon="i-lucide-download"
              :loading="store.installingThemeId === libTheme.id"
              @click="handleInstall(libTheme)"
            >
              Instalar tema
            </UButton>
            <UButton
              v-else
              color="gray"
              variant="soft"
              size="sm"
              class="font-medium"
              icon="i-lucide-paintbrush"
              @click="router.push(`/online-store/themes/${libTheme.id}/editor`)"
            >
              Personalizar
            </UButton>
            <UButton
              v-if="isInstalledInDB(libTheme.id)"
              color="white"
              variant="solid"
              size="sm"
              class="font-medium border border-gray-200 dark:border-gray-700"
              @click="handlePublish(libTheme.id)"
            >
              Publicar
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Theme Library (user-installed) -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Biblioteca de temas</h3>
        <UDropdown :items="importItems" :popper="{ placement: 'bottom-end' }">
          <UButton color="gray" variant="soft" size="xs" class="font-medium" icon="i-lucide-plus">Añadir tema</UButton>
        </UDropdown>
      </div>

      <div v-if="store.libraryThemes.length === 0" class="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
        <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-3">
          <UIcon name="i-lucide-palette" class="w-6 h-6 text-gray-400" />
        </div>
        <p class="text-[13px] text-gray-500">No tienes temas en tu biblioteca.</p>
        <p class="text-[12px] text-gray-400 mt-1">Importa o añade un tema para empezar.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UCard v-for="theme in store.libraryThemes" :key="theme.id" :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
          <div class="flex items-start gap-4">
            <!-- Mini preview -->
            <div class="w-20 h-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <div class="w-full h-full p-1.5 space-y-1">
                <div class="h-1 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
                <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                <div class="flex gap-0.5">
                  <div class="h-2 flex-1 bg-gray-100 dark:bg-gray-800 rounded" />
                  <div class="h-2 flex-1 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{{ theme.name }}</h4>
                  <p class="text-[11px] text-gray-500">v{{ theme.version }} · {{ formatDate(theme.lastSaved) }}</p>
                </div>
                <UDropdown :items="getThemeActions(theme)" :popper="{ placement: 'bottom-end' }">
                  <UButton icon="i-lucide-more-horizontal" color="gray" variant="ghost" size="xs" />
                </UDropdown>
              </div>
              <div class="flex gap-2 mt-2">
                <UButton color="gray" variant="soft" size="xs" class="font-medium" @click="router.push(`/online-store/themes/${theme.id}/editor`)">Personalizar</UButton>
                <UButton color="white" variant="solid" size="xs" class="font-medium border border-gray-200 dark:border-gray-700" @click="handlePublish(theme.id)">Publicar</UButton>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Rename Modal -->
    <UModal v-model="showRenameModal" :ui="{ width: 'sm:max-w-sm' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Renombrar tema</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="showRenameModal = false" />
          </div>
        </template>
        <UFormGroup label="Nombre del tema">
          <UInput v-model="renameValue" autofocus @keyup.enter="confirmRename" />
        </UFormGroup>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" @click="showRenameModal = false">Cancelar</UButton>
            <UButton color="black" size="sm" class="font-semibold" @click="confirmRename">Guardar</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Delete Modal -->
    <UModal v-model="showDeleteModal" :ui="{ width: 'sm:max-w-sm' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Eliminar tema</h3>
        </template>
        <div class="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/40">
          <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p class="text-[13px] text-red-800 dark:text-red-300">¿Estás seguro de que quieres eliminar este tema? Esta acción no se puede deshacer.</p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" @click="showDeleteModal = false">Cancelar</UButton>
            <UButton color="red" size="sm" class="font-semibold" @click="confirmDelete">Eliminar tema</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
