/* ─────────────────────────────────────────────────────────
   Studio Types — Warehouse, Recipes & Purchase Orders
   ───────────────────────────────────────────────────────── */

/* ── Warehouse (Almacén) ── */
export type WarehouseCategory = 'carnes' | 'pescados' | 'verduras' | 'lácteos' | 'panadería' | 'salsas' | 'bebidas' | 'otros'
export type WarehouseUnit = 'kg' | 'g' | 'L' | 'ml' | 'unidades'

export interface WarehouseBatch {
  id: string
  warehouseItemId: string
  quantity: number
  expiryDate: string | null
  receivedAt: string | null
  costPerUnit: number
  supplier: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface WarehouseItem {
  id: string
  name: string
  category: WarehouseCategory
  unit: WarehouseUnit
  currentStock: number        // sum of batch quantities
  committedStock: number
  minimumStock: number
  costPerUnit: number         // default for new batches
  supplier: string            // default for new batches
  location: string
  branchId: string
  notes: string
  batchCount: number          // denormalized from batches
  nearestExpiryDate: string | null  // earliest non-expired batch expiry
  createdAt: string
  updatedAt: string
}

/* ── Computed helpers ── */
export function getAvailableStock(item: WarehouseItem): number {
  return item.currentStock - item.committedStock
}

export function isLowStock(item: WarehouseItem): boolean {
  return getAvailableStock(item) <= item.minimumStock
}

export function isExpiringSoon(item: WarehouseItem, daysThreshold = 3): boolean {
  if (!item.nearestExpiryDate) return false
  const diff = new Date(item.nearestExpiryDate).getTime() - Date.now()
  return diff > 0 && diff < daysThreshold * 86400000
}

export function isExpired(item: WarehouseItem): boolean {
  if (!item.nearestExpiryDate) return false
  return new Date(item.nearestExpiryDate).getTime() < Date.now()
}

/* ── Recipes (Recetas) ── */
export type RecipeStatus = 'active' | 'draft'

export interface RecipeIngredient {
  id: string
  recipeId: string
  warehouseItemId: string
  warehouseItemName?: string
  quantity: number
  unit: WarehouseUnit
}

export interface Recipe {
  id: string
  name: string
  description: string
  productId: string
  productName?: string
  image: string
  yield: number
  prepTime: number
  cookTime: number
  status: RecipeStatus
  ingredients: RecipeIngredient[]
  createdAt: string
  updatedAt: string
}

/* ── Purchase Orders (Órdenes de Compra) ── */
export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partial' | 'received' | 'cancelled'

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  warehouseItemId: string
  warehouseItemName?: string
  quantity: number
  unit: WarehouseUnit
  unitCost: number
  receivedQuantity: number
}

export interface PurchaseOrder {
  id: string
  supplier: string
  status: PurchaseOrderStatus
  items: PurchaseOrderItem[]
  totalCost: number
  orderDate: string
  expectedDelivery: string | null
  receivedDate: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

/* ── Helpers ── */
export function getPurchaseOrderTotal(order: PurchaseOrder): number {
  return order.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)
}

export const warehouseCategoryLabels: Record<WarehouseCategory, string> = {
  carnes: 'Carnes',
  pescados: 'Pescados',
  verduras: 'Verduras y Frutas',
  lácteos: 'Lácteos',
  panadería: 'Panadería',
  salsas: 'Salsas y Condimentos',
  bebidas: 'Bebidas',
  otros: 'Otros',
}

export const warehouseUnitLabels: Record<WarehouseUnit, string> = {
  kg: 'kg',
  g: 'g',
  L: 'L',
  ml: 'ml',
  unidades: 'uds',
}

export const purchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  draft: 'Borrador',
  ordered: 'Pedido',
  partial: 'Parcial',
  received: 'Recibido',
  cancelled: 'Cancelado',
}

export const purchaseOrderStatusColors: Record<PurchaseOrderStatus, string> = {
  draft: 'gray',
  ordered: 'blue',
  partial: 'yellow',
  received: 'green',
  cancelled: 'red',
}

/* ── Suppliers (Proveedores externos — panel proveedor) ── */

export interface SupplierProduct {
  id: string
  supplierId: string
  name: string
  description: string
  category: WarehouseCategory
  unit: WarehouseUnit
  pricePerUnit: number
  minOrderQuantity: number
  maxOrderQuantity: number | null
  image: string
  inStock: boolean
  warehouseItemId: string | null
}

export interface Supplier {
  id: string
  name: string
  description: string
  logo: string
  location: string
  province: string
  categories: WarehouseCategory[]
  rating: number
  reviewCount: number
  deliveryDays: number
  minOrderValue: number
  contactEmail: string
  contactPhone: string
  website: string
  verified: boolean
  products: SupplierProduct[]
  createdAt: string
}

/* ── Purchase cart (carrito temporal antes de crear orden) ── */

export interface PurchaseCartItem {
  supplierProduct: SupplierProduct
  supplier: Supplier
  quantity: number
}
