<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCollectionsStore } from '~/stores/useCollectionsStore'
import { useCatalogStore } from '~/stores/useCatalogStore'
import type { Collection } from '~/types/commerce'

definePageMeta({ layout: 'dashboard' })

const router = useRouter()
const collectionsStore = useCollectionsStore()
const catalogStore = useCatalogStore()

/* ── Fetch data ── */
await Promise.all([
  collectionsStore.fetchCollections(),
  catalogStore.fetchProducts(),
])

/* ── Search ── */
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = ref('')
watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { debouncedSearch.value = val }, 250)
})

/* ── Filters ── */
const filterType = ref<string>('')
const filterStatus = ref<string>('')
const typeOptions = [
  { label: 'Todos los tipos', value: '' },
  { label: 'Manual', value: 'manual' },
  { label: 'Automatizada', value: 'automated' },
]
const statusOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activo', value: 'active' },
  { label: 'Borrador', value: 'draft' },
]

/* ── Sort ── */
const sortBy = ref<string>('title-asc')
const sortOptions = [
  { label: 'Nombre A–Z', value: 'title-asc' },
  { label: 'Nombre Z–A', value: 'title-desc' },
  { label: 'Más recientes', value: 'created-desc' },
  { label: 'Más antiguas', value: 'created-asc' },
  { label: 'Última actualización', value: 'updated-desc' },
]

/* ── Filtered + sorted list ── */
const filteredCollections = computed(() => {
  let list = [...collectionsStore.collections]

  // Search
  const q = debouncedSearch.value.toLowerCase()
  if (q) {
    list = list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q)
    )
  }

  // Filter type
  if (filterType.value) {
    list = list.filter(c => c.type === filterType.value)
  }

  // Filter status
  if (filterStatus.value) {
    list = list.filter(c => c.status === filterStatus.value)
  }

  // Sort
  const [field, dir] = sortBy.value.split('-')
  list.sort((a, b) => {
    let cmp = 0
    if (field === 'title') cmp = a.title.localeCompare(b.title)
    else if (field === 'created') cmp = a.createdAt.localeCompare(b.createdAt)
    else if (field === 'updated') cmp = a.updatedAt.localeCompare(b.updatedAt)
    return dir === 'desc' ? -cmp : cmp
  })

  return list
})

/* ── Bulk selection ── */
const selectedIds = ref<Set<string>>(new Set())
const allSelected = computed(() =>
  filteredCollections.value.length > 0 && filteredCollections.value.every(c => selectedIds.value.has(c.id))
)
const toggleAll = () => {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredCollections.value.map(c => c.id))
  }
}
const toggleOne = (id: string) => {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedIds.value = s
}

/* ── Helpers ── */
const getStatusLabel = (s: string) => s === 'active' ? 'Activo' : 'Borrador'
const getStatusColor = (s: string) => (s === 'active' ? 'green' : 'gray') as 'green' | 'gray'
const getTypeLabel = (t: string) => t === 'automated' ? 'Automatizada' : 'Manual'
const getProductCount = (c: Collection) => c.productIds.length
const hasActiveFilters = computed(() => !!filterType.value || !!filterStatus.value)
const clearFilters = () => { filterType.value = ''; filterStatus.value = '' }

