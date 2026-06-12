<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudioStore } from '~/stores/useStudioStore'
import { useLocationsStore } from '~/stores/useLocationsStore'
import type { WarehouseItem, WarehouseBatch, WarehouseCategory, WarehouseUnit } from '~/types/studio'
import { getAvailableStock, isLowStock, isExpiringSoon, isExpired, warehouseCategoryLabels, warehouseUnitLabels } from '~/types/studio'

definePageMeta({ layout: 'dashboard' })

const store = useStudioStore()
const toast = useToast()
const router = useRouter()
await store.fetchAll()

/* ── Filters ── */
const searchQuery = ref('')
const filterCategory = ref('')
const filterAlert = ref('')
const filterLocation = ref('')

const categoryOptions = [
  { label: 'Todas las categorías', value: '' },
  ...Object.entries(warehouseCategoryLabels).map(([k, v]) => ({ label: v, value: k })),
]
const alertOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Stock bajo', value: 'low' },
  { label: 'Caduca pronto', value: 'expiring' },
  { label: 'Caducado', value: 'expired' },
]
const locationsStore = useLocationsStore()
const locationOptions = computed(() => [
  { label: 'Todas las sucursales', value: '' },
  ...locationsStore.locations
    .filter(l => l.status === 'active')
    .map(l => ({ label: l.name, value: l.id })),
])
const branchOptions = computed(() => [
  { label: 'Sin asignar', value: '' },
  ...locationsStore.locations
    .filter(l => l.status === 'active')
    .map(l => ({ label: l.name, value: l.id })),
])
const unitOptions = Object.entries(warehouseUnitLabels).map(([k, v]) => ({ label: v, value: k }))

const filteredItems = computed(() => {
  let list = [...store.warehouseItems]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.supplier.toLowerCase().includes(q))
  }
  if (filterCategory.value) list = list.filter(i => i.category === filterCategory.value)
  if (filterLocation.value) list = list.filter(i => i.branchId === filterLocation.value)
  if (filterAlert.value === 'low') list = list.filter(i => isLowStock(i))
  else if (filterAlert.value === 'expiring') list = list.filter(i => isExpiringSoon(i))
  else if (filterAlert.value === 'expired') list = list.filter(i => isExpired(i))
  return list
})

const formatEur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}
const totalValue = computed(() =>
  store.warehouseItems.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0)
)
const getRowAlerts = (item: WarehouseItem) => {
  const alerts: { icon: string; color: string; text: string }[] = []
  if (isExpired(item)) alerts.push({ icon: 'i-lucide-skull', color: 'text-red-500', text: 'Caducado' })
  else if (isExpiringSoon(item)) alerts.push({ icon: 'i-lucide-timer', color: 'text-yellow-500', text: 'Caduca pronto' })
  if (isLowStock(item)) alerts.push({ icon: 'i-lucide-triangle-alert', color: 'text-orange-500', text: 'Stock bajo' })
  return alerts
}

/* ─────────────────────────────────────────
   NEW ITEM MODAL
───────────────────────────────────────── */
const showNewModal = ref(false)
const newSaving = ref(false)
const newForm = ref({
  name: '', category: 'otros' as WarehouseCategory, unit: 'kg' as WarehouseUnit,
  minimumStock: 0, location: '', branchId: '', notes: '',
})
const newBatch = ref({
  quantity: 0, expiryDate: '' as string | null,
  receivedAt: new Date().toISOString().slice(0, 10),
  costPerUnit: 0, supplier: '', notes: '',
})
const resetNewForm = () => {
  newForm.value = { name: '', category: 'otros', unit: 'kg', minimumStock: 0, location: '', branchId: '', notes: '' }
  newBatch.value = { quantity: 0, expiryDate: '', receivedAt: new Date().toISOString().slice(0, 10), costPerUnit: 0, supplier: '', notes: '' }
}
const handleCreateItem = async () => {
  if (!newForm.value.name?.trim()) {
    toast.add({ title: 'Nombre obligatorio', color: 'red' })
    return
  }
  newSaving.value = true
  const payload = {
    ...newForm.value,
    costPerUnit: newBatch.value.costPerUnit,
    supplier: newBatch.value.supplier,
    batch: {
      ...newBatch.value,
      expiryDate: newBatch.value.expiryDate || null,
    },
  }
  const created = await store.createWarehouseItem(payload)
  newSaving.value = false
  if (created) {
    toast.add({ title: 'Artículo creado', description: created.name, color: 'green' })
    showNewModal.value = false
    resetNewForm()
  } else {
    toast.add({ title: 'Error al crear artículo', color: 'red' })
  }
}

