import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Location {
  id: string
  name: string
  status: 'active' | 'inactive'
  type: 'physical' | 'warehouse' | 'app' | 'custom'
  address: string
  city: string
  country: string
  postalCode: string
  phone: string
  email: string
  notes: string
  channels: Array<'online' | 'pos' | 'shop'>
  isDefault: boolean
  // Future connections
  inventoryEnabled: boolean
  fulfillmentEnabled: boolean
  pickupEnabled: boolean
  createdAt: string
  updatedAt: string
}

/* ── Committed Stock Breakdown (prepared for future phases) ── */
export interface CommittedBreakdown {
  total: number
  fromOrders: number | null       // null = orders module not yet connected
  fromRecipes: number | null      // null = recipes module not yet connected
  fromOther: number | null        // null = catch-all for future sources
  productId: string | number
  locationId: string
}

/* ── Product Inventory per Location ── */
export interface ProductLocationInventory {
  id: string                    // composite: `${productId}_${locationId}`
  productId: string | number
  locationId: string
  locationName: string          // denormalized for quick display

  // Stock levels (Shopify-style)
  onHand: number               // En existencia (physical actual)
  available: number            // Disponible para venta
  committed: number            // Comprometido (unfulfilled orders)

  // Unavailable breakdown
  damaged: number
  qualityControl: number
  safety: number
  other: number

  tracked: boolean             // Whether this location tracks this product
  updatedAt: string
}

const now = new Date().toISOString()

