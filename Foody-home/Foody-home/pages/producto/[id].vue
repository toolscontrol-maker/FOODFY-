<script setup lang="ts">
import { useProductsStore } from '~/stores/useProductsStore'

interface ModifierOption {
  id: string | number
  label: string
  price: number
}

interface ModifierGroup {
  id: string | number
  name: string
  type: 'single' | 'multiple'
  required: boolean
  options: ModifierOption[]
}

definePageMeta({
  layout: 'dashboard'
})

const store = useProductsStore()
const route = useRoute()
const router = useRouter()
const id = route.params.id
const toast = useToast()

interface Product {
  id: string | number
  name: string
  status: string
  desc: string
  category: string
  price: number
  comparePrice?: number
  costPrice?: number
  inventory: number
  sku: string
  barcode?: string
  weight: number
  vendor: string
  collections: string[]
  tags: string[]
  type: string
  template: string
  image?: string // Still keep for backward compatibility or simple usage
  images: string[]
  coverImage?: string
  modifiers: ModifierGroup[]
}

// Initialize product with data from store or defaults
const originalProduct = store.products.find(p => String(p.id) === String(id))
const product = ref<Product>(originalProduct ? JSON.parse(JSON.stringify(originalProduct)) : {
  id: id === 'new' ? Date.now() : String(id),
  name: '',
  status: 'Activo',
  desc: '',
  category: 'Sin categoría',
  price: 0,
  comparePrice: 0,
  costPrice: 0,
  inventory: 0,
  sku: '',
  barcode: '',
  weight: 0,
  vendor: 'Mi tienda',
  collections: ['Página de inicio'],
  tags: [] as string[],
  type: '',
  template: 'Producto predeterminado',
  images: [] as string[],
  coverImage: '',
  modifiers: [] as ModifierGroup[]
})

const isNew = computed(() => id === 'new')

// Initialize images if they don't exist
if (!product.value.images) {
  product.value.images = product.value.image ? [product.value.image] : []
}
if (!product.value.coverImage && product.value.images.length > 0) {
  product.value.coverImage = product.value.images[0]
}

// Ensure modifiers array exists
if (!product.value.modifiers) {
  product.value.modifiers = []
}

const addModifierGroup = () => {
  product.value.modifiers.push({
    id: Date.now(),
    name: '',
    type: 'multiple',
    required: false,
    options: []
  })
}

const removeModifierGroup = (index: any) => {
  product.value.modifiers.splice(Number(index), 1)
}

const addOption = (groupIndex: any) => {
  product.value.modifiers[Number(groupIndex)].options.push({
    id: Date.now(),
    label: '',
    price: 0
  })
}

const removeOption = (groupIndex: any, optionIndex: any) => {
  product.value.modifiers[Number(groupIndex)].options.splice(Number(optionIndex), 1)
}

const goBack = () => {
  router.push('/producto')
}

const isMediaModalOpen = ref(false)

const addProductImage = () => {
  isMediaModalOpen.value = true
}

const handleMediaConfirm = (newUrls: string[]) => {
  newUrls.forEach(url => {
    if (!product.value.images.includes(url)) {
      product.value.images.push(url)
    }
  })
  
  if (!product.value.coverImage && product.value.images.length > 0) {
    product.value.coverImage = product.value.images[0]
  }
}

const removeProductImage = (index: number) => {
  const removedUrl = product.value.images[index]
  product.value.images.splice(index, 1)
  
  if (product.value.coverImage === removedUrl) {
    product.value.coverImage = product.value.images.length > 0 ? product.value.images[0] : ''
  }
}

const setAsCover = (url: string) => {
  product.value.coverImage = url
}

const currentIndex = computed(() => {
  return store.products.findIndex(p => String(p.id) === String(id))
})

const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < store.products.length - 1 && currentIndex.value !== -1)

const goToPrevious = () => {
  if (hasPrevious.value) {
    const prevId = store.products[currentIndex.value - 1].id
    router.push(`/producto/${prevId}`)
  }
}

const goToNext = () => {
  if (hasNext.value) {
    const nextId = store.products[currentIndex.value + 1].id
    router.push(`/producto/${nextId}`)
  }
}