/* ── Navigation ── */
const goToCollection = (c: Collection) => router.push(`/menu/collections/${c.id}`)
const goToCreate = () => router.push('/menu/collections/new')
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Colecciones</h1>
        <p class="text-sm text-gray-500 mt-0.5">Agrupa productos para facilitar la navegación y las promociones.</p>
      </div>
      <UButton color="black" icon="i-lucide-plus" @click="goToCreate">Crear colección</UButton>
    </div>

    <!-- Toolbar: search + filters + sort -->
    <div class="flex-shrink-0 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-wrap items-center gap-3">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Buscar colecciones…"
        class="w-64"
        size="sm"
      />
      <USelectMenu
        v-model="filterType"
        :options="typeOptions"
        value-attribute="value"
        size="sm"
        class="w-40"
        placeholder="Tipo"
      />
      <USelectMenu
        v-model="filterStatus"
        :options="statusOptions"
        value-attribute="value"
        size="sm"
        class="w-40"
        placeholder="Estado"
      />
      <USelectMenu
        v-model="sortBy"
        :options="sortOptions"
        value-attribute="value"
        size="sm"
        class="w-48"
        placeholder="Ordenar por"
      >
        <template #leading>
          <UIcon name="i-lucide-arrow-up-down" class="w-3.5 h-3.5 text-gray-400" />
        </template>
      </USelectMenu>
      <UButton v-if="hasActiveFilters" color="gray" variant="ghost" size="xs" icon="i-lucide-x" @click="clearFilters">Limpiar filtros</UButton>
      <div class="ml-auto text-xs text-gray-400">{{ filteredCollections.length }} colección{{ filteredCollections.length !== 1 ? 'es' : '' }}</div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Loading -->
      <div v-if="collectionsStore.loading" class="flex items-center justify-center py-24">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-gray-400 animate-spin" />
      </div>

      <!-- Error -->
      <UAlert v-else-if="collectionsStore.error" icon="i-lucide-alert-triangle" color="red" variant="subtle" :title="collectionsStore.error" class="mx-6 mt-6" />

      <!-- Empty state: no collections at all -->
      <div v-else-if="collectionsStore.collections.length === 0" class="flex items-center justify-center py-24 px-6">
        <div class="text-center max-w-sm">
          <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-folder-heart" class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Sin colecciones todavía</h3>
          <p class="text-sm text-gray-500 mb-6">Las colecciones agrupan productos para facilitar la navegación en tu tienda y las campañas de marketing.</p>
          <UButton color="black" icon="i-lucide-plus" @click="goToCreate">Crear tu primera colección</UButton>
        </div>
      </div>

      <!-- Empty state: no results -->
      <div v-else-if="filteredCollections.length === 0" class="flex items-center justify-center py-24 px-6">
        <div class="text-center max-w-sm">
          <UIcon name="i-lucide-search-x" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Sin resultados</h3>
          <p class="text-sm text-gray-500">No se encontraron colecciones con los filtros actuales.</p>
          <UButton color="gray" variant="soft" size="sm" class="mt-4" @click="clearFilters(); searchQuery = ''">Limpiar búsqueda</UButton>
        </div>
      </div>

      <!-- Table -->
      <table v-else class="w-full text-left">
        <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th class="pl-6 pr-2 py-3 w-10">
              <UCheckbox :model-value="allSelected" @update:model-value="toggleAll" />
            </th>
            <th class="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-14"></th>
            <th class="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Título</th>
            <th class="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Productos</th>
            <th class="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
            <th class="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider pr-6 text-right">Actualizado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="col in filteredCollections"
            :key="col.id"
            class="group hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
            @click="goToCollection(col)"
          >
            <td class="pl-6 pr-2 py-3" @click.stop>
              <UCheckbox :model-value="selectedIds.has(col.id)" @update:model-value="toggleOne(col.id)" />
            </td>
            <td class="px-3 py-3">
              <div class="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <img v-if="col.image" :src="col.image" :alt="col.title" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-lucide-image" class="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </td>
            <td class="px-3 py-3">
              <span class="font-medium text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ col.title }}</span>
            </td>
            <td class="px-3 py-3 text-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ getProductCount(col) }}</span>
            </td>
            <td class="px-3 py-3">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ getTypeLabel(col.type) }}</span>
            </td>
            <td class="px-3 py-3">
              <UBadge :color="getStatusColor(col.status)" variant="subtle" size="xs">{{ getStatusLabel(col.status) }}</UBadge>
            </td>
            <td class="px-3 py-3 pr-6 text-right">
              <span class="text-xs text-gray-500">{{ new Date(col.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bulk action bar -->
    <Transition name="slide-up">
      <div v-if="selectedIds.size > 0" class="flex-shrink-0 px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center gap-4">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ selectedIds.size }} seleccionada{{ selectedIds.size !== 1 ? 's' : '' }}</span>
        <UButton color="gray" variant="soft" size="xs" @click="selectedIds = new Set()">Deseleccionar</UButton>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