/* ─────────────────────────────────────────
   EDIT ITEM MODAL (metadata only, no stock/expiry)
───────────────────────────────────────── */
const showEditModal = ref(false)
const editSaving = ref(false)
const editForm = ref<Partial<WarehouseItem> & { id?: string }>({})

const openEditModal = (item: WarehouseItem) => {
  editForm.value = { ...item }
  showEditModal.value = true
}
const handleSaveEdit = async () => {
  if (!editForm.value.id) return
  editSaving.value = true
  const updated = await store.updateWarehouseItem(editForm.value.id, {
    name: editForm.value.name,
    category: editForm.value.category,
    unit: editForm.value.unit,
    branchId: editForm.value.branchId,
    location: editForm.value.location,
    notes: editForm.value.notes,
  })
  editSaving.value = false
  if (updated) {
    toast.add({ title: 'Guardado', description: updated.name, color: 'green' })
    showEditModal.value = false
  } else {
    toast.add({ title: 'Error al guardar', color: 'red' })
  }
}

/* ─────────────────────────────────────────
   BATCH MODAL — 3 modes: list | edit | delete | create
───────────────────────────────────────── */
type BatchModalMode = 'list' | 'edit' | 'delete' | 'create'
const showBatchModal = ref(false)
const batchModalMode = ref<BatchModalMode>('list')
const batchItem = ref<WarehouseItem | null>(null)
const batchList = ref<WarehouseBatch[]>([])
const batchLoading = ref(false)
const batchSaving = ref(false)
const selectedBatch = ref<WarehouseBatch | null>(null)
const batchEditForm = ref<Partial<WarehouseBatch>>({})
const batchCreateForm = ref({
  quantity: 0, expiryDate: '' as string | null,
  receivedAt: new Date().toISOString().slice(0, 10),
  costPerUnit: 0, supplier: '', notes: '',
})

const openBatchModal = async (item: WarehouseItem) => {
  batchItem.value = item
  batchModalMode.value = 'list'
  selectedBatch.value = null
  showBatchModal.value = true
  batchLoading.value = true
  batchList.value = await store.fetchBatches(item.id)
  batchLoading.value = false
}
const selectBatchForEdit = (batch: WarehouseBatch) => {
  selectedBatch.value = batch
  batchEditForm.value = { ...batch }
  batchModalMode.value = 'edit'
}
const selectBatchForDelete = (batch: WarehouseBatch) => {
  selectedBatch.value = batch
  batchModalMode.value = 'delete'
}
const goCreateBatch = () => {
  batchCreateForm.value = {
    quantity: 0, expiryDate: '',
    receivedAt: new Date().toISOString().slice(0, 10),
    costPerUnit: batchItem.value?.costPerUnit ?? 0,
    supplier: batchItem.value?.supplier ?? '',
    notes: '',
  }
  batchModalMode.value = 'create'
}

const syncBulkRow = (itemId: string) => {
  const storeItem = store.warehouseItems.find(i => i.id === itemId)
  if (!storeItem) return
  const bulkRow = bulkRows.value.find(r => r.id === itemId)
  if (bulkRow) {
    bulkRow.currentStock = storeItem.currentStock
    bulkRow.batchCount = storeItem.batchCount
    bulkRow.nearestExpiryDate = storeItem.nearestExpiryDate
  }
}

const handleSaveBatchEdit = async () => {
  if (!batchItem.value || !selectedBatch.value) return
  batchSaving.value = true
  const payload = {
    ...batchEditForm.value,
    expiryDate: batchEditForm.value.expiryDate || null,
  }
  const updated = await store.updateBatch(batchItem.value.id, selectedBatch.value.id, payload)
  batchSaving.value = false
  if (updated) {
    batchList.value = store.batchesByItem[batchItem.value.id] ?? []
    syncBulkRow(batchItem.value.id)
    toast.add({ title: 'Lote actualizado', color: 'green' })
    batchModalMode.value = 'list'
  } else {
    toast.add({ title: 'Error al guardar lote', color: 'red' })
  }
}