export const useLocationsStore = defineStore('locations', () => {
  const locations = ref<Location[]>([
    {
      id: 'loc-001',
      name: 'Sede Principal — Valencia',
      status: 'active',
      type: 'physical',
      address: 'Calle Colón 45, Local 2',
      city: 'Valencia',
      country: 'España',
      postalCode: '46004',
      phone: '+34 963 456 789',
      email: 'principal@foodfy.com',
      notes: 'Sucursal principal con comedor, cocina y zona de recogida.',
      channels: ['online', 'pos', 'shop'],
      isDefault: true,
      inventoryEnabled: true,
      fulfillmentEnabled: true,
      pickupEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'loc-002',
      name: 'Almacén Central',
      status: 'active',
      type: 'warehouse',
      address: 'Polígono Industrial Norte, Nave 7',
      city: 'Valencia',
      country: 'España',
      postalCode: '46100',
      phone: '+34 963 111 222',
      email: 'almacen@foodfy.com',
      notes: 'Almacén logístico. No recibe clientes.',
      channels: [],
      isDefault: false,
      inventoryEnabled: true,
      fulfillmentEnabled: true,
      pickupEnabled: false,
      createdAt: now,
      updatedAt: now,
    },
  ])

  /* ── Plan limit (could be fetched from settings in future) ── */
  const planLocationLimit = ref(5)

  /* ── Product Inventory per Location ── */
  const productInventory = ref<ProductLocationInventory[]>([
    // Seed with initial inventory for existing products and locations
    // Product 1: Hamburguesa Clásica
    { id: '1_loc-001', productId: 1, locationId: 'loc-001', locationName: 'Sede Principal — Valencia', onHand: 50, available: 45, committed: 5, damaged: 0, qualityControl: 0, safety: 5, other: 0, tracked: true, updatedAt: now },
    { id: '1_loc-002', productId: 1, locationId: 'loc-002', locationName: 'Almacén Central', onHand: 100, available: 95, committed: 5, damaged: 0, qualityControl: 0, safety: 10, other: 0, tracked: true, updatedAt: now },
    // Product 2: Doble Smash Bacon
    { id: '2_loc-001', productId: 2, locationId: 'loc-001', locationName: 'Sede Principal — Valencia', onHand: 30, available: 25, committed: 5, damaged: 0, qualityControl: 0, safety: 5, other: 0, tracked: true, updatedAt: now },
    { id: '2_loc-002', productId: 2, locationId: 'loc-002', locationName: 'Almacén Central', onHand: 60, available: 55, committed: 5, damaged: 0, qualityControl: 0, safety: 5, other: 0, tracked: true, updatedAt: now },
    // Product 3: Truffle Mushroom Burger
    { id: '3_loc-001', productId: 3, locationId: 'loc-001', locationName: 'Sede Principal — Valencia', onHand: 15, available: 12, committed: 3, damaged: 0, qualityControl: 0, safety: 3, other: 0, tracked: true, updatedAt: now },
    { id: '3_loc-002', productId: 3, locationId: 'loc-002', locationName: 'Almacén Central', onHand: 25, available: 22, committed: 3, damaged: 0, qualityControl: 0, safety: 3, other: 0, tracked: true, updatedAt: now },
  ])

  /* ── Computed ── */
  const activeLocations = computed(() => locations.value.filter(l => l.status === 'active'))
  const inactiveLocations = computed(() => locations.value.filter(l => l.status === 'inactive'))
  const physicalLocations = computed(() => locations.value.filter(l => l.type === 'physical'))
  const defaultLocation = computed(() => locations.value.find(l => l.isDefault) ?? null)

  /* ── Inventory Getters ── */
  function getProductInventory(productId: string | number): ProductLocationInventory[] {
    return productInventory.value.filter(pi => String(pi.productId) === String(productId))
  }

  function getInventoryForLocation(productId: string | number, locationId: string): ProductLocationInventory | null {
    return productInventory.value.find(
      pi => String(pi.productId) === String(productId) && pi.locationId === locationId
    ) ?? null
  }

  function getOrCreateInventory(productId: string | number, locationId: string): ProductLocationInventory {
    const existing = getInventoryForLocation(productId, locationId)
    if (existing) return existing

    const location = getById(locationId)
    const newInventory: ProductLocationInventory = {
      id: `${productId}_${locationId}`,
      productId,
      locationId,
      locationName: location?.name || 'Unknown',
      onHand: 0,
      available: 0,
      committed: 0,
      damaged: 0,
      qualityControl: 0,
      safety: 0,
      other: 0,
      tracked: true,
      updatedAt: new Date().toISOString(),
    }
    productInventory.value.push(newInventory)
    return newInventory
  }

  function setProductLocationInventory(
    productId: string | number,
    locationId: string,
    data: Partial<ProductLocationInventory>
  ) {
    const idx = productInventory.value.findIndex(
      pi => String(pi.productId) === String(productId) && pi.locationId === locationId
    )

    const location = getById(locationId)

    if (idx >= 0) {
      // Update existing
      productInventory.value[idx] = {
        ...productInventory.value[idx],
        ...data,
        id: `${productId}_${locationId}`,
        productId,
        locationId,
        locationName: data.locationName ?? location?.name ?? productInventory.value[idx].locationName,
        updatedAt: new Date().toISOString(),
      }
    } else {
      // Create new
      productInventory.value.push({
        id: `${productId}_${locationId}`,
        productId,
        locationId,
        locationName: location?.name || 'Unknown',
        onHand: 0,
        available: 0,
        committed: 0,
        damaged: 0,
        qualityControl: 0,
        safety: 0,
        other: 0,
        tracked: true,
        ...data,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  function initializeProductInventory(productId: string | number) {
    // Create inventory entries for all inventory-enabled locations
    activeLocations.value
      .filter(loc => loc.inventoryEnabled)
      .forEach(loc => {
        const exists = getInventoryForLocation(productId, loc.id)
        if (!exists) {
          productInventory.value.push({
            id: `${productId}_${loc.id}`,
            productId,
            locationId: loc.id,
            locationName: loc.name,
            onHand: 0,
            available: 0,
            committed: 0,
            damaged: 0,
            qualityControl: 0,
            safety: 0,
            other: 0,
            tracked: true,
            updatedAt: new Date().toISOString(),
          })
        }
      })
  }

  function deleteProductInventory(productId: string | number) {
    productInventory.value = productInventory.value.filter(
      pi => String(pi.productId) !== String(productId)
    )
  }

  function deleteLocationInventory(locationId: string) {
    productInventory.value = productInventory.value.filter(
      pi => pi.locationId !== locationId
    )
  }

  function getCommittedBreakdown(productId: string | number, locationId: string): CommittedBreakdown {
    const inv = getInventoryForLocation(productId, locationId)
    return {
      total: inv?.committed ?? 0,
      fromOrders: null,      // Phase 2: connect with orders module
      fromRecipes: null,     // Phase 2: connect with useStudioStore.recipes + locationId
      fromOther: null,
      productId,
      locationId,
    }
  }

  function recalculateUnavailable(productId: string | number, locationId: string) {
    const inv = getInventoryForLocation(productId, locationId)
    if (!inv) return
    const totalUnavailable = inv.damaged + inv.qualityControl + inv.safety + inv.other
    inv.onHand = inv.available + inv.committed + totalUnavailable
    inv.updatedAt = new Date().toISOString()
  }

  /* ── CRUD ── */
  function addLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) {
    const newLoc: Location = {
      ...location,
      id: `loc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    if (newLoc.isDefault) {
      locations.value.forEach(l => (l.isDefault = false))
    }
    locations.value.push(newLoc)
    return newLoc
  }

  function updateLocation(id: string, patch: Partial<Location>) {
    const idx = locations.value.findIndex(l => l.id === id)
    if (idx === -1) return
    if (patch.isDefault) {
      locations.value.forEach(l => (l.isDefault = false))
    }
    locations.value[idx] = {
      ...locations.value[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
  }

  function deleteLocation(id: string) {
    const loc = locations.value.find(l => l.id === id)
    locations.value = locations.value.filter(l => l.id !== id)
    // Cascade delete inventory for this location
    deleteLocationInventory(id)
    if (loc?.isDefault && locations.value.length > 0) {
      locations.value[0].isDefault = true
    }
  }

  function setDefault(id: string) {
    locations.value.forEach(l => (l.isDefault = l.id === id))
  }

  function toggleStatus(id: string) {
    const loc = locations.value.find(l => l.id === id)
    if (!loc) return
    loc.status = loc.status === 'active' ? 'inactive' : 'active'
    loc.updatedAt = new Date().toISOString()
  }

  function getById(id: string) {
    return locations.value.find(l => l.id === id) ?? null
  }

  return {
    // Locations
    locations,
    planLocationLimit,
    activeLocations,
    inactiveLocations,
    physicalLocations,
    defaultLocation,
    addLocation,
    updateLocation,
    deleteLocation,
    setDefault,
    toggleStatus,
    getById,
    // Product Inventory per Location
    productInventory,
    getProductInventory,
    getInventoryForLocation,
    getOrCreateInventory,
    setProductLocationInventory,
    initializeProductInventory,
    deleteProductInventory,
    deleteLocationInventory,
    recalculateUnavailable,
    getCommittedBreakdown,
  }
})
