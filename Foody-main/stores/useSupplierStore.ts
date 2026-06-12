import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Supplier, SupplierProduct, PurchaseCartItem } from '~/types/studio'

export const useSupplierStore = defineStore('suppliers', () => {
  /* ── State ── */
  const suppliers = ref<Supplier[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cartItems = ref<PurchaseCartItem[]>([])

  /* ── Computed ── */
  const cartTotal = computed(() =>
    cartItems.value.reduce((sum, i) => sum + i.supplierProduct.pricePerUnit * i.quantity, 0)
  )

  const cartCount = computed(() =>
    cartItems.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  const cartBySupplier = computed(() => {
    const map = new Map<string, { supplier: Supplier; items: PurchaseCartItem[] }>()
    for (const ci of cartItems.value) {
      const sid = ci.supplier.id
      if (!map.has(sid)) map.set(sid, { supplier: ci.supplier, items: [] })
      map.get(sid)!.items.push(ci)
    }
    return [...map.values()]
  })

  /* ── Fetch ── */
  const fetchSuppliers = async () => {
    loading.value = true
    error.value = null
    try {
      suppliers.value = await $fetch<Supplier[]>('/api/studio/suppliers')
    } catch (e: any) {
      error.value = e?.message || 'Error cargando proveedores'
    } finally {
      loading.value = false
    }
  }

  /* ── Cart actions ── */
  const addToCart = (supplier: Supplier, product: SupplierProduct, qty: number) => {
    const existing = cartItems.value.find(ci => ci.supplierProduct.id === product.id)
    if (existing) {
      existing.quantity = qty
    } else {
      cartItems.value.push({ supplier, supplierProduct: product, quantity: qty })
    }
  }

  const updateCartQty = (productId: string, qty: number) => {
    const item = cartItems.value.find(ci => ci.supplierProduct.id === productId)
    if (item) {
      if (qty <= 0) removeFromCart(productId)
      else item.quantity = qty
    }
  }

  const removeFromCart = (productId: string) => {
    cartItems.value = cartItems.value.filter(ci => ci.supplierProduct.id !== productId)
  }

  const clearCart = () => {
    cartItems.value = []
  }

  /* ── Submit order ── */
  const submitOrder = async (notesBySupplier: Record<string, string> = {}) => {
    const groups = cartBySupplier.value
    const created = []

    for (const { supplier, items } of groups) {
      const totalCost = items.reduce(
        (s, ci) => s + ci.supplierProduct.pricePerUnit * ci.quantity,
        0
      )
      const po = await $fetch('/api/studio/purchase-orders', {
        method: 'POST',
        body: {
          supplier: supplier.name,
          status: 'ordered',
          totalCost,
          notes: notesBySupplier[supplier.id] ?? '',
          items: items.map(ci => ({
            warehouseItemId: ci.supplierProduct.warehouseItemId ?? '',
            quantity: ci.quantity,
            unit: ci.supplierProduct.unit,
            unitCost: ci.supplierProduct.pricePerUnit,
          })),
        },
      })
      created.push(po)
    }

    clearCart()
    return created
  }

  /* ── Getters ── */
  const getSupplierById = (id: string) => suppliers.value.find(s => s.id === id) ?? null

  const allProducts = computed(() =>
    suppliers.value.flatMap(s => s.products.map(p => ({ ...p, supplier: s })))
  )

  return {
    suppliers, loading, error,
    cartItems, cartTotal, cartCount, cartBySupplier,
    fetchSuppliers, getSupplierById, allProducts,
    addToCart, updateCartQty, removeFromCart, clearCart, submitOrder,
  }
})
