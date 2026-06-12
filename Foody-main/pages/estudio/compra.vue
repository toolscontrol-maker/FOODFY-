<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSupplierStore } from '~/stores/useSupplierStore'
import { warehouseCategoryLabels, warehouseUnitLabels } from '~/types/studio'
import type { Supplier, SupplierProduct } from '~/types/studio'

definePageMeta({ layout: 'dashboard' })

const store = useSupplierStore()
const toast = useToast()
const route = useRoute()
await store.fetchSuppliers()

/* ── Filters ── */
const searchQuery = ref(route.query.q ? String(route.query.q) : '')
const filterCategory = ref<string>('')
const filterProvince = ref<string>('')
const filterPriceMin = ref<number | null>(null)
const filterPriceMax = ref<number | null>(null)
const filterMinOrder = ref<number | null>(null)
const filterDeliveryDays = ref<number | null>(null)
const filterInStock = ref(false)
const filterVerifiedOnly = ref(false)
const sortBy = ref<'price_asc' | 'price_desc' | 'rating' | 'delivery'>('rating')

const categoryOptions = [
  { label: 'Todas las categorías', value: '' },
  ...Object.entries(warehouseCategoryLabels).map(([v, l]) => ({ label: l, value: v })),
]

const sortOptions = [
  { label: 'Mejor valorados', value: 'rating' },
  { label: 'Precio: menor a mayor', value: 'price_asc' },
  { label: 'Precio: mayor a menor', value: 'price_desc' },
  { label: 'Entrega más rápida', value: 'delivery' },
]

const provinces = computed(() => {
  const set = new Set(store.suppliers.map(s => s.province))
  return [
    { label: 'Todas las ubicaciones', value: '' },
    ...[...set].sort().map(p => ({ label: p, value: p })),
  ]
})

/* ── Flat list of products with supplier context ── */
const allProducts = computed(() => store.allProducts)

const filteredProducts = computed(() => {
  let list = allProducts.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.supplier.name.toLowerCase().includes(q)
    )
  }

  if (filterCategory.value) {
    list = list.filter(p => p.category === filterCategory.value)
  }

  if (filterProvince.value) {
    list = list.filter(p => p.supplier.province === filterProvince.value)
  }

  if (filterPriceMin.value !== null) {
    list = list.filter(p => p.pricePerUnit >= filterPriceMin.value!)
  }

  if (filterPriceMax.value !== null) {
    list = list.filter(p => p.pricePerUnit <= filterPriceMax.value!)
  }

  if (filterMinOrder.value !== null) {
    list = list.filter(p => p.minOrderQuantity <= filterMinOrder.value!)
  }

  if (filterDeliveryDays.value !== null) {
    list = list.filter(p => p.supplier.deliveryDays <= filterDeliveryDays.value!)
  }

  if (filterInStock.value) {
    list = list.filter(p => p.inStock)
  }

  if (filterVerifiedOnly.value) {
    list = list.filter(p => p.supplier.verified)
  }

  list = [...list].sort((a, b) => {
    if (sortBy.value === 'price_asc') return a.pricePerUnit - b.pricePerUnit
    if (sortBy.value === 'price_desc') return b.pricePerUnit - a.pricePerUnit
    if (sortBy.value === 'delivery') return a.supplier.deliveryDays - b.supplier.deliveryDays
    return b.supplier.rating - a.supplier.rating
  })

  return list
})

/* ── Supplier detail slideover ── */
const selectedSupplier = ref<Supplier | null>(null)
const showSupplierSlide = ref(false)
const productQtys = ref<Record<string, number>>({})

const openSupplier = (supplier: Supplier) => {
  selectedSupplier.value = supplier
  productQtys.value = {}
  for (const p of supplier.products) {
    productQtys.value[p.id] = p.minOrderQuantity
  }
  showSupplierSlide.value = true
}

const addProductToCart = (product: SupplierProduct) => {
  if (!selectedSupplier.value) return
  const qty = productQtys.value[product.id] ?? product.minOrderQuantity
  store.addToCart(selectedSupplier.value, product, qty)
  toast.add({ title: 'Añadido al pedido', description: `${product.name} × ${qty} ${warehouseUnitLabels[product.unit]}`, color: 'green' })
}