const handleSave = () => {
  if (isNew.value) {
    store.addProduct(product.value)
    toast.add({
      title: 'Producto creado',
      description: `El producto "${product.value.name}" ha sido creado correctamente.`,
      color: 'green'
    })
    router.push(`/producto/${product.value.id}`)
  } else {
    store.updateProduct(product.value)
    toast.add({
      title: 'Producto guardado',
      description: `El producto "${product.value.name}" ha sido actualizado correctamente.`,
      color: 'green'
    })
  }
}

const handleDuplicate = () => {
  const duplicated = JSON.parse(JSON.stringify(product.value))
  duplicated.id = Date.now()
  duplicated.name = `${duplicated.name} (copia)`
  store.addProduct(duplicated)
  toast.add({
    title: 'Producto duplicado',
    description: `Se ha creado una copia de "${product.value.name}".`,
    color: 'green'
  })
}

const handleDelete = () => {
  store.deleteProduct(id as string)
  toast.add({
    title: 'Producto eliminado',
    description: 'El producto ha sido eliminado del catálogo.',
    color: 'red'
  })
  router.push('/producto')
}

const handleArchive = () => {
  product.value.status = 'Archivado'
  handleSave()
}

const statusOptions = ['Activo', 'Borrador', 'Archivado']
const vendorOptions = ['Mi tienda', 'Proveedor Externo']
const templateOptions = ['Producto predeterminado', 'Producto especial']

const moreActions = [
  [{ label: 'Archivar', icon: 'i-lucide-archive', click: handleArchive }],
  [{ label: 'Eliminar producto', icon: 'i-lucide-trash', color: 'red', click: handleDelete }]
]