const handleDeleteBatch = async () => {
  if (!batchItem.value || !selectedBatch.value) return
  batchSaving.value = true
  const ok = await store.deleteBatch(batchItem.value.id, selectedBatch.value.id)
  batchSaving.value = false
  if (ok) {
    batchList.value = store.batchesByItem[batchItem.value.id] ?? []
    syncBulkRow(batchItem.value.id)
    toast.add({ title: 'Lote eliminado', color: 'green' })
    batchModalMode.value = 'list'
  } else {
    toast.add({ title: 'Error al eliminar lote', color: 'red' })
  }
}

const handleCreateBatch = async () => {
  if (!batchItem.value) return
  batchSaving.value = true
  const payload = {
    ...batchCreateForm.value,
    expiryDate: batchCreateForm.value.expiryDate || null,
  }
  const created = await store.createBatch(batchItem.value.id, payload)
  batchSaving.value = false
  if (created) {
    batchList.value = store.batchesByItem[batchItem.value.id] ?? []
    syncBulkRow(batchItem.value.id)
    toast.add({ title: 'Lote creado', color: 'green' })
    batchModalMode.value = 'list'
  } else {
    toast.add({ title: 'Error al crear lote', color: 'red' })
  }
}

/* ─────────────────────────────────────────
   ROW ACTIONS DROPDOWN
───────────────────────────────────────── */
const rowActions = (item: WarehouseItem) => [[
  { label: 'Editar', icon: 'i-lucide-pencil', click: () => openEditModal(item) },
  { label: 'Gestionar lotes', icon: 'i-lucide-layers', click: () => openBatchModal(item) },
  { label: 'Pedir cantidad', icon: 'i-lucide-shopping-basket', click: () => router.push(`/estudio/compra?q=${encodeURIComponent(item.name)}`) },
]]

/* ─────────────────────────────────────────
   BULK EDIT MODAL (spreadsheet — no expiry)
───────────────────────────────────────── */
const showBulkModal = ref(false)
const bulkRows = ref<(WarehouseItem & { _dirty: boolean })[]>([])
const bulkSaving = ref(false)
const bulkBatchItemId = ref<string | null>(null)

const openBulkModal = () => {
  bulkRows.value = filteredItems.value.map(i => ({ ...i, _dirty: false }))
  showBulkModal.value = true
}
const markDirty = (row: typeof bulkRows.value[0]) => { row._dirty = true }
const dirtyCount = computed(() => bulkRows.value.filter(r => r._dirty).length)

const openBulkBatches = async (row: WarehouseItem) => {
  await openBatchModal(row)
}

