<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useLocationsStore, type ProductLocationInventory } from '~/stores/useLocationsStore'
import { useProductsStore } from '~/stores/useProductsStore'
import { useStudioStore } from '~/stores/useStudioStore'
import { getAvailableStock } from '~/types/studio'

definePageMeta({ layout: 'dashboard' })

const locationsStore = useLocationsStore()
const productsStore = useProductsStore()
const studioStore = useStudioStore()
const toast = useToast()

if (!studioStore.warehouseItems.length || !studioStore.recipes.length) {
  await studioStore.fetchAll()
}

/* ── Location Selector ── */
const selectedLocationId = ref<string | null>(null)
const showLocationDropdown = ref(false)

onMounted(() => {
  selectedLocationId.value =
    locationsStore.defaultLocation?.id ??
    locationsStore.locations[0]?.id ??
    null
})

const selectedLocation = computed(() =>
  selectedLocationId.value ? locationsStore.getById(selectedLocationId.value) : null
)

const selectLocation = (id: string) => {
  selectedLocationId.value = id
  showLocationDropdown.value = false
  selectedIds.value = new Set()
}

/* ── Row Model ── */
interface InventoryRow {
  inv: ProductLocationInventory
  product: any
  alertLevel: 'critical' | 'warning' | 'ok'
}

const buildRow = (inv: ProductLocationInventory): InventoryRow => {
  const product = productsStore.products.find(p => String(p.id) === String(inv.productId)) ?? null

  let alertLevel: InventoryRow['alertLevel'] = 'ok'
  if (inv.available <= 0) alertLevel = 'critical'
  else if (inv.available <= 5) alertLevel = 'warning'

  return { inv, product, alertLevel }
}

const allAssignedRows = computed<InventoryRow[]>(() => {
  if (!selectedLocationId.value) return []
  return locationsStore.productInventory
    .filter(pi => pi.locationId === selectedLocationId.value && pi.tracked)
    .map(buildRow)
})

const unassignedProducts = computed(() => {
  if (!selectedLocationId.value) return []
  return productsStore.products.filter(p => {
    const inv = locationsStore.getInventoryForLocation(p.id, selectedLocationId.value!)
    return !inv || !inv.tracked
  })
})

/* ── KPIs ── */
const kpiTotal = computed(() => allAssignedRows.value.length)
const kpiWithStock = computed(() => allAssignedRows.value.filter(r => r.inv.available > 0).length)
const kpiWithoutStock = computed(() => allAssignedRows.value.filter(r => r.inv.available === 0).length)
const kpiLowStock = computed(() => allAssignedRows.value.filter(r => r.alertLevel === 'warning').length)

/* ── Filters / Sort ── */
const searchQuery = ref('')
const filterAlert = ref('')
const showUnassigned = ref(false)
const sortBy = ref<'name' | 'onHand' | 'available'>('name')
const sortDir = ref<'asc' | 'desc'>('asc')

const toggleSort = (col: typeof sortBy.value) => {
  if (sortBy.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortBy.value = col; sortDir.value = 'asc' }
}

const filterAlertOptions = [
  { label: 'Todas las alertas', value: '' },
  { label: 'Sin stock', value: 'nostock' },
  { label: 'Stock bajo (≤ 5)', value: 'lowstock' },
]

