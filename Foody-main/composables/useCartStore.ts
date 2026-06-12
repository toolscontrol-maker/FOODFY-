/* ─────────────────────────────────────────────────────────
   Cart Store — Transient cart state for the theme editor.
   NOT saved with the theme — lives only during the editor
   session. Config (drawer vs page, vendor, note, scheme)
   lives in ThemeGlobalSettings.cart.
   ───────────────────────────────────────────────────────── */
import { ref, computed } from 'vue'

/* ── Types ── */
export interface CartLineItem {
  id: string
  variantId?: string
  productName: string
  variantName: string
  vendor: string
  price: number
  compareAtPrice: number | null
  quantity: number
  image: string
}

export type CartPreviewMode = 'live' | 'empty' | 'single' | 'multi'

/* ── Mock product catalog ── */
export const MOCK_PRODUCTS: Omit<CartLineItem, 'id' | 'quantity'>[] = [
  { productName: 'Hamburguesa clásica', variantName: 'Normal', vendor: 'Foodfy Kitchen', price: 9.50, compareAtPrice: 12.00, image: '' },
  { productName: 'Pizza Margherita', variantName: 'Mediana', vendor: 'Foodfy Kitchen', price: 11.90, compareAtPrice: null, image: '' },
  { productName: 'Ensalada César', variantName: 'Grande', vendor: 'Foodfy Fresh', price: 8.75, compareAtPrice: 10.50, image: '' },
  { productName: 'Wrap de pollo', variantName: 'Normal', vendor: 'Foodfy Kitchen', price: 7.20, compareAtPrice: null, image: '' },
  { productName: 'Nachos con guacamole', variantName: 'Para compartir', vendor: 'Foodfy Snacks', price: 6.50, compareAtPrice: 8.00, image: '' },
  { productName: 'Smoothie tropical', variantName: '500ml', vendor: 'Foodfy Drinks', price: 4.90, compareAtPrice: null, image: '' },
]

/* ── Recommended products (for empty cart state) ── */
export const RECOMMENDED_PRODUCTS = [
  { name: 'Bowl de açaí', price: 8.90, image: '' },
  { name: 'Tostada de aguacate', price: 7.50, image: '' },
  { name: 'Zumo verde detox', price: 5.20, image: '' },
  { name: 'Muffin de arándanos', price: 3.80, image: '' },
]

/* ── Currency formatter (cart-scoped, avoids conflict with useStorefrontData) ── */
export function formatCartCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })
}

/* ── Singleton state (shared across the editor session) ── */
const items = ref<CartLineItem[]>([])
const note = ref('')
const isDrawerOpen = ref(false)
const previewMode = ref<CartPreviewMode>('live')

let _idCounter = 0
function nextId(): string {
  return `cart-${Date.now()}-${++_idCounter}`
}

/* ── Stable mock items for preview modes (generated once) ── */
const _mockSingle: CartLineItem[] = [{ id: 'mock-single-1', ...MOCK_PRODUCTS[0], quantity: 1 }]
const _mockMulti: CartLineItem[] = MOCK_PRODUCTS.slice(0, 3).map((p, i) => ({ id: `mock-multi-${i}`, ...p, quantity: i + 1 }))

/* ── Composable ── */
export function useCartStore() {
  /* ── Computed ── */
  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const isEmpty = computed(() => items.value.length === 0)

  /* ── Effective items (respects preview mode) ── */
  const effectiveItems = computed<CartLineItem[]>(() => {
    switch (previewMode.value) {
      case 'empty':
        return []
      case 'single':
        return items.value.length > 0 ? [items.value[0]] : _mockSingle
      case 'multi':
        return items.value.length >= 2 ? items.value : _mockMulti
      default: // 'live'
        return items.value
    }
  })

  const effectiveSubtotal = computed(() => effectiveItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const effectiveCount = computed(() => effectiveItems.value.reduce((sum, i) => sum + i.quantity, 0))
  const effectiveIsEmpty = computed(() => effectiveItems.value.length === 0)

  /* ── Actions ── */
  const addItem = (product?: Omit<CartLineItem, 'id' | 'quantity'>, options?: { maxStock?: number }) => {
    const p = product ?? MOCK_PRODUCTS[0]
    const matchKey = p.variantId
      ? (i: CartLineItem) => i.variantId === p.variantId
      : (i: CartLineItem) => i.productName === p.productName && i.variantName === p.variantName
    const existing = items.value.find(matchKey)
    if (existing) {
      if (options?.maxStock != null && existing.quantity >= options.maxStock) return false
      existing.quantity++
    } else {
      items.value.push({ id: nextId(), ...p, quantity: 1 })
    }
    previewMode.value = 'live'
    return true
  }

  const removeItem = (itemId: string) => {
    const idx = items.value.findIndex(i => i.id === itemId)
    if (idx !== -1) items.value.splice(idx, 1)
  }

  const updateQuantity = (itemId: string, qty: number) => {
    const item = items.value.find(i => i.id === itemId)
    if (!item) return
    if (qty <= 0) {
      removeItem(itemId)
    } else {
      item.quantity = qty
    }
  }

  const clearCart = () => {
    items.value = []
    note.value = ''
  }

  const openDrawer = () => { isDrawerOpen.value = true }
  const closeDrawer = () => { isDrawerOpen.value = false }
  const toggleDrawer = () => { isDrawerOpen.value = !isDrawerOpen.value }

  const setPreviewMode = (mode: CartPreviewMode) => {
    previewMode.value = mode
  }

  return {
    /* state */
    items,
    note,
    isDrawerOpen,
    previewMode,
    /* computed */
    itemCount,
    subtotal,
    isEmpty,
    effectiveItems,
    effectiveSubtotal,
    effectiveCount,
    effectiveIsEmpty,
    /* actions */
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    setPreviewMode,
  }
}
