<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCollectionsStore } from '~/stores/useCollectionsStore'
import { useCatalogStore } from '~/stores/useCatalogStore'
import { useSettingsStore } from '~/stores/useSettingsStore'
import type { Collection, Product } from '~/types/commerce'
import { getProductPrice, getProductCoverImage } from '~/types/commerce'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const settingsStore = useSettingsStore()
const seoStoreName = computed(() => settingsStore.storeName || 'Mi tienda')
const seoDomain = computed(() => (settingsStore.storeName || 'mitienda').toLowerCase().replace(/\s+/g, '') + '.com')
const collectionsStore = useCollectionsStore()
const catalogStore = useCatalogStore()

const id = route.params.id as string
const isNew = computed(() => id === 'new')

/* ── Fetch data ── */
await Promise.all([
  collectionsStore.fetchCollections(),
  catalogStore.fetchProducts(),
])

/* ── Initialize collection ── */
const buildEmpty = (): Collection => ({
  id: '',
  handle: '',
  title: '',
  description: '',
  image: '',
  type: 'manual',
  status: 'draft',
  productIds: [],
  sortOrder: 'manual',
  themeTemplate: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const original = isNew.value ? null : collectionsStore.getCollectionById(id)
if (!isNew.value && !original) {
  throw createError({ statusCode: 404, statusMessage: 'Colección no encontrada' })
}

const collection = ref<Collection>(original ? JSON.parse(JSON.stringify(original)) : buildEmpty())
const snapshot = ref<string>(JSON.stringify(collection.value))

/* ── Dirty state ── */
const isDirty = computed(() => JSON.stringify(collection.value) !== snapshot.value)

/* ── Helpers ── */
const getCover = (p: Product) => getProductCoverImage(p) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&auto=format&fit=crop'
const getPrice = (p: Product) => getProductPrice(p)
const formatPrice = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n)
const getStatusLabel = (s: string) => s === 'active' ? 'Activo' : 'Borrador'

/* ── Products in collection ── */
const collectionProducts = computed(() =>
  collection.value.productIds
    .map(pid => catalogStore.getProductById(pid))
    .filter((p): p is Product => !!p)
)

/* ── Product sort ── */
const productSortBy = ref('manual')
const productSortOptions = [
  { label: 'Manual', value: 'manual' },
  { label: 'Nombre A–Z', value: 'name-asc' },
  { label: 'Nombre Z–A', value: 'name-desc' },
  { label: 'Precio ↑', value: 'price-asc' },
  { label: 'Precio ↓', value: 'price-desc' },
]

const sortedProducts = computed(() => {
  const list = [...collectionProducts.value]
  if (productSortBy.value === 'manual') return list
  const [field, dir] = productSortBy.value.split('-')
  list.sort((a, b) => {
    let cmp = 0
    if (field === 'name') cmp = a.name.localeCompare(b.name)
    else if (field === 'price') cmp = getPrice(a) - getPrice(b)
    return dir === 'desc' ? -cmp : cmp
  })
  return list
})

/* ── Add products modal ── */
const isAddProductsModalOpen = ref(false)
const productSearchQuery = ref('')
const pendingSelectedProducts = ref<string[]>([])

const availableProductsToAdd = computed(() =>
  catalogStore.products.filter(p =>
    !collection.value.productIds.includes(p.id) &&
    p.name.toLowerCase().includes(productSearchQuery.value.toLowerCase())
  )
)

const openAddProductsModal = () => {
  pendingSelectedProducts.value = []
  productSearchQuery.value = ''
  isAddProductsModalOpen.value = true
}

const confirmAddProducts = () => {
  collection.value.productIds.push(...pendingSelectedProducts.value)
  isAddProductsModalOpen.value = false
  toast.add({ title: 'Productos añadidos', description: `Se han añadido ${pendingSelectedProducts.value.length} producto(s).`, color: 'green' })
}

const removeProduct = (productId: string) => {
  collection.value.productIds = collection.value.productIds.filter(id => id !== productId)
}

/* ── Image ── */
const isMediaModalOpen = ref(false)
const handleMediaConfirm = (urls: string[]) => {
  if (urls.length > 0) {
    collection.value.image = urls[0]
  }
}
const removeImage = () => {
  collection.value.image = ''
}

/* ── Status options ── */
const statusOptions = ['active', 'draft']
const statusDisplayOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Borrador', value: 'draft' },
]