const isSidebarCollapsed = ref(false)
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden relative">
    <!-- Sticky Top Header -->
    <div class="sticky top-0 z-20 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 pb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-arrow-left"
          color="gray"
          variant="ghost"
          size="sm"
          @click="goBack"
        />
        <div class="flex items-center gap-1 text-[14px]">
          <UIcon name="i-lucide-tag" class="w-4 h-4 text-gray-500 -rotate-45" />
          <UIcon name="i-lucide-chevron-right" class="w-3 h-3 text-gray-400" />
          <span class="font-bold text-gray-900 dark:text-white">{{ isNew ? 'Agregar producto' : product.name }}</span>
          <UBadge v-if="!isNew" :color="product.status === 'Activo' ? 'green' : (product.status === 'Archivado' ? 'red' : 'gray')" variant="soft" size="xs" class="ml-2 font-semibold">
            {{ product.status }}
          </UBadge>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <template v-if="!isNew">
          <UButton color="gray" variant="soft" size="sm" class="font-semibold text-gray-700 dark:text-gray-300" @click="handleDuplicate">Duplicar</UButton>
          <UButton color="gray" variant="soft" size="sm" class="font-semibold text-gray-700 dark:text-gray-300">Previsualizar</UButton>
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
          
          <!-- Title & Description Card -->
          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <div class="space-y-4">
              <UFormGroup label="Título" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1' } }">
                <UInput v-model="product.name" placeholder="Ej: Pizza Marghuerita" class="w-full" />
              </UFormGroup>
              
              <UFormGroup label="Descripción" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1' } }">
                <AppEditor v-model="product.desc" />
              </UFormGroup>
            </div>
          </UCard>

          <!-- Multimedia Card -->
          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Multimedia</h3>
                <UButton
                  v-if="product.images.length > 0"
                  icon="i-lucide-plus"
                  color="gray"
                  variant="ghost"
                  size="xs"
                  @click="addProductImage"
                >
                  Añadir más
                </UButton>
              </div>
            </template>
            
            <div v-if="product.images.length > 0" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              <div 
                v-for="(img, idx) in product.images" 
                :key="idx" 
                class="relative group aspect-square rounded-xl overflow-hidden border transition-all"
                :class="product.coverImage === img ? 'ring-2 ring-primary-500 border-primary-500 shadow-md' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'"
              >
                <img :src="img" class="w-full h-full object-cover" />
                
                <!-- Portada Badge -->
                <div v-if="product.coverImage === img" class="absolute top-2 left-2 px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                  Portada
                </div>

                <!-- Hover Actions -->
                <div class="absolute inset-0 bg-black/50 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2 transition-all">
                  <div class="flex gap-2 mb-2">
                    <UButton 
                      icon="i-lucide-trash" 
                      color="red" 
                      variant="solid" 
                      size="xs" 
                      @click.stop="removeProductImage(idx)" 
                    />
                    <UButton 
                      v-if="product.coverImage !== img"
                      icon="i-lucide-star" 
                      color="white" 
                      variant="solid" 
                      size="xs" 
                      @click.stop="setAsCover(img)" 
                      title="Establecer como portada"
                    />
                  </div>
                  <span v-if="product.coverImage === img" class="text-[10px] text-white font-medium">Foto principal</span>
                </div>
              </div>

              <!-- Add More Slot (Inside grid) -->
              <button 
                @click="addProductImage"
                class="aspect-square border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 transition-all text-gray-400 dark:text-gray-500"
              >
                <UIcon name="i-lucide-plus" class="w-6 h-6" />
                <span class="text-[11px] font-medium">Añadir</span>
              </button>
            </div>

            <div v-else class="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl py-16 flex flex-col items-center justify-center text-center bg-gray-50/30 dark:bg-gray-800/10">
               <div class="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
                 <UIcon name="i-lucide-image-plus" class="w-8 h-8 text-gray-400" />
               </div>
               <div class="flex gap-3">
                 <UButton color="black" size="sm" class="font-medium shadow-md" @click="addProductImage">Subir nuevo</UButton>
                 <UButton variant="soft" color="gray" size="sm" class="font-medium">Seleccionar existente</UButton>
               </div>
               <p class="text-[13px] text-gray-500 mt-4 max-w-[240px]">Acepta imágenes, videos o modelos 3D para tus productos.</p>
            </div>
          </UCard>

          <!-- Category Card -->
          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
             <UFormGroup label="Categoría" :ui="{ label: { text: 'text-[14px] font-semibold text-gray-900 dark:text-white mb-3' } }">
               <USelectMenu v-model="product.category" :options="store.categories" size="md" color="gray" />
               <p class="text-[13px] text-gray-500 mt-3 leading-relaxed">Determina las tasas de impuestos y agrega metacampos para mejorar la búsqueda, los filtros y las ventas multicanal</p>
             </UFormGroup>
          </UCard>

          <!-- Price Card -->
          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
             <template #header>
               <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Precio</h3>
             </template>
             <div class="space-y-6">
                <UFormGroup label="Precio" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
                   <UInput v-model="product.price" type="number" step="0.01" trailing-icon="i-lucide-euro" class="max-w-[180px]" />
                </UFormGroup>
                
                <div class="flex flex-wrap gap-2">
                  <UButton color="gray" variant="soft" size="xs" class="bg-gray-100 dark:bg-gray-800 font-medium">Precio de comparación</UButton>
                  <UButton color="gray" variant="soft" size="xs" class="bg-gray-100 dark:bg-gray-800 font-medium">Precio unitario</UButton>
                  <UButton color="gray" variant="soft" size="xs" class="bg-gray-100 dark:bg-gray-800 font-medium">Cobrar impuesto <span class="text-gray-500 ml-1">Sí</span></UButton>
                  <UButton color="gray" variant="soft" size="xs" class="bg-gray-100 dark:bg-gray-800 font-medium">Costo por artículo</UButton>
                  <UButton icon="i-lucide-chevron-down" color="gray" variant="ghost" size="xs" />
                </div>
             </div>
          </UCard>

          <!-- Inventory Card -->
          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
             <template #header>
               <div class="flex items-center justify-between">
                 <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Inventario</h3>
                 <div class="flex items-center gap-2">
                   <span class="text-[13px] text-gray-600 dark:text-gray-400">Inventario con seguimiento</span>
                   <UToggle :model-value="true" size="sm" color="primary" />
                 </div>
               </div>
             </template>
             
             <div class="space-y-6">
                <table class="w-full text-left text-[14px]">
                   <thead class="text-gray-500 font-normal border-b border-gray-100 dark:border-gray-800">
                      <tr>
                        <th class="py-2">Sucursales</th>
                        <th class="py-2 text-right">No disponible</th>
                        <th class="py-2 text-right">Comprometido</th>
                        <th class="py-2 text-right">Disponible</th>
                        <th class="py-2 text-right">En existencia</th>
                      </tr>
                   </thead>
                   <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                        <td class="py-3 font-medium">Sucursal de la tienda</td>
                        <td class="py-3 text-right">0 <UIcon name="i-lucide-chevron-down" class="w-3 h-3 ml-1" /></td>
                        <td class="py-3 text-right">0 <UIcon name="i-lucide-chevron-down" class="w-3 h-3 ml-1" /></td>
                        <td class="py-3 text-right">0 <UIcon name="i-lucide-chevron-down" class="w-3 h-3 ml-1" /></td>
                        <td class="py-3 text-right text-gray-900 dark:text-white font-bold">
                           <UInput v-model="product.inventory" type="number" size="xs" class="w-20 inline-block text-right" />
                        </td>
                      </tr>
                   </tbody>
                </table>
                
                <a href="#" class="text-[13px] font-medium text-blue-600 hover:underline inline-block mt-2">Ver historial de ajustes</a>

                <div class="flex flex-wrap gap-2 pt-4">
                  <UButton color="gray" variant="soft" size="xs" class="bg-gray-100 dark:bg-gray-800 font-medium">SKU</UButton>
                  <UButton color="gray" variant="soft" size="xs" class="bg-gray-100 dark:bg-gray-800 font-medium">Código de barras</UButton>
                  <UButton color="gray" variant="soft" size="xs" class="bg-gray-100 dark:bg-gray-800 font-medium">Vender sin existencias <span class="text-gray-500 ml-1">Desactivado</span></UButton>
                  <UButton icon="i-lucide-chevron-down" color="gray" variant="ghost" size="xs" />
                </div>
             </div>
          </UCard>

          <!-- Modifiers Card -->
          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
             <template #header>
               <div class="flex items-center justify-between">
                 <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Opciones de personalización</h3>
               </div>
             </template>
             
             <div class="space-y-6">
               <div v-for="(group, groupIdx) in product.modifiers" :key="group.id" class="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-800/20 relative group/card">
                 <UButton 
                   icon="i-lucide-trash" 
                   color="red" 
                   variant="ghost" 
                   size="xs" 
                   class="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity" 
                   @click="removeModifierGroup(Number(groupIdx))"
                 />
                 
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                   <UFormGroup label="Nombre del grupo (ej: Ingredientes)">
                     <UInput v-model="group.name" placeholder="Ej: Quitar ingredientes" size="sm" />
                   </UFormGroup>
                   <UFormGroup label="Selección">
                     <USelectMenu 
                       v-model="group.type" 
                       :options="[{ label: 'Múltiple (Checkboxes)', value: 'multiple' }, { label: 'Única (Radio)', value: 'single' }]" 
                       value-attribute="value" 
                       size="sm"
                     />
                   </UFormGroup>
                 </div>

                 <div class="space-y-2">
                   <div v-for="(option, optIdx) in group.options" :key="option.id" class="flex gap-2 items-center">
                     <UInput v-model="option.label" placeholder="Ej: Sin lechuga" class="flex-1" size="xs" />
                     <UInput v-model.number="option.price" type="number" step="0.1" placeholder="0.00" class="w-24" size="xs" trailing-icon="i-lucide-euro" />
                     <UButton icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="removeOption(Number(groupIdx), Number(optIdx))" />
                   </div>
                   <UButton 
                     icon="i-lucide-plus" 
                     color="gray" 
                     variant="ghost" 
                     size="xs" 
                     label="Añadir opción" 
                     class="mt-2 text-primary-600 dark:text-primary-400 font-medium" 
                     @click="addOption(Number(groupIdx))"
                   />
                 </div>
               </div>

               <UButton 
                 icon="i-lucide-plus-circle" 
                 color="primary" 
                 variant="soft" 
                 size="sm" 
                 label="Añadir grupo de opciones" 
                 class="w-full justify-center py-2 dashed-border" 
                 @click="addModifierGroup"
               />
               <p class="text-[12px] text-gray-500 italic text-center">Ejemplos: Sin lechuga, Sin tomate, Extra de queso, Término de la carne...</p>
             </div>
          </UCard>

          <!-- SEO Search Preview Card -->
          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }" class="mb-10">
             <template #header>
               <div class="flex items-center justify-between">
                 <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Publicación en motores de búsqueda</h3>
                 <UButton icon="i-lucide-pencil" color="gray" variant="ghost" size="sm" />
               </div>
             </template>
             <div class="space-y-1">
               <p class="text-[13px] text-gray-600 dark:text-gray-400">Mi tienda</p>
               <p class="text-[12px] text-gray-400 dark:text-gray-500">https://foodfy.store > products > {{ product.name.toLowerCase().replace(/ /g, '-') }}</p>
               <h4 class="text-[15px] font-semibold text-blue-700 dark:text-blue-400 mt-1 uppercase">{{ product.name }}</h4>
               <p class="text-[13px] text-gray-600 dark:text-gray-400 leading-snug">{{ product.desc || 'Sin descripción' }}</p>
               <p class="text-[13px] text-gray-900 dark:text-white font-medium">{{ product.price }} € EUR</p>
             </div>
          </UCard>
        </div>

        <!-- Right Column (Sidebar) -->
        <div class="w-full lg:w-[320px] flex flex-col gap-5">
          
          <!-- Status Card -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Estado</h3>
            </template>
            <USelectMenu v-model="product.status" :options="statusOptions" size="md" color="gray" />
          </UCard>

          <!-- Publication Card -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Publicación</h3>
                <UButton icon="i-lucide-share-2" color="gray" variant="ghost" size="xs" />
              </div>
            </template>
            <div class="space-y-3">
              <UButton v-for="channel in ['Tienda online', 'Point of Sale', 'Shop']" :key="channel" color="gray" variant="soft" size="xs" class="w-full justify-start font-medium text-gray-700 dark:text-gray-300">
                <template #trailing>
                  <UIcon v-if="channel === 'Tienda online'" name="i-lucide-calendar" class="w-3.5 h-3.5 ml-auto text-gray-400" />
                </template>
                {{ channel }}
              </UButton>
            </div>
          </UCard>

          <!-- Organization Card -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Organización del producto</h3>
                <UIcon name="i-lucide-info" class="w-4 h-4 text-gray-400" />
              </div>
            </template>
            <div class="space-y-4">
               <UFormGroup label="Tipo" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1' } }">
                 <UInput v-model="product.type" placeholder="Ej: Pizza" />
               </UFormGroup>
               <UFormGroup label="Proveedor" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1' } }">
                 <USelectMenu v-model="product.vendor" :options="vendorOptions" color="gray" />
               </UFormGroup>
               <UFormGroup label="Colecciones" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1' } }">
                 <div class="space-y-2">
                   <UInput icon="i-lucide-search" placeholder="Buscar colecciones..." />
                   <div class="flex flex-wrap gap-2">
                     <UBadge v-for="(collection, idx) in product.collections" :key="idx" color="gray" variant="soft" size="xs">
                        {{ collection }}
                        <UIcon name="i-lucide-x" class="ml-1 w-3 h-3 cursor-pointer" @click="product.collections.splice(idx, 1)" />
                     </UBadge>
                   </div>
                 </div>
               </UFormGroup>
               <UFormGroup label="Etiquetas" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1' } }">
                 <UInput placeholder="Buscar etiquetas..." />
               </UFormGroup>
            </div>
          </UCard>

          <!-- Theme Template Card -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Plantilla de tema</h3>
                <UIcon name="i-lucide-eye" class="w-4 h-4 text-gray-400" />
              </div>
            </template>
            <USelectMenu v-model="product.template" :options="templateOptions" color="gray" />
          </UCard>
        </div>

      </div>
    </div>

    <!-- Sticky Bottom Footer for Saving -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 backdrop-blur-md flex justify-end gap-3 z-30">
       <UButton color="white" variant="solid" class="font-bold px-6 border border-gray-300 dark:border-gray-700" @click="goBack">Descartar</UButton>
       <UButton color="black" class="font-bold px-8" @click="handleSave">Guardar</UButton>
    </div>
    <AppMediaModal v-model="isMediaModalOpen" @confirm="handleMediaConfirm" />
  </div>
</template>

<style scoped>
.dashed-border {
  border: 2px dashed rgb(var(--color-primary-500) / 0.2);
  transition: all 0.2s ease;
}
.dashed-border:hover {
  border-color: rgb(var(--color-primary-500) / 0.5);
  background-color: rgb(var(--color-primary-500) / 0.05);
}

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