const filteredRows = computed<InventoryRow[]>(() => {
  let rows = allAssignedRows.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    rows = rows.filter(r =>
      (r.product?.name ?? '').toLowerCase().includes(q) ||
      (r.product?.sku ?? '').toLowerCase().includes(q)
    )
  }

  if (filterAlert.value === 'nostock') rows = rows.filter(r => r.alertLevel === 'critical')
  else if (filterAlert.value === 'lowstock') rows = rows.filter(r => r.alertLevel === 'warning')
  return [...rows].sort((a, b) => {
    let aVal: any, bVal: any
    if (sortBy.value === 'name') { aVal = a.product?.name ?? ''; bVal = b.product?.name ?? '' }
    else if (sortBy.value === 'onHand') { aVal = a.inv.onHand; bVal = b.inv.onHand }
    else if (sortBy.value === 'available') { aVal = a.inv.available; bVal = b.inv.available }
    else { aVal = ''; bVal = '' }
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const filteredUnassignedProducts = computed(() => {
  if (!showUnassigned.value) return []
  let list = unassignedProducts.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      (p.name ?? '').toLowerCase().includes(q) ||
      (p.sku ?? '').toLowerCase().includes(q)
    )
  }
  return list
})

const totalVisibleRows = computed(() =>
  filteredRows.value.length + filteredUnassignedProducts.value.length
)

/* ── Existencias: máximo producible desde receta + stock de almacén (reactivo) ── */
const getExistencias = (productId: string | number): number => {
  const product = productsStore.products.find(p => String(p.id) === String(productId))
  const recipe = studioStore.getRecipeByProductId(String(productId))
    ?? (product?.name ? studioStore.getRecipeByProductName(product.name) : null)

  if (!recipe || recipe.ingredients.length === 0) {
    return locationsStore.getInventoryForLocation(productId, selectedLocationId.value ?? '')?.onHand ?? 0
  }

  const maxBatches = recipe.ingredients.map(ing => {
    const item = studioStore.getWarehouseItemById(ing.warehouseItemId)
    if (!item || ing.quantity <= 0) return 0
    return Math.floor(getAvailableStock(item) / ing.quantity)
  })

  return maxBatches.length > 0 ? Math.min(...maxBatches) : 0
}

/* ── Auto-clamp disponible cuando el stock del almacén baje (reactivo) ── */
watch(
  () => studioStore.warehouseItems.map(i => i.currentStock),
  () => {
    for (const pi of locationsStore.productInventory) {
      const max = getExistencias(pi.productId)
      if (pi.available > max) {
        locationsStore.setProductLocationInventory(pi.productId, pi.locationId, { available: max })
      }
    }
  },
  { deep: true, immediate: true }
)

/* ── Disponible editing — popover with explicit save ── */
const pendingAvailable = ref<Record<string, number>>({})

const getPending = (invId: string, current: number) => {
  if (pendingAvailable.value[invId] === undefined) pendingAvailable.value[invId] = current
  return pendingAvailable.value[invId]
}

const setPending = (invId: string, raw: number, max: number) => {
  pendingAvailable.value[invId] = Math.min(Math.max(0, raw || 0), max)
}

const saveAvailable = (inv: ProductLocationInventory) => {
  const val = pendingAvailable.value[inv.id]
  if (val === undefined || val === inv.available) return
  locationsStore.setProductLocationInventory(inv.productId, inv.locationId, { available: val })
  toast.add({ title: 'Disponible actualizado', description: `${val} unidades en ${inv.locationName}`, color: 'green' })
  delete pendingAvailable.value[inv.id]
}

const resetPending = (invId: string) => { delete pendingAvailable.value[invId] }

/* ── Initialize inventory for unassigned product ── */
const initializeInventory = (productId: string | number) => {
  if (!selectedLocationId.value) return
  locationsStore.getOrCreateInventory(productId, selectedLocationId.value)
  toast.add({
    title: 'Inventario inicializado',
    description: `Producto asignado a ${selectedLocation.value?.name}. Stock en 0.`,
    color: 'green',
  })
}

/* ── Bulk selection ── */
const selectedIds = ref<Set<string>>(new Set())

const allSelected = computed(() =>
  filteredRows.value.length > 0 && filteredRows.value.every(r => selectedIds.value.has(r.inv.id))
)

const toggleAll = () => {
  if (allSelected.value) filteredRows.value.forEach(r => selectedIds.value.delete(r.inv.id))
  else filteredRows.value.forEach(r => selectedIds.value.add(r.inv.id))
}

const toggleRow = (id: string) => {
  if (selectedIds.value.has(id)) selectedIds.value.delete(id)
  else selectedIds.value.add(id)
}

/* ── Helpers ── */
const locationTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    physical: 'i-lucide-store',
    warehouse: 'i-lucide-warehouse',
    app: 'i-lucide-app-window',
    custom: 'i-lucide-map-pin',
  }
  return icons[type] ?? 'i-lucide-map-pin'
}