/* ── Template options ── */
const templateOptions = [
  { label: 'Colección predeterminada', value: '' },
]

/* ── Publication channels ── */
const channels = ref([
  { name: 'Tienda online', published: true },
])

/* ── Navigation ── */
const goBack = () => router.push('/menu/collections')

const currentIndex = computed(() =>
  collectionsStore.collections.findIndex(c => c.id === id)
)
const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < collectionsStore.collections.length - 1 && currentIndex.value !== -1)
const goToPrevious = () => {
  if (hasPrevious.value) router.push(`/menu/collections/${collectionsStore.collections[currentIndex.value - 1].id}`)
}
const goToNext = () => {
  if (hasNext.value) router.push(`/menu/collections/${collectionsStore.collections[currentIndex.value + 1].id}`)
}

/* ── Save ── */
const saving = ref(false)
const handleSave = async () => {
  saving.value = true
  try {
    if (isNew.value) {
      const created = await collectionsStore.createCollection({
        title: collection.value.title,
        description: collection.value.description,
        type: collection.value.type,
        status: collection.value.status,
        image: collection.value.image,
        productIds: collection.value.productIds,
        sortOrder: collection.value.sortOrder,
        themeTemplate: collection.value.themeTemplate,
      })
      if (created) {
        toast.add({ title: 'Colección creada', description: `"${created.title}" se ha creado correctamente.`, color: 'green' })
        router.replace(`/menu/collections/${created.id}`)
      }
    } else {
      const updated = await collectionsStore.updateCollection(collection.value.id, collection.value)
      if (updated) {
        collection.value = JSON.parse(JSON.stringify(updated))
        snapshot.value = JSON.stringify(collection.value)
        toast.add({ title: 'Guardado', description: 'Los cambios se han guardado correctamente.', color: 'green' })
      } else {
        toast.add({ title: 'Error', description: 'No se pudo guardar la colección.', color: 'red' })
      }
    }
  } finally {
    saving.value = false
  }
}

/* ── Discard ── */
const handleDiscard = () => {
  if (isNew.value) {
    goBack()
  } else {
    collection.value = JSON.parse(JSON.stringify(original))
    snapshot.value = JSON.stringify(collection.value)
  }
}

/* ── Duplicate ── */
const handleDuplicate = async () => {
  const dup = await collectionsStore.createCollection({
    title: `${collection.value.title} (copia)`,
    description: collection.value.description,
    type: collection.value.type,
    status: 'draft',
    image: collection.value.image,
    productIds: [...collection.value.productIds],
    sortOrder: collection.value.sortOrder,
    themeTemplate: collection.value.themeTemplate,
  })
  if (dup) {
    toast.add({ title: 'Colección duplicada', description: `Se ha creado "${dup.title}".`, color: 'green' })
    router.push(`/menu/collections/${dup.id}`)
  }
}

/* ── Delete ── */
const isDeleteModalOpen = ref(false)
const handleDelete = async () => {
  const ok = await collectionsStore.deleteCollection(collection.value.id)
  if (ok) {
    toast.add({ title: 'Colección eliminada', description: 'La colección se ha eliminado permanentemente.', color: 'red' })
    router.push('/menu/collections')
  }
  isDeleteModalOpen.value = false
}