const handleBulkSave = async () => {
  const dirty = bulkRows.value.filter(r => r._dirty)
  if (!dirty.length) return
  bulkSaving.value = true
  const results = await Promise.all(
    dirty.map(r => store.updateWarehouseItem(r.id, {
      name: r.name, category: r.category, unit: r.unit,
      minimumStock: r.minimumStock, costPerUnit: r.costPerUnit,
      supplier: r.supplier, location: r.location, branchId: r.branchId, notes: r.notes,
    }))
  )
  bulkSaving.value = false
  const ok = results.filter(Boolean).length
  toast.add({ title: `${ok} artículo${ok !== 1 ? 's' : ''} actualizados`, color: ok === dirty.length ? 'green' : 'yellow' })
  if (ok > 0) showBulkModal.value = false
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">

    <!-- ── Header ── -->
    <div class="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-warehouse" class="w-5 h-5" />
          Almacén
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestión del inventario de materias primas e ingredientes.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-right mr-2">
          <div class="text-xs text-gray-500">Valor total</div>
          <div class="text-lg font-bold text-gray-900 dark:text-white">{{ formatEur(totalValue) }}</div>
        </div>
        <UButton icon="i-lucide-table-2" color="gray" variant="outline" size="sm" @click="openBulkModal">Edición masiva</UButton>
        <UButton icon="i-lucide-plus" color="primary" variant="solid" size="sm" @click="showNewModal = true">Nuevo artículo</UButton>
      </div>
    </div>

    <!-- ── KPI Row ── -->
    <div class="flex-shrink-0 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 grid grid-cols-4 gap-4">
      <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ store.warehouseItems.length }}</div>
        <div class="text-xs text-gray-500">Artículos</div>
      </div>
      <div class="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 text-center">
        <div class="text-2xl font-bold text-orange-600">{{ store.lowStockItems.length }}</div>
        <div class="text-xs text-orange-600">Stock bajo</div>
      </div>
      <div class="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 text-center">
        <div class="text-2xl font-bold text-yellow-600">{{ store.expiringSoonItems.length }}</div>
        <div class="text-xs text-yellow-600">Caduca pronto</div>
      </div>
      <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ store.pendingOrders.length }}</div>
        <div class="text-xs text-blue-600">Pedidos pendientes</div>
      </div>
    </div>

    <!-- ── Toolbar / Filters ── -->
    <div class="flex-shrink-0 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-wrap items-center gap-3">
      <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Buscar artículo…" class="w-56" size="sm" />
      <USelectMenu v-model="filterCategory" :options="categoryOptions" value-attribute="value" option-attribute="label" placeholder="Categoría" size="sm" class="w-44" />
      <USelectMenu v-model="filterLocation" :options="locationOptions" value-attribute="value" option-attribute="label" placeholder="Sucursal" size="sm" class="w-44" />
      <USelectMenu v-model="filterAlert" :options="alertOptions" value-attribute="value" option-attribute="label" placeholder="Estado" size="sm" class="w-40" />
      <div class="ml-auto text-xs text-gray-400">{{ filteredItems.length }} artículo{{ filteredItems.length !== 1 ? 's' : '' }}</div>
    </div>

    <!-- ── Table ── -->
    <div class="flex-1 overflow-y-auto">
      <table class="w-full text-left text-sm">
        <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Artículo</th>
            <th class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Categoría</th>
            <th class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase text-right">Stock total</th>
            <th class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase text-right">Disponible</th>
            <th class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase text-right">Mín.</th>
            <th class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Lotes</th>
            <th class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Proveedor</th>
            <th class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase text-right">Coste/ud</th>
            <th class="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Alertas</th>
            <th class="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
            <td class="px-4 py-3">
              <div class="font-medium text-gray-900 dark:text-white">{{ item.name }}</div>
              <div class="text-[11px] text-gray-400">{{ item.location }}</div>
            </td>
            <td class="px-4 py-3">
              <UBadge color="gray" variant="soft" size="xs">{{ warehouseCategoryLabels[item.category as keyof typeof warehouseCategoryLabels] || item.category }}</UBadge>
            </td>
            <td class="px-4 py-3 text-right font-medium">{{ item.currentStock }} {{ warehouseUnitLabels[item.unit as keyof typeof warehouseUnitLabels] || item.unit }}</td>
            <td class="px-4 py-3 text-right font-semibold" :class="getAvailableStock(item) <= item.minimumStock ? 'text-red-600' : 'text-green-600'">
              {{ getAvailableStock(item).toFixed(1) }} {{ warehouseUnitLabels[item.unit as keyof typeof warehouseUnitLabels] || item.unit }}
            </td>
            <td class="px-4 py-3 text-right text-gray-500">{{ item.minimumStock }}</td>
            <td class="px-4 py-3">
              <button
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400"
                @click="openBatchModal(item)"
              >
                <UIcon name="i-lucide-layers" class="w-3 h-3" />
                {{ item.batchCount }} lote{{ item.batchCount !== 1 ? 's' : '' }}
              </button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ item.supplier }}</td>
            <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{{ formatEur(item.costPerUnit) }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-1">
                <UTooltip v-for="alert in getRowAlerts(item)" :key="alert.text" :text="alert.text">
                  <UIcon :name="alert.icon" class="w-4 h-4" :class="alert.color" />
                </UTooltip>
              </div>
            </td>
            <td class="px-2 py-3 text-right">
              <UDropdown :items="rowActions(item)" :popper="{ placement: 'bottom-end' }">
                <UButton icon="i-lucide-more-vertical" color="gray" variant="ghost" size="xs" class="opacity-0 group-hover:opacity-100 transition-opacity" />
              </UDropdown>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredItems.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <UIcon name="i-lucide-package-x" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p class="text-sm text-gray-500">No se encontraron artículos con los filtros actuales.</p>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         MODAL — NUEVO ARTÍCULO + PRIMER LOTE
    ══════════════════════════════════════ -->
    <UModal v-model="showNewModal" :ui="{ width: 'max-w-2xl' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Nuevo artículo</h3>
          <UButton icon="i-lucide-x" color="gray" variant="ghost" size="sm" @click="showNewModal = false; resetNewForm()" />
        </div>

        <!-- Producto -->
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Datos del producto</p>
        <div class="grid grid-cols-2 gap-4 mb-5">
          <div class="col-span-2">
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Nombre *</label>
            <UInput v-model="newForm.name" placeholder="Ej: Tomate cherry" size="sm" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Categoría</label>
            <USelectMenu v-model="newForm.category" :options="categoryOptions" value-attribute="value" option-attribute="label" size="sm" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Unidad</label>
            <USelectMenu v-model="newForm.unit" :options="unitOptions" value-attribute="value" option-attribute="label" size="sm" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Stock mínimo</label>
            <UInput v-model.number="newForm.minimumStock" type="number" step="0.1" size="sm" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Sucursal</label>
            <USelectMenu v-model="newForm.branchId" :options="branchOptions" value-attribute="value" option-attribute="label" placeholder="Seleccionar sucursal" size="sm" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Zona interna</label>
            <UInput v-model="newForm.location" placeholder="Ej: Cámara fría A" size="sm" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Notas</label>
            <UInput v-model="newForm.notes" placeholder="Notas opcionales" size="sm" class="w-full" />
          </div>
        </div>

        <!-- Primer lote -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <UIcon name="i-lucide-layers" class="w-3.5 h-3.5" /> Primer lote
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Cantidad</label>
              <UInput v-model.number="newBatch.quantity" type="number" step="0.1" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Fecha de caducidad</label>
              <UInput v-model="newBatch.expiryDate" type="date" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Fecha de recepción</label>
              <UInput v-model="newBatch.receivedAt" type="date" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Coste / ud (€)</label>
              <UInput v-model.number="newBatch.costPerUnit" type="number" step="0.01" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Proveedor</label>
              <UInput v-model="newBatch.supplier" placeholder="Nombre del proveedor" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Notas del lote</label>
              <UInput v-model="newBatch.notes" placeholder="Notas opcionales" size="sm" class="w-full" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-2">
          <UButton color="gray" variant="ghost" size="sm" @click="showNewModal = false; resetNewForm()">Cancelar</UButton>
          <UButton icon="i-lucide-plus" color="primary" variant="solid" size="sm" :loading="newSaving" @click="handleCreateItem">Crear artículo</UButton>
        </div>
      </div>
    </UModal>

    <!-- ══════════════════════════════════════
         MODAL — EDITAR ARTÍCULO (sin stock/lotes)
    ══════════════════════════════════════ -->
    <UModal v-model="showEditModal" :ui="{ width: 'max-w-xl' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Editar artículo</h3>
          <UButton icon="i-lucide-x" color="gray" variant="ghost" size="sm" @click="showEditModal = false" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Nombre *</label>
            <UInput v-model="editForm.name" size="sm" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Categoría</label>
            <USelectMenu v-model="editForm.category" :options="categoryOptions" value-attribute="value" option-attribute="label" size="sm" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Unidad</label>
            <USelectMenu v-model="editForm.unit" :options="unitOptions" value-attribute="value" option-attribute="label" size="sm" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Sucursal</label>
            <USelectMenu v-model="editForm.branchId" :options="branchOptions" value-attribute="value" option-attribute="label" placeholder="Seleccionar sucursal" size="sm" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Zona interna</label>
            <UInput v-model="editForm.location" size="sm" class="w-full" />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Notas</label>
            <UTextarea v-model="editForm.notes" :rows="2" size="sm" class="w-full" />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-5">
          <UButton color="gray" variant="ghost" size="sm" @click="showEditModal = false">Cancelar</UButton>
          <UButton icon="i-lucide-check" color="primary" variant="solid" size="sm" :loading="editSaving" @click="handleSaveEdit">Guardar cambios</UButton>
        </div>
      </div>
    </UModal>

    <!-- ══════════════════════════════════════
         MODAL — GESTIONAR LOTES
    ══════════════════════════════════════ -->
    <UModal v-model="showBatchModal" :ui="{ width: 'max-w-lg' }">
      <div class="p-6" v-if="batchItem">

        <!-- Header siempre visible -->
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <button v-if="batchModalMode !== 'list'" class="text-gray-400 hover:text-gray-600" @click="batchModalMode = 'list'">
              <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            </button>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              <span v-if="batchModalMode === 'list'">Lotes — {{ batchItem.name }}</span>
              <span v-else-if="batchModalMode === 'edit'">Editar lote</span>
              <span v-else-if="batchModalMode === 'delete'">Eliminar lote</span>
              <span v-else>Nuevo lote</span>
            </h3>
          </div>
          <UButton icon="i-lucide-x" color="gray" variant="ghost" size="sm" @click="showBatchModal = false" />
        </div>
        <p class="text-xs text-gray-400 mb-5">Stock total: <strong>{{ batchItem.currentStock }} {{ warehouseUnitLabels[batchItem.unit as WarehouseUnit] }}</strong></p>

        <!-- MODE: LIST -->
        <template v-if="batchModalMode === 'list'">
          <div v-if="batchLoading" class="flex justify-center py-8">
            <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-gray-400" />
          </div>
          <div v-else>
            <div v-if="batchList.length === 0" class="text-center py-8 text-sm text-gray-400">Sin lotes registrados</div>
            <div v-else class="space-y-2 mb-4">
              <div
                v-for="(batch, idx) in batchList"
                :key="batch.id"
                class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
              >
                <div>
                  <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Lote {{ idx + 1 }} — {{ batch.quantity }} {{ warehouseUnitLabels[batchItem.unit as WarehouseUnit] }}
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5 flex gap-3">
                    <span v-if="batch.expiryDate">Caduca: <span :class="new Date(batch.expiryDate) < new Date() ? 'text-red-500 font-medium' : 'text-gray-600'">{{ formatDate(batch.expiryDate) }}</span></span>
                    <span v-else>Sin caducidad</span>
                    <span v-if="batch.supplier">· {{ batch.supplier }}</span>
                    <span v-if="batch.costPerUnit">· {{ formatEur(batch.costPerUnit) }}/ud</span>
                  </div>
                </div>
                <div class="flex gap-1">
                  <UButton icon="i-lucide-pencil" color="gray" variant="ghost" size="xs" @click="selectBatchForEdit(batch)" />
                  <UButton icon="i-lucide-trash-2" color="red" variant="ghost" size="xs" @click="selectBatchForDelete(batch)" />
                </div>
              </div>
            </div>
            <UButton icon="i-lucide-plus" color="primary" variant="solid" size="sm" block @click="goCreateBatch">Añadir nuevo lote</UButton>
          </div>
        </template>

        <!-- MODE: EDIT BATCH -->
        <template v-else-if="batchModalMode === 'edit'">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Cantidad</label>
              <UInput v-model.number="batchEditForm.quantity" type="number" step="0.1" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Fecha de caducidad</label>
              <UInput v-model="batchEditForm.expiryDate" type="date" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Fecha de recepción</label>
              <UInput v-model="batchEditForm.receivedAt" type="date" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Coste / ud (€)</label>
              <UInput v-model.number="batchEditForm.costPerUnit" type="number" step="0.01" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Proveedor</label>
              <UInput v-model="batchEditForm.supplier" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Notas</label>
              <UInput v-model="batchEditForm.notes" size="sm" class="w-full" />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-5">
            <UButton color="gray" variant="ghost" size="sm" @click="batchModalMode = 'list'">Cancelar</UButton>
            <UButton icon="i-lucide-check" color="primary" size="sm" :loading="batchSaving" @click="handleSaveBatchEdit">Guardar lote</UButton>
          </div>
        </template>

        <!-- MODE: DELETE BATCH -->
        <template v-else-if="batchModalMode === 'delete'">
          <div class="rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 mb-5">
            <p class="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">¿Eliminar este lote?</p>
            <p class="text-xs text-red-600 dark:text-red-400">
              Lote de <strong>{{ selectedBatch?.quantity }} {{ warehouseUnitLabels[batchItem.unit as WarehouseUnit] }}</strong>
              <template v-if="selectedBatch?.expiryDate"> — caduca el {{ formatDate(selectedBatch.expiryDate) }}</template>.
              El stock total del artículo se reducirá en esta cantidad.
            </p>
          </div>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" size="sm" @click="batchModalMode = 'list'">Cancelar</UButton>
            <UButton icon="i-lucide-trash-2" color="red" size="sm" :loading="batchSaving" @click="handleDeleteBatch">Eliminar lote</UButton>
          </div>
        </template>

        <!-- MODE: CREATE BATCH -->
        <template v-else-if="batchModalMode === 'create'">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Cantidad</label>
              <UInput v-model.number="batchCreateForm.quantity" type="number" step="0.1" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Fecha de caducidad</label>
              <UInput v-model="batchCreateForm.expiryDate" type="date" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Fecha de recepción</label>
              <UInput v-model="batchCreateForm.receivedAt" type="date" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Coste / ud (€)</label>
              <UInput v-model.number="batchCreateForm.costPerUnit" type="number" step="0.01" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Proveedor</label>
              <UInput v-model="batchCreateForm.supplier" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Notas</label>
              <UInput v-model="batchCreateForm.notes" size="sm" class="w-full" />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-5">
            <UButton color="gray" variant="ghost" size="sm" @click="batchModalMode = 'list'">Cancelar</UButton>
            <UButton icon="i-lucide-plus" color="primary" size="sm" :loading="batchSaving" @click="handleCreateBatch">Crear lote</UButton>
          </div>
        </template>

      </div>
    </UModal>

    <!-- ══════════════════════════════════════
         MODAL — EDICIÓN MASIVA (spreadsheet)
    ══════════════════════════════════════ -->
    <UModal v-model="showBulkModal" fullscreen>
      <div class="flex flex-col h-full bg-white dark:bg-gray-950">
        <div class="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-table-2" class="w-5 h-5" />
              Edición masiva
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">Edita celdas directamente. Para modificar lotes / caducidades usa el botón de lotes.</p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge v-if="dirtyCount > 0" color="orange" variant="subtle" size="sm">{{ dirtyCount }} cambio{{ dirtyCount !== 1 ? 's' : '' }} pendiente{{ dirtyCount !== 1 ? 's' : '' }}</UBadge>
            <UButton color="gray" variant="ghost" size="sm" @click="showBulkModal = false">Cancelar</UButton>
            <UButton icon="i-lucide-save" color="primary" variant="solid" size="sm" :loading="bulkSaving" :disabled="dirtyCount === 0" @click="handleBulkSave">
              Guardar {{ dirtyCount > 0 ? `(${dirtyCount})` : 'cambios' }}
            </UButton>
          </div>
        </div>
        <div class="flex-1 overflow-auto">
          <table class="w-full text-sm border-collapse">
            <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th class="px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase text-left min-w-48">Nombre</th>
                <th class="px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase text-left w-36">Categoría</th>
                <th class="px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase text-left w-24">Unidad</th>
                <th class="px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase text-right w-28">Stock total</th>
                <th class="px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase text-right w-24">Stock mín.</th>
                <th class="px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase text-right w-28">Coste/ud €</th>
                <th class="px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase text-left w-36">Proveedor</th>
                <th class="px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase text-left w-36">Zona</th>
                <th class="px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase text-center w-28">Lotes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="row in bulkRows" :key="row.id"
                :class="row._dirty ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/20'"
              >
                <td class="px-1 py-1"><input v-model="row.name" class="bulk-cell w-full" @input="markDirty(row)" /></td>
                <td class="px-1 py-1">
                  <select v-model="row.category" class="bulk-cell w-full" @change="markDirty(row)">
                    <option v-for="opt in categoryOptions.slice(1)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </td>
                <td class="px-1 py-1">
                  <select v-model="row.unit" class="bulk-cell w-full" @change="markDirty(row)">
                    <option v-for="opt in unitOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </td>
                <td class="px-1 py-1 text-right text-gray-500 text-xs pr-3">{{ row.currentStock }}</td>
                <td class="px-1 py-1"><input v-model.number="row.minimumStock" type="number" step="0.1" class="bulk-cell w-full text-right" @input="markDirty(row)" /></td>
                <td class="px-1 py-1"><input v-model.number="row.costPerUnit" type="number" step="0.01" class="bulk-cell w-full text-right" @input="markDirty(row)" /></td>
                <td class="px-1 py-1"><input v-model="row.supplier" class="bulk-cell w-full" @input="markDirty(row)" /></td>
                <td class="px-1 py-1"><input v-model="row.location" class="bulk-cell w-full" @input="markDirty(row)" /></td>
                <td class="px-1 py-1 text-center">
                  <button
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400"
                    @click="openBulkBatches(row)"
                  >
                    <UIcon name="i-lucide-layers" class="w-3 h-3" />
                    {{ row.batchCount }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UModal>

  </div>
</template>

<style scoped>
.bulk-cell {
  @apply px-2 py-1.5 text-sm bg-transparent border border-transparent rounded hover:border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors w-full;
}
</style>