const isInCart = (productId: string) =>
  store.cartItems.some(ci => ci.supplierProduct.id === productId)

/* ── Cart slideover ── */
const showCart = ref(false)
const cartNotes = ref<Record<string, string>>({})
const submitting = ref(false)

const supplierSubtotal = (items: typeof store.cartItems) =>
  items.reduce((s, ci) => s + ci.supplierProduct.pricePerUnit * ci.quantity, 0)

const handleSubmitOrder = async () => {
  if (store.cartItems.length === 0) return
  submitting.value = true
  try {
    await store.submitOrder(cartNotes.value)
    toast.add({
      title: 'Pedido enviado',
      description: `${store.cartBySupplier.length} orden${store.cartBySupplier.length > 1 ? 'es' : ''} de compra creada${store.cartBySupplier.length > 1 ? 's' : ''}. Puedes seguirlas en Órdenes de Compra.`,
      color: 'green',
    })
    showCart.value = false
    cartNotes.value = {}
  } catch {
    toast.add({ title: 'Error', description: 'No se pudo enviar el pedido.', color: 'red' })
  } finally {
    submitting.value = false
  }
}

/* ── Helpers ── */
const formatEur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

const categoryIcon: Record<string, string> = {
  carnes: 'i-lucide-beef',
  pescados: 'i-lucide-fish',
  verduras: 'i-lucide-leaf',
  lácteos: 'i-lucide-milk',
  panadería: 'i-lucide-wheat',
  salsas: 'i-lucide-droplets',
  bebidas: 'i-lucide-cup-soda',
  otros: 'i-lucide-package',
}

const resetFilters = () => {
  searchQuery.value = ''
  filterCategory.value = ''
  filterProvince.value = ''
  filterPriceMin.value = null
  filterPriceMax.value = null
  filterMinOrder.value = null
  filterDeliveryDays.value = null
  filterInStock.value = false
  filterVerifiedOnly.value = false
  sortBy.value = 'rating'
}