const productStatusColor = (status: string) => {
  if (status === 'Activo') return 'green'
  if (status === 'Borrador') return 'gray'
  if (status === 'Archivado') return 'red'
  return 'gray'
}

</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">

    <!-- ══ HEADER ══ -->
    <div class="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div class="flex items-start justify-between gap-4">
        <!-- Title + Location Selector -->
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">Inventario</h1>

          <!-- Location selector (Shopify-style) -->
          <UPopover v-model:open="showLocationDropdown" :popper="{ placement: 'bottom-start' }">
            <button
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              :class="{ 'border-primary-500 ring-1 ring-primary-500/20': showLocationDropdown }"
            >
              <UIcon v-if="selectedLocation" :name="locationTypeIcon(selectedLocation.type)" class="w-4 h-4 text-gray-400" />
              <UIcon v-else name="i-lucide-map-pin-off" class="w-4 h-4 text-gray-400" />
              <span>{{ selectedLocation?.name ?? 'Seleccionar sucursal' }}</span>
              <UBadge v-if="selectedLocation?.status === 'inactive'" color="gray" variant="subtle" size="xs" class="ml-0.5">Inactiva</UBadge>
              <UBadge v-if="selectedLocation && !selectedLocation.inventoryEnabled" color="orange" variant="subtle" size="xs" class="ml-0.5">Sin inventario</UBadge>
              <UIcon name="i-lucide-chevrons-up-down" class="w-3.5 h-3.5 text-gray-400 ml-0.5" />
            </button>
            <template #panel>
              <div class="py-1 min-w-[260px] max-h-72 overflow-y-auto">
                <div class="px-3 pt-2 pb-1">
                  <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Sucursales</p>
                </div>
                <button
                  v-for="loc in locationsStore.locations"
                  :key="loc.id"
                  class="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                  :class="{ 'bg-primary-50 dark:bg-primary-900/20': loc.id === selectedLocationId }"
                  @click="selectLocation(loc.id)"
                >
                  <UIcon :name="locationTypeIcon(loc.type)" class="w-4 h-4 flex-shrink-0" :class="loc.status === 'inactive' ? 'text-gray-300' : 'text-gray-500'" />
                  <span class="flex-1 font-medium" :class="loc.status === 'inactive' ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'">{{ loc.name }}</span>
                  <UIcon v-if="loc.id === selectedLocationId" name="i-lucide-check" class="w-3.5 h-3.5 text-primary-500" />
                  <UBadge v-if="loc.isDefault && loc.id !== selectedLocationId" color="gray" variant="subtle" size="xs">Principal</UBadge>
                  <UBadge v-if="loc.status === 'inactive'" color="gray" variant="subtle" size="xs">Inactiva</UBadge>
                  <UBadge v-if="!loc.inventoryEnabled" color="orange" variant="subtle" size="xs">Sin inv.</UBadge>
                </button>
                <div v-if="locationsStore.locations.length === 0" class="px-4 py-3 text-sm text-gray-500">
                  No hay sucursales configuradas.
                </div>
                <div class="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1 pb-1 px-3">
                  <NuxtLink to="/settings/locations" class="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <UIcon name="i-lucide-settings" class="w-3 h-3" />
                    Gestionar sucursales
                  </NuxtLink>
                </div>
              </div>
            </template>
          </UPopover>
        </div>

        <!-- Header actions (prepared for future phases) -->
        <div class="flex items-center gap-2">
          <UTooltip text="Exportar inventario (próximamente)">
            <UButton icon="i-lucide-upload" color="gray" variant="ghost" size="sm" disabled>Exportar</UButton>
          </UTooltip>
          <UTooltip text="Importar inventario (próximamente)">
            <UButton icon="i-lucide-download" color="gray" variant="ghost" size="sm" disabled>Importar</UButton>
          </UTooltip>
        </div>
      </div>
    </div>

    <!-- ══ NO LOCATIONS EMPTY STATE ══ -->
    <div v-if="locationsStore.locations.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center max-w-sm">
        <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-map-pin-off" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Sin sucursales configuradas</h3>
        <p class="text-sm text-gray-500 mb-4">Primero debes crear al menos una sucursal para gestionar el inventario por ubicación.</p>
        <UButton to="/settings/locations" color="black" icon="i-lucide-plus">Crear primera sucursal</UButton>
      </div>
    </div>

    <template v-else-if="selectedLocation">
      <!-- ══ ALERT BANNERS ══ -->
      <div v-if="selectedLocation.status === 'inactive'" class="flex-shrink-0 px-6 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
        <UIcon name="i-lucide-triangle-alert" class="w-4 h-4 flex-shrink-0" />
        <span>Esta sucursal está <strong>inactiva</strong>. Los datos de inventario son visibles pero la sucursal no opera actualmente.</span>
        <NuxtLink :to="`/settings/locations/${selectedLocation.id}`" class="ml-auto text-yellow-700 dark:text-yellow-400 hover:underline text-xs font-medium flex-shrink-0">Ver sucursal →</NuxtLink>
      </div>
      <div v-else-if="!selectedLocation.inventoryEnabled" class="flex-shrink-0 px-6 py-2.5 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
        <UIcon name="i-lucide-info" class="w-4 h-4 flex-shrink-0" />
        <span>Esta sucursal no tiene el <strong>inventario habilitado</strong>. Los datos se muestran solo como referencia.</span>
        <NuxtLink :to="`/settings/locations/${selectedLocation.id}`" class="ml-auto text-orange-700 dark:text-orange-400 hover:underline text-xs font-medium flex-shrink-0">Habilitar →</NuxtLink>
      </div>

      <!-- ══ KPI ROW ══ -->
      <div class="flex-shrink-0 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 grid grid-cols-3 gap-4">
        <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ kpiTotal }}</div>
          <div class="text-xs text-gray-500">{{ kpiTotal === 1 ? 'Artículo' : 'Artículos' }}</div>
        </div>
        <div class="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 text-center">
          <div class="text-2xl font-bold text-green-600">{{ kpiWithStock }}</div>
          <div class="text-xs text-green-600">Con stock</div>
        </div>
        <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 text-center">
          <div class="text-2xl font-bold text-red-600">{{ kpiWithoutStock }}</div>
          <div class="text-xs text-red-600">Sin stock</div>
        </div>
      </div>

      <!-- ══ TOOLBAR ══ -->
      <div class="flex-shrink-0 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-wrap items-center gap-3">
        <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Buscar producto o SKU…" size="sm" class="w-64" />
        <USelectMenu
          v-model="filterAlert"
          :options="filterAlertOptions"
          value-attribute="value"
          option-attribute="label"
          size="sm"
          class="w-44"
        />
        <div class="ml-auto flex items-center gap-3">
          <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
            <UToggle v-model="showUnassigned" size="sm" />
            <span>Mostrar sin asignar</span>
            <UBadge v-if="unassignedProducts.length > 0" color="gray" variant="subtle" size="xs">{{ unassignedProducts.length }}</UBadge>
          </label>
          <span class="text-xs text-gray-400">{{ totalVisibleRows }} {{ totalVisibleRows === 1 ? 'artículo' : 'artículos' }}</span>
        </div>
      </div>

      <!-- ══ TABLE ══ -->
      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-left text-sm">
          <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th class="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="selectedIds.size > 0 && !allSelected"
                  @change="toggleAll"
                  class="rounded border-gray-300 dark:border-gray-600"
                />
              </th>
              <th
                class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none"
                @click="toggleSort('name')"
              >
                <span class="inline-flex items-center gap-1">
                  Producto
                  <UIcon v-if="sortBy === 'name'" :name="sortDir === 'asc' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3 h-3" />
                  <UIcon v-else name="i-lucide-chevrons-up-down" class="w-3 h-3 text-gray-300" />
                </span>
              </th>
              <th
                class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase text-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none"
                @click="toggleSort('available')"
              >
                <span class="inline-flex items-center gap-1 justify-center">
                  Disponible
                  <UIcon v-if="sortBy === 'available'" :name="sortDir === 'asc' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3 h-3" />
                  <UIcon v-else name="i-lucide-chevrons-up-down" class="w-3 h-3 text-gray-300" />
                </span>
              </th>
              <th class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase text-center select-none">
                <span class="inline-flex items-center gap-1 justify-center">
                  Existencias
                  <UTooltip text="Stock físico en la sucursal. Se reduce automáticamente con cada pedido.">
                    <UIcon name="i-lucide-info" class="w-3 h-3 text-gray-400 cursor-help" />
                  </UTooltip>
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">

            <!-- ── Assigned rows ── -->
            <tr
              v-for="row in filteredRows"
              :key="row.inv.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group"
              :class="{
                'bg-red-50/40 dark:bg-red-900/10': row.alertLevel === 'critical',
              }"
            >
              <!-- Checkbox -->
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(row.inv.id)"
                  @change="toggleRow(row.inv.id)"
                  class="rounded border-gray-300 dark:border-gray-600"
                />
              </td>

              <!-- Producto -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <img
                      v-if="row.product?.image"
                      :src="row.product.image"
                      :alt="row.product.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <UIcon name="i-lucide-package" class="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div class="min-w-0">
                    <NuxtLink
                      v-if="row.product"
                      :to="`/producto/${row.product.id}`"
                      class="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 hover:underline block truncate max-w-[200px]"
                    >
                      {{ row.product.name }}
                    </NuxtLink>
                    <span v-else class="font-medium text-gray-400">Producto #{{ row.inv.productId }}</span>
                    <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span v-if="row.product?.sku" class="text-[11px] text-gray-400 font-mono">{{ row.product.sku }}</span>
                      <UBadge
                        v-if="row.product?.status && row.product.status !== 'Activo'"
                        :color="productStatusColor(row.product.status)"
                        variant="subtle"
                        size="xs"
                      >{{ row.product.status }}</UBadge>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Disponible (editable vía popover — cantidad que el usuario elige vender) -->
              <td class="px-4 py-3 text-center">
                <UPopover :popper="{ placement: 'bottom' }" @close="resetPending(row.inv.id)">
                  <button
                    class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <span
                      class="text-sm font-semibold tabular-nums"
                      :class="{
                        'text-red-600': row.alertLevel === 'critical',
                        'text-orange-500': row.alertLevel === 'warning',
                        'text-gray-900 dark:text-white': row.alertLevel === 'ok',
                      }"
                    >{{ row.inv.available }}</span>
                    <UIcon name="i-lucide-chevron-up" class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </button>
                  <template #panel>
                    <div class="p-4 w-60 space-y-3">
                      <div>
                        <p class="text-[13px] font-semibold text-gray-900 dark:text-white">Cantidad disponible</p>
                        <p class="text-[11px] text-gray-500 mt-0.5">Máx. {{ getExistencias(row.inv.productId) }} · máximo producible</p>
                      </div>
                      <UInput
                        :model-value="getPending(row.inv.id, row.inv.available)"
                        type="number"
                        :max="getExistencias(row.inv.productId)"
                        min="0"
                        size="sm"
                        placeholder="0"
                        @update:model-value="v => setPending(row.inv.id, Number(v), getExistencias(row.inv.productId))"
                      />
                      <div
                        v-if="getPending(row.inv.id, row.inv.available) > getExistencias(row.inv.productId)"
                        class="text-[11px] text-red-500 flex items-center gap-1"
                      >
                        <UIcon name="i-lucide-alert-circle" class="w-3 h-3" />
                        No puede superar las existencias ({{ getExistencias(row.inv.productId) }})
                      </div>
                      <UButton
                        color="black"
                        size="sm"
                        block
                        :disabled="getPending(row.inv.id, row.inv.available) === row.inv.available"
                        @click="saveAvailable(row.inv)"
                      >
                        Guardar
                      </UButton>
                    </div>
                  </template>
                </UPopover>
              </td>

              <!-- Existencias (indicador reactivo — máximo producible desde receta + almacén) -->
              <td class="px-4 py-3 text-center">
                <div class="flex flex-col items-center gap-0.5">
                  <span
                    class="text-sm font-semibold"
                    :class="getExistencias(row.inv.productId) === 0 ? 'text-red-500' : getExistencias(row.inv.productId) <= 5 ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'"
                  >{{ getExistencias(row.inv.productId) }}</span>
                  <span class="text-[10px] text-gray-400">producibles</span>
                </div>
              </td>
            </tr>

            <!-- ── Unassigned rows (toggle) ── -->
            <tr
              v-for="product in filteredUnassignedProducts"
              :key="`unassigned-${product.id}`"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/10 transition-colors opacity-60"
            >
              <td class="px-4 py-3">
                <input type="checkbox" disabled class="rounded border-gray-200 opacity-40" />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <UIcon name="i-lucide-package" class="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                  <div class="min-w-0">
                    <span class="font-medium text-gray-500 block truncate max-w-[200px]">{{ product.name }}</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span v-if="product.sku" class="text-[11px] text-gray-400 font-mono">{{ product.sku }}</span>
                      <span class="text-[11px] text-gray-400 italic">Sin inventario en esta sucursal</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-center text-gray-300 text-sm">—</td>
              <td class="px-4 py-3 text-center text-gray-300 text-sm">—</td>
              <td class="px-4 py-3 text-center">
                <UTooltip text="Inicializar inventario en 0 para esta sucursal">
                  <UButton
                    color="gray"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-plus-circle"
                    @click="initializeInventory(product.id)"
                  >
                    Inicializar
                  </UButton>
                </UTooltip>
              </td>
            </tr>

            <!-- ── Empty state: no assigned rows and no unassigned shown ── -->
            <tr v-if="filteredRows.length === 0 && filteredUnassignedProducts.length === 0">
              <td colspan="4" class="py-16 text-center">
                <template v-if="searchQuery || filterAlert">
                  <UIcon name="i-lucide-search-x" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p class="text-sm font-medium text-gray-500">Sin resultados para los filtros actuales</p>
                  <p class="text-xs text-gray-400 mt-1">Prueba con otros términos o elimina los filtros.</p>
                  <UButton color="gray" variant="ghost" size="sm" class="mt-3" @click="searchQuery = ''; filterAlert = ''">
                    Limpiar filtros
                  </UButton>
                </template>
                <template v-else-if="allAssignedRows.length === 0">
                  <UIcon name="i-lucide-package-x" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p class="text-sm font-medium text-gray-500">Sin productos asignados en <strong>{{ selectedLocation?.name }}</strong></p>
                  <p class="text-xs text-gray-400 mt-1">
                    Activa el toggle <strong>"Mostrar sin asignar"</strong> para ver todos los productos del catálogo e inicializar su inventario.
                  </p>
                  <UButton color="gray" variant="ghost" size="sm" class="mt-3" icon="i-lucide-eye" @click="showUnassigned = true">
                    Mostrar sin asignar
                  </UButton>
                </template>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <!-- ══ FOOTER INFO ══ -->
      <div class="flex-shrink-0 px-6 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
        <p class="text-[11px] text-gray-400">
          <span class="font-mono">Disponible</span>: cantidad elegida para venta &nbsp;·&nbsp; <span class="font-mono">Existencias</span>: stock físico en sucursal (se reduce automáticamente con pedidos)
        </p>
        <div class="flex items-center gap-3 text-[11px] text-gray-400">
          <span v-if="kpiLowStock > 0" class="flex items-center gap-1 text-orange-500">
            <UIcon name="i-lucide-triangle-alert" class="w-3 h-3" />
            {{ kpiLowStock }} con stock bajo
          </span>
          <NuxtLink to="/settings/locations" class="hover:underline">Gestionar sucursales →</NuxtLink>
        </div>
      </div>
    </template>

  </div>
</template>
