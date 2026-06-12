<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({ layout: 'dashboard' })

const toast = useToast()

// --- Mock Data ---
interface Product {
  id: number
  name: string
  price: number
  image: string
  status: string
}

const mockProducts: Product[] = [
  { id: 1, name: 'Hamburguesa Clásica', price: 12.50, status: 'Activo', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150&auto=format&fit=crop' },
  { id: 2, name: 'Doble Smash Bacon', price: 15.00, status: 'Activo', image: 'https://i.redd.it/az5zx99z1vhb1.jpg' },
  { id: 3, name: 'Truffle Mushroom', price: 14.00, status: 'Inactivo', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=150&auto=format&fit=crop' },
  { id: 4, name: 'Patatas Fritas Grandes', price: 4.50, status: 'Activo', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=150&auto=format&fit=crop' },
  { id: 5, name: 'Aros de Cebolla', price: 5.50, status: 'Activo', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?q=80&w=150&auto=format&fit=crop' },
]

interface Collection {
  id: number
  title: string
  desc: string
  status: 'Activo' | 'Borrador'
  type: 'Manual' | 'Automatizada'
  image: string
  productCount: number
  productIds: number[]
}

const collections = ref<Collection[]>([
  {
    id: 101,
    title: 'Los Más Vendidos',
    desc: 'Los productos favoritos de nuestros clientes. Aparecerá en la página principal.',
    status: 'Activo',
    type: 'Manual',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop',
    productCount: 2,
    productIds: [1, 2]
  },
  {
    id: 102,
    title: 'Oferta Especial Verano',
    desc: 'Combos y productos frescos para el calor.',
    status: 'Borrador',
    type: 'Manual',
    image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=600&auto=format&fit=crop',
    productCount: 4,
    productIds: [2, 3, 4, 5]
  }
])

// --- State ---
const searchQuery = ref('')
const selectedCollection = ref<Collection | null>(null)
const isCreateModalOpen = ref(false)
const isAddProductsModalOpen = ref(false)

const newCollectionForm = ref({
  title: '',
  desc: '',
  type: 'Manual' as 'Manual' | 'Automatizada'
})

const productSearchQuery = ref('')
const pendingSelectedProducts = ref<number[]>([])

// --- Computed ---
const filteredCollections = computed(() => {
  if (!searchQuery.value) return collections.value
  return collections.value.filter(c => c.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const collectionProducts = computed(() => {
  if (!selectedCollection.value) return []
  return mockProducts.filter(p => selectedCollection.value!.productIds.includes(p.id))
})

const availableProductsToAdd = computed(() => {
  if (!selectedCollection.value) return []
  return mockProducts.filter(p => 
    !selectedCollection.value!.productIds.includes(p.id) &&
    p.name.toLowerCase().includes(productSearchQuery.value.toLowerCase())
  )
})

// --- Actions ---
const selectCollection = (c: Collection) => {
  selectedCollection.value = JSON.parse(JSON.stringify(c))
}

const formatPrice = (p: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(p)

const createCollection = () => {
  if (!newCollectionForm.value.title) return
  const newCol: Collection = {
    id: Date.now(),
    title: newCollectionForm.value.title,
    desc: newCollectionForm.value.desc,
    status: 'Borrador',
    type: newCollectionForm.value.type,
    image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=600&auto=format&fit=crop', // Placeholder
    productCount: 0,
    productIds: []
  }
  collections.value.unshift(newCol)
  isCreateModalOpen.value = false
  selectCollection(newCol)
  toast.add({ title: 'Colección creada', description: `Vete añadiendo productos a "${newCol.title}".`, color: 'green' })
  newCollectionForm.value = { title: '', desc: '', type: 'Manual' }
}

const saveCollection = () => {
  if (!selectedCollection.value) return
  const idx = collections.value.findIndex(c => c.id === selectedCollection.value!.id)
  if (idx !== -1) {
    collections.value[idx] = { ...selectedCollection.value }
    toast.add({ title: 'Guardado', description: 'Los cambios de la colección se han guardado.', color: 'green' })
  }
}

const removeProductFromCollection = (productId: number) => {
  if (!selectedCollection.value) return
  selectedCollection.value.productIds = selectedCollection.value.productIds.filter(id => id !== productId)
  selectedCollection.value.productCount = selectedCollection.value.productIds.length
}

const openAddProductsModal = () => {
  pendingSelectedProducts.value = []
  productSearchQuery.value = ''
  isAddProductsModalOpen.value = true
}

const confirmAddProducts = () => {
  if (!selectedCollection.value) return
  selectedCollection.value.productIds.push(...pendingSelectedProducts.value)
  selectedCollection.value.productCount = selectedCollection.value.productIds.length
  isAddProductsModalOpen.value = false
  toast.add({ title: 'Productos añadidos', description: `Se han añadido ${pendingSelectedProducts.value.length} productos a la colección.`, color: 'green' })
}

const deleteCollection = () => {
  if (!selectedCollection.value) return
  collections.value = collections.value.filter(c => c.id !== selectedCollection.value!.id)
  selectedCollection.value = null
  toast.add({ title: 'Colección eliminada', description: 'La colección ha sido borrada permanentemente.', color: 'red' })
}

const activeCollectionStatus = computed({
  get: () => selectedCollection.value?.status === 'Activo',
  set: (val) => {
    if (selectedCollection.value) {
      selectedCollection.value.status = val ? 'Activo' : 'Borrador'
    }
  }
})

// Initialize selection
if (collections.value.length > 0) {
  selectCollection(collections.value[0])
}
</script>

<template>
  <div class="absolute inset-0 flex flex-col bg-gray-50 dark:bg-gray-900 z-10 w-full">
    
    <!-- Top Header Navigation -->
    <div class="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-20">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-folder-heart" class="text-black dark:text-white" />
          Colecciones
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Agrupa productos para marketing, promociones o facilidad de búsqueda.</p>
      </div>
      <div class="flex gap-3">
        <UButton color="black" icon="i-lucide-plus" @click="isCreateModalOpen = true">Crear colección</UButton>
      </div>
    </div>

    <!-- Core Layout with Columns -->
    <div class="flex-1 flex overflow-hidden">
      
      <!-- Left Panel: Collections Sidebar -->
      <div class="w-80 lg:w-[400px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col z-10">
        <!-- Search -->
        <div class="p-4 border-b border-gray-100 dark:border-gray-800">
          <UInput 
            v-model="searchQuery" 
            icon="i-lucide-search" 
            placeholder="Buscar colecciones..." 
            class="w-full"
            variant="outline"
          />
        </div>

        <!-- Collections List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          <div v-if="filteredCollections.length === 0" class="text-center py-10 text-gray-500">
            <UIcon name="i-lucide-folder-search" class="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p class="text-sm font-medium">No hay colecciones</p>
          </div>

          <div
            v-for="col in filteredCollections"
            :key="col.id"
            @click="selectCollection(col)"
            class="flex items-center gap-3 p-3 rounded-xl transition-all border cursor-pointer group"
            :class="selectedCollection?.id === col.id 
              ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-500 ring-1 ring-primary-500' 
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'"
          >
            <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800 bg-gray-50 relative">
              <img :src="col.image" class="w-full h-full object-cover" />
              <div v-if="col.status === 'Borrador'" class="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px]"></div>
            </div>
            
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-sm text-gray-900 dark:text-white truncate" :class="selectedCollection?.id === col.id ? 'text-primary-700 dark:text-primary-400' : ''">{{ col.title }}</h4>
              <p class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <UIcon name="i-lucide-box" class="w-3 h-3" />
                {{ col.productCount }} productos
              </p>
            </div>

            <UBadge :color="col.status === 'Activo' ? 'green' : 'gray'" variant="subtle" size="xs">
              {{ col.status }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Right Panel: Collection Editor -->
      <div class="flex-1 overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900/50 relative">
        <div v-if="selectedCollection" class="flex-1 overflow-y-auto p-6 lg:p-10 hide-scrollbar pb-32">
          
          <div class="mx-auto space-y-6 mb-10">
            
            <!-- Header/Status Card -->
            <div class="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
               <div>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Detalles de Colección</h3>
                  <p class="text-sm text-gray-500 mt-1">Configura la visibilidad y los productos que pertenecen a la colección.</p>
               </div>
               <div class="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-full border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer select-none" @click="activeCollectionStatus = !activeCollectionStatus">
                 <span class="text-sm font-bold uppercase tracking-wider text-right cursor-pointer" :class="activeCollectionStatus ? 'text-green-600' : 'text-gray-500'">{{ selectedCollection.status }}</span>
                 <UToggle v-model="activeCollectionStatus" color="green" size="md" />
               </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- Left Col: Main Details -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Info Básica -->
                <UCard :ui="{ shadow: 'shadow-sm', rounded: 'rounded-xl', body: { padding: 'p-6' } }">
                  <div class="space-y-5">
                    <UFormGroup label="Título de la Colección">
                      <UInput v-model="selectedCollection.title" size="lg" placeholder="Ej: Ofertas del día" />
                    </UFormGroup>
                    <UFormGroup label="Descripción (Opcional)">
                      <UTextarea v-model="selectedCollection.desc" placeholder="Texto descriptivo para la cabecera de la colección en la web..." :rows="3" />
                    </UFormGroup>
                  </div>
                </UCard>

                <!-- Products Manager -->
                <UCard :ui="{ shadow: 'shadow-sm', rounded: 'rounded-xl', body: { padding: 'p-0 sm:p-0' }, header: { padding: 'p-4 sm:px-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800' } }">
                  <template #header>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-package-search" class="w-5 h-5 text-gray-400" />
                        <h4 class="font-bold text-gray-900 dark:text-white leading-tight">Productos</h4>
                        <UBadge color="gray" variant="soft" size="xs" class="ml-2 rounded-full">{{ selectedCollection.productCount }}</UBadge>
                      </div>
                      <UButton color="black" variant="soft" size="sm" icon="i-lucide-search" @click="openAddProductsModal">Añadir productos</UButton>
                    </div>
                  </template>

                  <!-- List -->
                  <div v-if="collectionProducts.length > 0" class="divide-y divide-gray-100 dark:divide-gray-800">
                     <div v-for="product in collectionProducts" :key="product.id" class="p-4 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                       <div class="flex items-center gap-4">
                         <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                           <img :src="product.image" class="w-full h-full object-cover" />
                         </div>
                         <div>
                           <div class="font-medium text-sm text-gray-900 dark:text-white">{{ product.name }}</div>
                           <div class="text-xs text-gray-500">{{ formatPrice(product.price) }}</div>
                         </div>
                       </div>
                       <UButton color="gray" variant="ghost" icon="i-lucide-x" size="sm" class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" @click="removeProductFromCollection(product.id)" />
                     </div>
                  </div>
                  
                  <div v-else class="p-12 text-center text-gray-500">
                    No hay productos en esta colección. Añade algunos para empezar.
                  </div>
                </UCard>
              </div>

              <!-- Right Col: Config / Image -->
              <div class="space-y-6">
                <!-- Tipo de colección -->
                <UCard :ui="{ shadow: 'shadow-sm', rounded: 'rounded-xl', body: { padding: 'p-5' } }">
                  <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-4">Tipo de Colección</h4>
                  <URadioGroup 
                    v-model="selectedCollection.type"
                    :options="[{ label: 'Manual', value: 'Manual', description: 'Eliges tú los productos uno a uno.' }, { label: 'Automatizada', value: 'Automatizada', description: 'Por reglas de etiquetas o precio. (Próximamente)', disabled: true }]"
                    class="space-y-3"
                  />
                </UCard>

                <!-- Imagen portada -->
                <UCard :ui="{ shadow: 'shadow-sm', rounded: 'rounded-xl', body: { padding: 'p-5' } }">
                  <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-4">Imagen de Portada</h4>
                  <div class="group relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 cursor-pointer">
                    <img :src="selectedCollection.image" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span class="text-white text-sm font-medium flex items-center gap-2">
                        <UIcon name="i-lucide-camera" class="w-5 h-5" />
                        Cambiar foto
                      </span>
                    </div>
                  </div>
                </UCard>

                <div class="pt-4">
                  <UButton color="red" variant="soft" icon="i-lucide-trash-2" block @click="deleteCollection">Eliminar Colección</UButton>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Empty State (No selection) -->
        <div v-else class="flex-1 flex items-center justify-center p-8">
           <div class="text-center max-w-sm">
             <UIcon name="i-lucide-folder-open" class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
             <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Selecciona una colección</h3>
             <p class="text-sm text-gray-500">Haz clic en una colección del panel lateral para editar su contenido y visibilidad, o crea una nueva.</p>
           </div>
        </div>

        <!-- Sticky Footer for Save Action -->
        <div v-if="selectedCollection" class="flex-shrink-0 p-4 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] absolute bottom-0 left-0 right-0">
           <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">Editando colección</span>
           </div>
           <UButton color="black" size="md" icon="i-lucide-save" @click="saveCollection" class="px-6 shadow-sm">
             Guardar cambios
           </UButton>
        </div>

      </div>
    </div>

    <!-- Modals -->

    <!-- Create Modal -->
    <UModal v-model="isCreateModalOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">Nueva Colección</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isCreateModalOpen = false" />
          </div>
        </template>
        
        <form @submit.prevent="createCollection" class="space-y-4">
          <UFormGroup label="Título" required>
            <UInput v-model="newCollectionForm.title" placeholder="Ej: Ofertas de Verano" autofocus />
          </UFormGroup>
          <UFormGroup label="Breve descripción">
            <UTextarea v-model="newCollectionForm.desc" :rows="2" placeholder="Opcional..." />
          </UFormGroup>
          <div class="pt-4 flex justify-end gap-3">
            <UButton color="gray" variant="ghost" @click="isCreateModalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="black" :disabled="!newCollectionForm.title">Crear</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Add Products Selected Panel -->
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
          <UInput v-model="productSearchQuery" icon="i-lucide-search" placeholder="Busca productos por nombre..." size="md" />
        </div>

        <div class="max-h-[400px] overflow-y-auto p-2">
           <div v-if="availableProductsToAdd.length === 0" class="text-center py-8 text-sm text-gray-500">
             No se encontraron productos disponibles.
           </div>
           
           <div v-for="product in availableProductsToAdd" :key="product.id" class="p-2">
             <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer select-none">
               <UCheckbox :model-value="pendingSelectedProducts.includes(product.id)" @update:model-value="i => { if(i) pendingSelectedProducts.push(product.id); else pendingSelectedProducts = pendingSelectedProducts.filter(id => id !== product.id); }" />
               <div class="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 flex-shrink-0 overflow-hidden">
                 <img :src="product.image" class="w-full h-full object-cover">
               </div>
               <div class="flex-1">
                 <div class="font-medium text-sm text-gray-900 dark:text-white">{{ product.name }}</div>
                 <div class="text-xs text-gray-500">{{ formatPrice(product.price) }}</div>
               </div>
               <UBadge :color="product.status === 'Activo' ? 'green' : 'red'" variant="subtle" size="xs">{{ product.status }}</UBadge>
             </label>
           </div>
        </div>

        <div class="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center rounded-b-lg">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ pendingSelectedProducts.length }} seleccionados
          </div>
          <div class="flex gap-3">
            <UButton color="gray" variant="ghost" @click="isAddProductsModalOpen = false">Cancelar</UButton>
            <UButton color="black" @click="confirmAddProducts" :disabled="pendingSelectedProducts.length === 0">Añadir productos</UButton>
          </div>
        </div>
      </UCard>
    </UModal>

  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
