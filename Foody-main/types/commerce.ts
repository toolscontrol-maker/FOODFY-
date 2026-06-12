/* ─────────────────────────────────────────────────────────
   Commerce Types — Single source of truth for all business
   data models used across backend API and frontend stores.
   ───────────────────────────────────────────────────────── */

/* ── Product Status ── */
export type ProductStatus = 'active' | 'draft' | 'archived'

/* ── Variant Option (e.g. Size: Grande) ── */
export interface VariantOption {
  name: string
  value: string
}

/* ── Product Variant ── */
export interface ProductVariant {
  id: string
  productId: string
  name: string
  price: number
  compareAtPrice: number | null
  sku: string
  barcode: string
  inventoryQuantity: number
  availableForSale: boolean
  image: string
  options: VariantOption[]
  weight: number
  weightUnit: 'g' | 'kg'
  position: number
}

/* ── Product Image ── */
export interface ProductImage {
  id: string
  url: string
  alt: string
  position: number
}

/* ── Modifier Option (extras, removals, cooking prefs) ── */
export interface ModifierOption {
  id: string
  label: string
  price: number
}

/* ── Modifier Group ── */
export interface ModifierGroup {
  id: string
  name: string
  type: 'single' | 'multiple'
  required: boolean
  maxSelect: number
  options: ModifierOption[]
}

/* ── Product ── */
export interface Product {
  id: string
  handle: string
  name: string
  description: string
  categoryId: string
  categoryName: string
  vendor: string
  type: string
  tags: string[]
  status: ProductStatus
  publishedAt: string | null
  images: ProductImage[]
  variants: ProductVariant[]
  modifiers: ModifierGroup[]
  templateSuffix: string
  createdAt: string
  updatedAt: string
}

/* ── Computed helpers for Product ── */
export function getProductPrice(product: Product): number {
  return product.variants[0]?.price ?? 0
}

export function getProductCompareAtPrice(product: Product): number | null {
  return product.variants[0]?.compareAtPrice ?? null
}

export function getProductCoverImage(product: Product): string {
  return product.images[0]?.url ?? ''
}

export function isProductAvailable(product: Product): boolean {
  return product.status === 'active' && product.variants.some(v => v.availableForSale)
}

export function getProductTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0)
}

/* ── Collection Type ── */
export type CollectionType = 'manual' | 'automated'
export type CollectionStatus = 'active' | 'draft'

/* ── Collection Sort Order ── */
export type CollectionSortOrder =
  | 'manual'
  | 'best-selling'
  | 'alpha-asc'
  | 'alpha-desc'
  | 'price-asc'
  | 'price-desc'
  | 'created-desc'
  | 'created-asc'

/* ── Collection ── */
export interface Collection {
  id: string
  handle: string
  title: string
  description: string
  image: string
  type: CollectionType
  status: CollectionStatus
  productIds: string[]
  sortOrder: CollectionSortOrder
  themeTemplate: string
  createdAt: string
  updatedAt: string
}

/* ── Inventory Level ── */
export interface InventoryLevel {
  variantId: string
  productId: string
  sku: string
  productName: string
  variantName: string
  available: number
  incoming: number
  reserved: number
  tracked: boolean
  lowStockThreshold: number
  image: string
}

/* ── Analytics Event Types ── */
export type AnalyticsEventType =
  | 'product_viewed'
  | 'collection_viewed'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'quantity_changed'
  | 'search'
  | 'cta_clicked'
  | 'banner_viewed'
  | 'checkout_started'
  | 'page_viewed'

/* ── Analytics Event ── */
export interface AnalyticsEvent {
  id: string
  type: AnalyticsEventType
  timestamp: string
  sessionId: string
  payload: Record<string, unknown>
}

/* ── Category (lightweight) ── */
export interface Category {
  id: string
  name: string
  slug: string
  position: number
}