const hasActiveFilters = computed(() =>
  !!searchQuery.value || !!filterCategory.value || !!filterProvince.value ||
  filterPriceMin.value !== null || filterPriceMax.value !== null ||
  filterMinOrder.value !== null || filterDeliveryDays.value !== null ||
  filterInStock.value || filterVerifiedOnly.value
)
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">

    <!-- ── Top bar ── -->
    <div class="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-shopping-basket" class="w-5 h-5" />
          Compra de Stock
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">Encuentra proveedores, compara precios y genera órdenes de compra.</p>
      </div>

      <!-- Cart button -->
      <UButton
        icon="i-lucide-shopping-cart"
        :label="store.cartCount > 0 ? `Carrito (${store.cartCount})` : 'Carrito'"
        :color="store.cartCount > 0 ? 'primary' : 'gray'"
        :variant="store.cartCount > 0 ? 'solid' : 'outline'"
        @click="showCart = true"
      >
        <template v-if="store.cartCount > 0" #trailing>
          <span class="ml-1 text-xs bg-white/20 rounded-full px-1.5 py-0.5 font-bold">
            {{ formatEur(store.cartTotal) }}
          </span>
        </template>
      </UButton>
    </div>

    <!-- ── Search + Sort bar ── -->
    <div class="flex-shrink-0 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-wrap gap-3 items-center">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Buscar producto o proveedor…"
        class="flex-1 min-w-48 max-w-sm"
        size="sm"
      />
      <USelectMenu
        v-model="filterCategory"
        :options="categoryOptions"
        value-attribute="value"
        option-attribute="label"
        placeholder="Categoría"
        size="sm"
        class="w-44"
      />
      <USelectMenu
        v-model="filterProvince"
        :options="provinces"
        value-attribute="value"
        option-attribute="label"
        placeholder="Ubicación"
        size="sm"
        class="w-40"
      />
      <USelectMenu
        v-model="sortBy"
        :options="sortOptions"
        value-attribute="value"
        option-attribute="label"
        size="sm"
        class="w-48"
      />
      <div class="ml-auto flex items-center gap-2">
        <span class="text-xs text-gray-400">{{ filteredProducts.length }} producto{{ filteredProducts.length !== 1 ? 's' : '' }}</span>
        <UButton v-if="hasActiveFilters" icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="resetFilters">Limpiar</UButton>
      </div>
    </div>

    <!-- ── Body: filters sidebar + product grid ── -->
    <div class="flex-1 overflow-hidden flex">

      <!-- Filters sidebar -->
      <div class="w-56 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto p-4 space-y-5">
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Precio/ud (€)</p>
          <div class="flex gap-2">
            <UInput v-model.number="filterPriceMin" type="number" placeholder="Mín" size="xs" class="w-full" />
            <UInput v-model.number="filterPriceMax" type="number" placeholder="Máx" size="xs" class="w-full" />
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Pedido mín. (ud)</p>
          <UInput v-model.number="filterMinOrder" type="number" placeholder="Ej: 10" size="xs" class="w-full" />
          <p class="text-[10px] text-gray-400 mt-1">Muestra productos con pedido mínimo ≤ este valor</p>
        </div>

        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Entrega máx. (días)</p>
          <div class="flex flex-col gap-1.5">
            <UButton
              v-for="d in [1, 2, 3, 5]" :key="d"
              size="xs"
              :color="filterDeliveryDays === d ? 'primary' : 'gray'"
              :variant="filterDeliveryDays === d ? 'solid' : 'ghost'"
              class="justify-start"
              @click="filterDeliveryDays = filterDeliveryDays === d ? null : d"
            >
              {{ d === 1 ? '24 h' : d === 2 ? '48 h' : `${d} días` }}
            </UButton>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Estado</p>
          <div class="space-y-2">
            <UCheckbox v-model="filterInStock" label="Solo en stock" />
            <UCheckbox v-model="filterVerifiedOnly" label="Solo verificados" />
          </div>
        </div>
      </div>

      <!-- Product grid -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="store.loading" class="flex items-center justify-center py-20">
          <UIcon name="i-lucide-loader-2" class="w-7 h-7 text-gray-400 animate-spin" />
        </div>

        <div v-else-if="filteredProducts.length === 0" class="flex items-center justify-center py-20">
          <div class="text-center">
            <UIcon name="i-lucide-search-x" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p class="text-sm text-gray-500">No se encontraron productos con los filtros actuales.</p>
            <UButton size="xs" variant="ghost" color="gray" class="mt-2" @click="resetFilters">Limpiar filtros</UButton>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="p in filteredProducts" :key="p.id"
            class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden cursor-pointer group"
            @click="openSupplier(p.supplier)"
          >
            <!-- Image / placeholder -->
            <div class="h-36 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center relative">
              <UIcon :name="categoryIcon[p.category] || 'i-lucide-package'" class="w-12 h-12 text-gray-300 dark:text-gray-600" />
              <UBadge v-if="!p.inStock" color="red" variant="solid" size="xs" class="absolute top-2 left-2">Sin stock</UBadge>
              <UBadge v-if="isInCart(p.id)" color="green" variant="solid" size="xs" class="absolute top-2 right-2">
                <UIcon name="i-lucide-check" class="w-3 h-3 mr-0.5" />En carrito
              </UBadge>
            </div>

            <!-- Content -->
            <div class="p-3 flex flex-col flex-1 gap-1.5">
              <div class="flex items-start justify-between gap-1">
                <p class="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">{{ p.name }}</p>
                <UBadge v-if="p.supplier.verified" color="blue" variant="subtle" size="xs" class="flex-shrink-0 mt-0.5">
                  <UIcon name="i-lucide-badge-check" class="w-2.5 h-2.5" />
                </UBadge>
              </div>
              <p class="text-xs text-gray-500 line-clamp-1 font-medium">{{ p.supplier.name }}</p>
              <p class="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{{ p.description }}</p>

              <div class="flex items-center gap-1 text-xs text-gray-400">
                <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
                {{ p.supplier.province }}
                <span class="mx-1">·</span>
                <UIcon name="i-lucide-star" class="w-3 h-3 text-amber-400" />
                {{ p.supplier.rating.toFixed(1) }}
                <span class="mx-1">·</span>
                <UIcon name="i-lucide-truck" class="w-3 h-3" />
                {{ p.supplier.deliveryDays === 1 ? '24 h' : `${p.supplier.deliveryDays}d` }}
              </div>

              <div class="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800 flex items-end justify-between">
                <div>
                  <p class="text-base font-bold text-gray-900 dark:text-white">{{ formatEur(p.pricePerUnit) }}</p>
                  <p class="text-[10px] text-gray-400">/ {{ warehouseUnitLabels[p.unit] }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-gray-400">Mín. {{ p.minOrderQuantity }} {{ warehouseUnitLabels[p.unit] }}</p>
                  <p v-if="p.maxOrderQuantity" class="text-[10px] text-gray-400">Máx. {{ p.maxOrderQuantity }} {{ warehouseUnitLabels[p.unit] }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Supplier detail slideover ── -->
    <USlideover v-model="showSupplierSlide" side="right" :ui="{ width: 'max-w-xl' }">
      <div v-if="selectedSupplier" class="flex flex-col h-full overflow-hidden">
        <!-- Header -->
        <div class="flex-shrink-0 p-5 border-b border-gray-200 dark:border-gray-800 flex items-start gap-4">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0">
            <UIcon :name="categoryIcon[selectedSupplier.categories[0]] || 'i-lucide-store'" class="w-7 h-7 text-gray-500 dark:text-gray-300" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedSupplier.name }}</h2>
              <UBadge v-if="selectedSupplier.verified" color="blue" variant="subtle" size="xs">
                <UIcon name="i-lucide-badge-check" class="w-3 h-3 mr-0.5" />Verificado
              </UBadge>
            </div>
            <p class="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" />{{ selectedSupplier.location }}
            </p>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span class="flex items-center gap-0.5">
                <UIcon name="i-lucide-star" class="w-3.5 h-3.5 text-amber-400" />
                {{ selectedSupplier.rating.toFixed(1) }} ({{ selectedSupplier.reviewCount }} reseñas)
              </span>
              <span class="flex items-center gap-0.5">
                <UIcon name="i-lucide-truck" class="w-3.5 h-3.5" />
                Entrega en {{ selectedSupplier.deliveryDays === 1 ? '24 h' : `${selectedSupplier.deliveryDays} días` }}
              </span>
              <span class="flex items-center gap-0.5">
                <UIcon name="i-lucide-package" class="w-3.5 h-3.5" />
                Pedido mín. {{ formatEur(selectedSupplier.minOrderValue) }}
              </span>
            </div>
          </div>
          <UButton icon="i-lucide-x" color="gray" variant="ghost" size="sm" @click="showSupplierSlide = false" />
        </div>

        <!-- Contact strip -->
        <div class="flex-shrink-0 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
          <a :href="`mailto:${selectedSupplier.contactEmail}`" class="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
            <UIcon name="i-lucide-mail" class="w-3.5 h-3.5" />
            {{ selectedSupplier.contactEmail }}
          </a>
          <a :href="`tel:${selectedSupplier.contactPhone}`" class="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
            <UIcon name="i-lucide-phone" class="w-3.5 h-3.5" />
            {{ selectedSupplier.contactPhone }}
          </a>
          <p class="text-xs text-gray-500 italic line-clamp-2">{{ selectedSupplier.description }}</p>
        </div>

        <!-- Products list -->
        <div class="flex-1 overflow-y-auto p-5 space-y-3">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Productos disponibles</p>
          <div
            v-for="product in selectedSupplier.products" :key="product.id"
            class="border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex gap-4 items-start"
            :class="!product.inStock ? 'opacity-60' : ''"
          >
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center flex-shrink-0">
              <UIcon :name="categoryIcon[product.category] || 'i-lucide-package'" class="w-5 h-5 text-gray-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ product.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ product.description }}</p>
              <div class="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                <span class="font-bold text-gray-900 dark:text-white text-sm">{{ formatEur(product.pricePerUnit) }}/{{ warehouseUnitLabels[product.unit] }}</span>
                <span>Mín. {{ product.minOrderQuantity }} {{ warehouseUnitLabels[product.unit] }}</span>
                <UBadge v-if="!product.inStock" color="red" variant="subtle" size="xs">Sin stock</UBadge>
                <UBadge v-else-if="isInCart(product.id)" color="green" variant="subtle" size="xs">En carrito</UBadge>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <div class="flex items-center gap-1">
                <UButton
                  icon="i-lucide-minus"
                  color="gray" variant="outline" size="xs"
                  :disabled="!product.inStock || (productQtys[product.id] ?? product.minOrderQuantity) <= product.minOrderQuantity"
                  @click.stop="productQtys[product.id] = Math.max(product.minOrderQuantity, (productQtys[product.id] ?? product.minOrderQuantity) - 1)"
                />
                <input
                  v-model.number="productQtys[product.id]"
                  type="number"
                  :min="product.minOrderQuantity"
                  :max="product.maxOrderQuantity ?? 9999"
                  class="w-14 text-center text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-transparent py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  :disabled="!product.inStock"
                />
                <UButton
                  icon="i-lucide-plus"
                  color="gray" variant="outline" size="xs"
                  :disabled="!product.inStock"
                  @click.stop="productQtys[product.id] = (productQtys[product.id] ?? product.minOrderQuantity) + 1"
                />
              </div>
              <UButton
                :icon="isInCart(product.id) ? 'i-lucide-check' : 'i-lucide-plus'"
                :color="isInCart(product.id) ? 'green' : 'primary'"
                variant="solid"
                size="xs"
                :disabled="!product.inStock"
                @click.stop="addProductToCart(product)"
              >
                {{ isInCart(product.id) ? 'Actualizar' : 'Añadir' }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex justify-between items-center">
          <p class="text-xs text-gray-400">{{ store.cartCount }} artículo{{ store.cartCount !== 1 ? 's' : '' }} en el carrito · {{ formatEur(store.cartTotal) }}</p>
          <UButton
            icon="i-lucide-shopping-cart"
            color="primary"
            variant="solid"
            size="sm"
            :disabled="store.cartCount === 0"
            @click="showSupplierSlide = false; showCart = true"
          >Ver carrito</UButton>
        </div>
      </div>
    </USlideover>

    <!-- ── Cart slideover ── -->
    <USlideover v-model="showCart" side="right" :ui="{ width: 'max-w-lg' }">
      <div class="flex flex-col h-full overflow-hidden">
        <!-- Header -->
        <div class="flex-shrink-0 p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-shopping-cart" class="w-5 h-5" />
              Carrito de compra
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">{{ store.cartBySupplier.length }} proveedor{{ store.cartBySupplier.length !== 1 ? 'es' : '' }}</p>
          </div>
          <div class="flex items-center gap-2">
            <UButton v-if="store.cartCount > 0" icon="i-lucide-trash-2" color="red" variant="ghost" size="sm" @click="store.clearCart()">Vaciar</UButton>
            <UButton icon="i-lucide-x" color="gray" variant="ghost" size="sm" @click="showCart = false" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="store.cartCount === 0" class="flex-1 flex items-center justify-center">
          <div class="text-center px-6">
            <UIcon name="i-lucide-shopping-cart" class="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p class="text-sm text-gray-500">El carrito está vacío.</p>
            <p class="text-xs text-gray-400 mt-1">Añade productos desde las fichas de proveedor.</p>
          </div>
        </div>

        <!-- Items grouped by supplier -->
        <div v-else class="flex-1 overflow-y-auto p-5 space-y-6">
          <div
            v-for="group in store.cartBySupplier" :key="group.supplier.id"
            class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <!-- Supplier header -->
            <div class="flex items-center gap-2.5 px-4 py-3 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
              <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                <UIcon :name="categoryIcon[group.supplier.categories[0]] || 'i-lucide-store'" class="w-4 h-4 text-gray-500" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ group.supplier.name }}</p>
                  <UBadge v-if="group.supplier.verified" color="blue" variant="subtle" size="xs">
                    <UIcon name="i-lucide-badge-check" class="w-2.5 h-2.5 mr-0.5" />Verificado
                  </UBadge>
                </div>
                <div class="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                  <span class="flex items-center gap-0.5">
                    <UIcon name="i-lucide-map-pin" class="w-2.5 h-2.5" />{{ group.supplier.province }}
                  </span>
                  <span class="flex items-center gap-0.5">
                    <UIcon name="i-lucide-truck" class="w-2.5 h-2.5" />
                    Entrega {{ group.supplier.deliveryDays === 1 ? '24 h' : `${group.supplier.deliveryDays} días` }}
                  </span>
                  <span class="flex items-center gap-0.5">
                    <UIcon name="i-lucide-mail" class="w-2.5 h-2.5" />{{ group.supplier.contactEmail }}
                  </span>
                </div>
              </div>
              <p class="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">
                {{ formatEur(supplierSubtotal(group.items)) }}
              </p>
            </div>

            <!-- Items -->
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="ci in group.items" :key="ci.supplierProduct.id"
                class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-950"
              >
                <div class="w-7 h-7 rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <UIcon :name="categoryIcon[ci.supplierProduct.category] || 'i-lucide-package'" class="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ ci.supplierProduct.name }}</p>
                  <p class="text-[10px] text-gray-400">{{ formatEur(ci.supplierProduct.pricePerUnit) }} / {{ warehouseUnitLabels[ci.supplierProduct.unit] }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <UButton icon="i-lucide-minus" color="gray" variant="outline" size="xs" @click="store.updateCartQty(ci.supplierProduct.id, ci.quantity - 1)" />
                  <span class="text-sm font-semibold text-gray-900 dark:text-white w-8 text-center">{{ ci.quantity }}</span>
                  <UButton icon="i-lucide-plus" color="gray" variant="outline" size="xs" @click="store.updateCartQty(ci.supplierProduct.id, ci.quantity + 1)" />
                </div>
                <p class="text-sm font-bold text-gray-900 dark:text-white w-16 text-right flex-shrink-0">{{ formatEur(ci.supplierProduct.pricePerUnit * ci.quantity) }}</p>
                <UButton icon="i-lucide-trash-2" color="red" variant="ghost" size="xs" @click="store.removeFromCart(ci.supplierProduct.id)" />
              </div>
            </div>

            <!-- Per-supplier subtotal + notes -->
            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
              <div class="flex justify-between text-xs text-gray-500">
                <span>{{ group.items.length }} artículo{{ group.items.length !== 1 ? 's' : '' }}</span>
                <span>Pedido mín. {{ formatEur(group.supplier.minOrderValue) }}</span>
              </div>
              <UTextarea
                v-model="cartNotes[group.supplier.id]"
                :placeholder="`Notas para ${group.supplier.name}… (instrucciones especiales, horario de entrega, etc.)`"
                :rows="2"
                size="xs"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="store.cartCount > 0" class="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-white dark:bg-gray-950">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Total estimado · {{ store.cartBySupplier.length }} proveedor{{ store.cartBySupplier.length !== 1 ? 'es' : '' }}</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatEur(store.cartTotal) }}</p>
            </div>
            <UButton
              icon="i-lucide-send"
              color="primary"
              variant="solid"
              :loading="submitting"
              @click="handleSubmitOrder"
            >
              Confirmar pedido{{ store.cartBySupplier.length > 1 ? `s (${store.cartBySupplier.length})` : '' }}
            </UButton>
          </div>
          <p class="text-[10px] text-gray-400 text-center">
            Se creará <strong>1 orden de compra por proveedor</strong> con estado <strong>Pedido</strong>.
            Seguimiento en
            <NuxtLink to="/estudio/ordenes-compra" class="underline hover:text-primary-600" @click="showCart = false">Órdenes de compra</NuxtLink>.
          </p>
        </div>
      </div>
    </USlideover>

  </div>
</template>