/* ── More actions ── */
const moreActions = computed(() => [
  [{ label: 'Duplicar colección', icon: 'i-lucide-copy', click: handleDuplicate }],
  [{ label: 'Eliminar colección', icon: 'i-lucide-trash', color: 'red' as const, click: () => { isDeleteModalOpen.value = true } }],
])
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden relative">
    <!-- Sticky Top Header -->
    <div class="sticky top-0 z-20 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 pb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" size="sm" @click="goBack" />
        <div class="flex items-center gap-1 text-[14px]">
          <UIcon name="i-lucide-folder-heart" class="w-4 h-4 text-gray-500" />
          <UIcon name="i-lucide-chevron-right" class="w-3 h-3 text-gray-400" />
          <span class="font-bold text-gray-900 dark:text-white">{{ isNew ? 'Crear colección' : collection.title }}</span>
          <UBadge
            v-if="!isNew"
            :color="collection.status === 'active' ? 'green' : 'gray'"
            variant="soft"
            size="xs"
            class="ml-2 font-semibold"
          >
            {{ getStatusLabel(collection.status) }}
          </UBadge>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="!isNew">
          <UButton color="gray" variant="soft" size="sm" class="font-semibold text-gray-700 dark:text-gray-300" @click="handleDuplicate">Duplicar</UButton>
          <UDropdown :items="moreActions">
            <UButton color="gray" variant="soft" size="sm" trailing-icon="i-lucide-chevron-down" class="font-semibold text-gray-700 dark:text-gray-300">Más acciones</UButton>
          </UDropdown>
          <div class="flex items-center gap-1 border-l border-gray-200 dark:border-gray-800 ml-1 pl-1">
            <UButton icon="i-lucide-chevron-up" color="gray" variant="ghost" size="xs" :disabled="!hasPrevious" @click="goToPrevious" />
            <UButton icon="i-lucide-chevron-down" color="gray" variant="ghost" size="xs" :disabled="!hasNext" @click="goToNext" />
          </div>
        </template>
        <template v-else>
          <UButton color="gray" variant="soft" size="sm" class="font-semibold text-gray-700 dark:text-gray-300" @click="goBack">Cancelar</UButton>
        </template>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 scroll-smooth">
      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        <!-- Left Column (Main Content) -->
        <div class="flex-1 flex flex-col gap-5">

          <!-- Title & Description -->
          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <div class="space-y-4">
              <UFormGroup label="Título" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1' } }">
                <UInput v-model="collection.title" placeholder="Ej: Ofertas de verano" class="w-full" />
              </UFormGroup>
              <UFormGroup label="Descripción" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1' } }">
                <AppEditor v-model="collection.description" />
              </UFormGroup>
            </div>
          </UCard>

          <!-- Products -->
          <UCard :ui="{ shadow: 'shadow-sm', rounded: 'rounded-xl', ring: 'ring-1 ring-gray-200 dark:ring-gray-800', body: { padding: 'p-0 sm:p-0' }, header: { padding: 'p-4 sm:px-5' } }">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-package-search" class="w-5 h-5 text-gray-400" />
                  <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Productos</h3>
                  <UBadge color="gray" variant="soft" size="xs" class="ml-1 rounded-full">{{ collection.productIds.length }}</UBadge>
                </div>
                <div class="flex items-center gap-2">
                  <USelectMenu
                    v-model="productSortBy"
                    :options="productSortOptions"
                    value-attribute="value"
                    size="xs"
                    class="w-32"
                  />
                  <UButton color="black" variant="soft" size="sm" icon="i-lucide-plus" @click="openAddProductsModal">Añadir</UButton>
                </div>
              </div>
            </template>

            <!-- Manual collection info -->
            <div v-if="collection.type === 'automated'" class="px-5 py-4 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/20">
              <div class="flex items-start gap-2">
                <UIcon name="i-lucide-info" class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p class="text-sm text-blue-700 dark:text-blue-300">Las colecciones automatizadas se poblan según reglas. Esta funcionalidad estará disponible próximamente.</p>
              </div>
            </div>

            <!-- Product list -->
            <div v-if="sortedProducts.length > 0" class="divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="product in sortedProducts"
                :key="product.id"
                class="px-4 sm:px-5 py-3 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                    <img :src="getCover(product)" class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div class="font-medium text-sm text-gray-900 dark:text-white">{{ product.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatPrice(getPrice(product)) }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge :color="product.status === 'active' ? 'green' : 'gray'" variant="subtle" size="xs">
                    {{ product.status === 'active' ? 'Activo' : 'Borrador' }}
                  </UBadge>
                  <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-lucide-x"
                    size="xs"
                    class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="removeProduct(product.id)"
                  />
                </div>
              </div>
            </div>

            <!-- No products -->
            <div v-else class="py-12 text-center">
              <UIcon name="i-lucide-package" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-500 mb-3">No hay productos en esta colección.</p>
              <UButton color="black" variant="soft" size="sm" icon="i-lucide-plus" @click="openAddProductsModal">Añadir productos</UButton>
            </div>
          </UCard>

          <!-- SEO Preview -->
          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }" class="mb-10">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Publicación en motores de búsqueda</h3>
                <UButton icon="i-lucide-pencil" color="gray" variant="ghost" size="sm" />
              </div>
            </template>
            <div class="space-y-1">
              <p class="text-[13px] text-gray-600 dark:text-gray-400">{{ seoStoreName }}</p>
              <p class="text-[12px] text-gray-400 dark:text-gray-500">https://{{ seoDomain }} › collections › {{ collection.handle || collection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') }}</p>
              <h4 class="text-[15px] font-semibold text-blue-700 dark:text-blue-400 mt-1 uppercase">{{ collection.title || 'Título de la colección' }}</h4>
              <p class="text-[13px] text-gray-600 dark:text-gray-400 leading-snug">{{ collection.description || 'Sin descripción' }}</p>
            </div>
          </UCard>
        </div>

        <!-- Right Column (Sidebar) -->
        <div class="w-full lg:w-[320px] flex flex-col gap-5">

          <!-- Status -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Estado</h3>
            </template>
            <USelectMenu v-model="collection.status" :options="statusDisplayOptions" value-attribute="value" size="md" color="gray" />
          </UCard>

          <!-- Publication -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Publicación</h3>
                <UIcon name="i-lucide-share-2" class="w-4 h-4 text-gray-400" />
              </div>
            </template>
            <div class="space-y-3">
              <div v-for="ch in channels" :key="ch.name" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-monitor" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ ch.name }}</span>
                </div>
                <UToggle v-model="ch.published" color="primary" size="sm" />
              </div>
              <p class="text-[12px] text-gray-500 mt-2">Las colecciones no publicadas en "Tienda online" no son visibles públicamente, pero el editor de temas puede previsualizarlas.</p>
            </div>
          </UCard>

          <!-- Collection Type -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Tipo de colección</h3>
            </template>
            <URadioGroup
              v-model="collection.type"
              :options="[
                { label: 'Manual', value: 'manual', description: 'Eliges los productos uno a uno.' },
                { label: 'Automatizada', value: 'automated', description: 'Reglas de etiquetas o precio. (Próximamente)', disabled: true }
              ]"
              class="space-y-3"
            />
          </UCard>

          <!-- Image -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Imagen</h3>
                <UButton v-if="collection.image" icon="i-lucide-trash" color="gray" variant="ghost" size="xs" @click="removeImage" />
              </div>
            </template>

            <div v-if="collection.image" class="group relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-pointer" @click="isMediaModalOpen = true">
              <img :src="collection.image" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-white text-sm font-medium flex items-center gap-2">
                  <UIcon name="i-lucide-camera" class="w-5 h-5" />
                  Cambiar imagen
                </span>
              </div>
            </div>

            <div v-else class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg py-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors" @click="isMediaModalOpen = true">
              <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-2">
                <UIcon name="i-lucide-image-plus" class="w-5 h-5 text-gray-400" />
              </div>
              <span class="text-sm text-gray-500">Añadir imagen</span>
            </div>
          </UCard>

          <!-- Theme Template -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Plantilla de tema</h3>
                <UIcon name="i-lucide-eye" class="w-4 h-4 text-gray-400" />
              </div>
            </template>
            <USelectMenu v-model="collection.themeTemplate" :options="templateOptions" value-attribute="value" color="gray" />
            <p class="text-[12px] text-gray-500 mt-2">Define qué plantilla del tema se usa para mostrar esta colección en la tienda online.</p>
          </UCard>

        </div>
      </div>
    </div>

    <!-- Sticky Bottom Footer -->
    <div v-if="isDirty || isNew" class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 backdrop-blur-md flex justify-end gap-3 z-30">
      <UButton color="white" variant="solid" class="font-bold px-6 border border-gray-300 dark:border-gray-700" @click="handleDiscard">Descartar</UButton>
      <UButton color="black" class="font-bold px-8" :loading="saving" @click="handleSave">Guardar</UButton>
    </div>

    <!-- Add Products Modal -->
    <UModal v-model="isAddProductsModalOpen" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard :ui="{ ring: '', divide: '', body: { padding: 'p-0' } }">
        <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 class="font-semibold text-lg flex items-center gap-2">
            <UIcon name="i-lucide-package-plus" />
            Añadir productos a la colección
          </h3>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="isAddProductsModalOpen = false" />
        </div>

        <div class="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <UInput v-model="productSearchQuery" icon="i-lucide-search" placeholder="Busca productos por nombre…" size="md" />
        </div>

        <div class="max-h-[400px] overflow-y-auto p-2">
          <div v-if="availableProductsToAdd.length === 0" class="text-center py-8 text-sm text-gray-500">
            No se encontraron productos disponibles.
          </div>

          <div v-for="product in availableProductsToAdd" :key="product.id" class="p-2">
            <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer select-none">
              <UCheckbox
                :model-value="pendingSelectedProducts.includes(product.id)"
                @update:model-value="(v: any) => { if(v) pendingSelectedProducts.push(product.id); else pendingSelectedProducts = pendingSelectedProducts.filter(id => id !== product.id); }"
              />
              <div class="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 flex-shrink-0 overflow-hidden">
                <img :src="getCover(product)" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-sm text-gray-900 dark:text-white">{{ product.name }}</div>
                <div class="text-xs text-gray-500">{{ formatPrice(getPrice(product)) }}</div>
              </div>
              <UBadge :color="product.status === 'active' ? 'green' : 'gray'" variant="subtle" size="xs">
                {{ product.status === 'active' ? 'Activo' : 'Borrador' }}
              </UBadge>
            </label>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center rounded-b-lg">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ pendingSelectedProducts.length }} seleccionado{{ pendingSelectedProducts.length !== 1 ? 's' : '' }}</span>
          <div class="flex gap-3">
            <UButton color="gray" variant="ghost" @click="isAddProductsModalOpen = false">Cancelar</UButton>
            <UButton color="black" @click="confirmAddProducts" :disabled="pendingSelectedProducts.length === 0">Añadir productos</UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-red-500" />
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Eliminar colección</h3>
          </div>
        </template>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          ¿Estás seguro de que quieres eliminar <strong>"{{ collection.title }}"</strong>? Esta acción es permanente y no se puede deshacer. Los productos de esta colección no se eliminarán.
        </p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="ghost" @click="isDeleteModalOpen = false">Cancelar</UButton>
            <UButton color="red" @click="handleDelete">Eliminar</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Media Modal -->
    <AppMediaModal v-model="isMediaModalOpen" @confirm="handleMediaConfirm" />
  </div>
</template>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
