/* ─────────────────────────────────────────────────────────
   Inventory Store — Single source of truth for stock levels.
   Backed by /api/catalog/inventory endpoints.
   ───────────────────────────────────────────────────────── */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InventoryLevel } from '~/types/commerce'

export const useInventoryStore = defineStore('inventory', () => {
  /* ── State ── */
  const levels = ref<InventoryLevel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /* ── Computed ── */
  const outOfStock = computed(() =>
    levels.value.filter(l => l.tracked && l.available === 0)
  )

  const lowStock = computed(() =>
    levels.value.filter(l => l.tracked && l.available > 0 && l.available <= l.lowStockThreshold)
  )

  const inStock = computed(() =>
    levels.value.filter(l => !l.tracked || l.available > l.lowStockThreshold)
  )

  /* ── Fetchers ── */
  const fetchInventory = async (params?: { productId?: string; lowStock?: boolean; outOfStock?: boolean }) => {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      if (params?.productId) query.set('productId', params.productId)
      if (params?.lowStock) query.set('lowStock', 'true')
      if (params?.outOfStock) query.set('outOfStock', 'true')
      const qs = query.toString()
      levels.value = await $fetch<InventoryLevel[]>(`/api/catalog/inventory${qs ? '?' + qs : ''}`)
    } catch (e: any) {
      error.value = e?.message || 'Error loading inventory'
    } finally {
      loading.value = false
    }
  }

  /* ── Mutations ── */
  const updateStock = async (variantId: string, available: number): Promise<InventoryLevel | null> => {
    try {
      const updated = await $fetch<InventoryLevel>('/api/catalog/inventory', {
        method: 'PUT',
        body: { variantId, available },
      })
      const idx = levels.value.findIndex(l => l.variantId === variantId)
      if (idx >= 0) levels.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e?.message || 'Error updating stock'
      return null
    }
  }

  const updateLevel = async (variantId: string, data: Partial<InventoryLevel>): Promise<InventoryLevel | null> => {
    try {
      const updated = await $fetch<InventoryLevel>('/api/catalog/inventory', {
        method: 'PUT',
        body: { variantId, ...data },
      })
      const idx = levels.value.findIndex(l => l.variantId === variantId)
      if (idx >= 0) levels.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e?.message || 'Error updating inventory level'
      return null
    }
  }

  /* ── Getters ── */
  const getByVariantId = (variantId: string) =>
    levels.value.find(l => l.variantId === variantId) ?? null

  const getByProductId = (productId: string) =>
    levels.value.filter(l => l.productId === productId)

  const isAvailable = (variantId: string): boolean => {
    const level = getByVariantId(variantId)
    if (!level) return false
    if (!level.tracked) return true
    return level.available > 0
  }

  const getStock = (variantId: string): number => {
    const level = getByVariantId(variantId)
    return level?.available ?? 0
  }

  return {
    /* state */
    levels,
    loading,
    error,
    /* computed */
    outOfStock,
    lowStock,
    inStock,
    /* fetchers */
    fetchInventory,
    /* mutations */
    updateStock,
    updateLevel,
    /* getters */
    getByVariantId,
    getByProductId,
    isAvailable,
    getStock,
  }
})
