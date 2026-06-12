import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WarehouseItem, WarehouseBatch, Recipe, PurchaseOrder } from '~/types/studio'

export const useStudioStore = defineStore('studio', () => {
  /* ── State ── */
  const warehouseItems = ref<WarehouseItem[]>([])
  const batchesByItem = ref<Record<string, WarehouseBatch[]>>({})
  const recipes = ref<Recipe[]>([])
  const purchaseOrders = ref<PurchaseOrder[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /* ── Computed ── */
  const lowStockItems = computed(() =>
    warehouseItems.value.filter(i => (i.currentStock - i.committedStock) <= i.minimumStock)
  )

  const expiringSoonItems = computed(() =>
    warehouseItems.value.filter(i => {
      if (!i.nearestExpiryDate) return false
      const diff = new Date(i.nearestExpiryDate).getTime() - Date.now()
      return diff > 0 && diff < 3 * 86400000
    })
  )

  const activeRecipes = computed(() => recipes.value.filter(r => r.status === 'active'))

  const pendingOrders = computed(() =>
    purchaseOrders.value.filter(po => po.status === 'draft' || po.status === 'ordered')
  )

  /* ── Fetchers ── */
  const fetchWarehouse = async () => {
    loading.value = true
    error.value = null
    try {
      warehouseItems.value = await $fetch<WarehouseItem[]>('/api/studio/warehouse')
    } catch (e: any) {
      error.value = e?.message || 'Error cargando almacén'
    } finally {
      loading.value = false
    }
  }

  const fetchRecipes = async () => {
    loading.value = true
    error.value = null
    try {
      recipes.value = await $fetch<Recipe[]>('/api/studio/recipes')
    } catch (e: any) {
      error.value = e?.message || 'Error cargando recetas'
    } finally {
      loading.value = false
    }
  }

  const fetchPurchaseOrders = async () => {
    loading.value = true
    error.value = null
    try {
      purchaseOrders.value = await $fetch<PurchaseOrder[]>('/api/studio/purchase-orders')
    } catch (e: any) {
      error.value = e?.message || 'Error cargando órdenes'
    } finally {
      loading.value = false
    }
  }

  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const [wh, rec, po] = await Promise.all([
        $fetch<WarehouseItem[]>('/api/studio/warehouse'),
        $fetch<Recipe[]>('/api/studio/recipes'),
        $fetch<PurchaseOrder[]>('/api/studio/purchase-orders'),
      ])
      warehouseItems.value = wh
      recipes.value = rec
      purchaseOrders.value = po
    } catch (e: any) {
      error.value = e?.message || 'Error cargando datos del estudio'
    } finally {
      loading.value = false
    }
  }

  /* ── Mutations ── */
  const createWarehouseItem = async (data: Partial<WarehouseItem>) => {
    try {
      const created = await $fetch<WarehouseItem>('/api/studio/warehouse', { method: 'POST', body: data })
      warehouseItems.value.push(created)
      return created
    } catch (e: any) {
      error.value = e?.message || 'Error creando artículo'
      return null
    }
  }

  const updateWarehouseItem = async (id: string, data: Partial<WarehouseItem>) => {
    try {
      const updated = await $fetch<WarehouseItem>(`/api/studio/warehouse/${id}`, { method: 'PUT', body: data })
      const idx = warehouseItems.value.findIndex(i => i.id === id)
      if (idx >= 0) warehouseItems.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e?.message || 'Error actualizando artículo'
      return null
    }
  }

  /* ── Batch (Lote) actions ── */
  const fetchBatches = async (itemId: string) => {
    try {
      const batches = await $fetch<WarehouseBatch[]>(`/api/studio/warehouse/${itemId}/batches`)
      batchesByItem.value[itemId] = batches
      return batches
    } catch (e: any) {
      error.value = e?.message || 'Error cargando lotes'
      return []
    }
  }

  const createBatch = async (itemId: string, data: Partial<WarehouseBatch>) => {
    try {
      const batch = await $fetch<WarehouseBatch>(`/api/studio/warehouse/${itemId}/batches`, { method: 'POST', body: data })
      if (!batchesByItem.value[itemId]) batchesByItem.value[itemId] = []
      batchesByItem.value[itemId].push(batch)
      await _refreshItemStock(itemId)
      return batch
    } catch (e: any) {
      error.value = e?.message || 'Error creando lote'
      return null
    }
  }

  const updateBatch = async (itemId: string, batchId: string, data: Partial<WarehouseBatch>) => {
    try {
      const batch = await $fetch<WarehouseBatch>(`/api/studio/warehouse/${itemId}/batches/${batchId}`, { method: 'PUT', body: data })
      const list = batchesByItem.value[itemId]
      if (list) {
        const idx = list.findIndex(b => b.id === batchId)
        if (idx >= 0) list[idx] = batch
      }
      await _refreshItemStock(itemId)
      return batch
    } catch (e: any) {
      error.value = e?.message || 'Error actualizando lote'
      return null
    }
  }

  const deleteBatch = async (itemId: string, batchId: string) => {
    try {
      const res = await $fetch<{ ok: boolean; newStock: number }>(`/api/studio/warehouse/${itemId}/batches/${batchId}`, { method: 'DELETE' })
      if (batchesByItem.value[itemId]) {
        batchesByItem.value[itemId] = batchesByItem.value[itemId].filter(b => b.id !== batchId)
      }
      const idx = warehouseItems.value.findIndex(i => i.id === itemId)
      if (idx >= 0) {
        warehouseItems.value[idx] = {
          ...warehouseItems.value[idx],
          currentStock: res.newStock,
          batchCount: (batchesByItem.value[itemId] ?? []).length,
        }
      }
      return true
    } catch (e: any) {
      error.value = e?.message || 'Error eliminando lote'
      return false
    }
  }

  const _refreshItemStock = async (itemId: string) => {
    try {
      const batches = batchesByItem.value[itemId] ?? []
      const newStock = batches.reduce((s, b) => s + b.quantity, 0)
      const nearestExpiry = batches
        .map(b => b.expiryDate)
        .filter(Boolean)
        .sort()[0] ?? null
      const idx = warehouseItems.value.findIndex(i => i.id === itemId)
      if (idx >= 0) {
        warehouseItems.value[idx] = {
          ...warehouseItems.value[idx],
          currentStock: newStock,
          batchCount: batches.length,
          nearestExpiryDate: nearestExpiry,
        }
      }
    } catch {}
  }

  const updatePurchaseOrder = async (id: string, data: Partial<PurchaseOrder>) => {
    try {
      const updated = await $fetch<PurchaseOrder>(`/api/studio/purchase-orders/${id}`, { method: 'PUT', body: data })
      const idx = purchaseOrders.value.findIndex(po => po.id === id)
      if (idx >= 0) purchaseOrders.value[idx] = { ...purchaseOrders.value[idx], ...updated }
      return updated
    } catch {
      return null
    }
  }

  /* ── Getters ── */
  const getWarehouseItemById = (id: string) => warehouseItems.value.find(i => i.id === id) ?? null
  const getRecipeById = (id: string) => recipes.value.find(r => r.id === id) ?? null
  const getRecipeByProductId = (pid: string) => recipes.value.find(r => r.productId === pid) ?? null
  const getRecipeByProductName = (name: string) => {
    if (!name) return null
    const lower = name.toLowerCase()
    return recipes.value.find(r => r.productName?.toLowerCase() === lower)
      ?? recipes.value.find(r => (r.productName?.toLowerCase().includes(lower) || lower.includes(r.productName?.toLowerCase() ?? '__')))
      ?? null
  }

  return {
    warehouseItems, batchesByItem, recipes, purchaseOrders, loading, error,
    lowStockItems, expiringSoonItems, activeRecipes, pendingOrders,
    fetchWarehouse, fetchRecipes, fetchPurchaseOrders, fetchAll,
    createWarehouseItem, updateWarehouseItem, updatePurchaseOrder,
    fetchBatches, createBatch, updateBatch, deleteBatch,
    getWarehouseItemById, getRecipeById, getRecipeByProductId, getRecipeByProductName,
  }
})
