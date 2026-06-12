<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({ layout: 'dashboard' })

const toast = useToast()

interface InventoryItem {
  id: number
  name: string
  category: string
  sku: string
  stockMin: number
  stock: number
  trackStock: boolean
  image: string
}

// Mock Database
const inventory = ref<InventoryItem[]>([
  { id: 201, name: 'Lata Coca-Cola Clásica', category: 'Bebidas', sku: 'BEB-CC-01', stockMin: 24, stock: 120, trackStock: true, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=150&auto=format&fit=crop' },
  { id: 202, name: 'Agua Min. Natural 50Cl', category: 'Bebidas', sku: 'BEB-AG-01', stockMin: 48, stock: 15, trackStock: true, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc81?q=80&w=150&auto=format&fit=crop' },
  { id: 203, name: 'Pan de Hamburguesa Brioche', category: 'Panadería', sku: 'PAN-BR-01', stockMin: 50, stock: 8, trackStock: true, image: 'https://images.unsplash.com/photo-1550508139-8ee3f7e1b5f6?q=80&w=150&auto=format&fit=crop' },
  { id: 204, name: 'Carne Hamburguesa 180gr', category: 'Carnes', sku: 'CAR-180-01', stockMin: 30, stock: 45, trackStock: true, image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=150&auto=format&fit=crop' },
  { id: 205, name: 'Botella Cerveza Mahou', category: 'Bebidas', sku: 'BEB-CER-01', stockMin: 24, stock: 0, trackStock: true, image: 'https://images.unsplash.com/photo-1614316315263-80b15e4fbd65?q=80&w=150&auto=format&fit=crop' },
  { id: 206, name: 'Salsa BBQ Casera (Lotes)', category: 'Salsas', sku: 'SAL-BBQ-01', stockMin: 5, stock: 12, trackStock: true, image: 'https://images.unsplash.com/photo-1472476442507-681615ba1ac9?q=80&w=150&auto=format&fit=crop' },
  { id: 207, name: 'Patatas Fritas Prefritas (Cajas)', category: 'Guarnición', sku: 'PAT-CON-01', stockMin: 10, stock: 3, trackStock: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=150&auto=format&fit=crop' },
])

// --- State ---
const searchQuery = ref('')
const activeFilter = ref<'Todo' | 'Stock bajo' | 'Agotado'>('Todo')
const selectedInventoryItems = ref<InventoryItem[]>([])

const isSaving = ref(false)
const isOutOfStockAlertDismissed = ref(false)
const isLowStockAlertDismissed = ref(false)

const columns = [
  { key: 'name', label: 'Artículo' },
  { key: 'status', label: 'Estado' },
  { key: 'min', label: 'Alerta Mín.' },
  { key: 'action', label: 'Disponible' },
  { key: 'options', label: '' }
]

// Modal State
const isItemModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const currentItemForm = ref<Partial<InventoryItem>>({})

const openAddItemModal = () => {
  modalMode.value = 'add'
  currentItemForm.value = {
    name: '',
    sku: '',
    category: 'General',
    stockMin: 10,
    stock: 0,
    trackStock: true,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc81?q=80&w=150&auto=format&fit=crop'
  }
  isItemModalOpen.value = true
}

const openEditItemModal = (item: InventoryItem) => {
  modalMode.value = 'edit'
  currentItemForm.value = { ...item }
  isItemModalOpen.value = true
}

const submitItemForm = () => {
  if (modalMode.value === 'add') {
    const newItem: InventoryItem = {
      ...(currentItemForm.value as InventoryItem),
      id: Date.now()
    }
    inventory.value.unshift(newItem)
    toast.add({ title: 'Artículo añadido', description: `Se ha guardado ${newItem.name} en el inventario.` })
  } else {
    const idx = inventory.value.findIndex(i => i.id === currentItemForm.value.id)
    if (idx !== -1) {
      inventory.value[idx] = { ...(currentItemForm.value as InventoryItem) }
      toast.add({ title: 'Artículo actualizado', description: `Se han guardado los cambios.` })
    }
  }
  isItemModalOpen.value = false
}

// --- Computed ---
const filteredInventory = computed(() => {
  let result = inventory.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(item => item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q))
  }

  if (activeFilter.value === 'Stock bajo') {
    result = result.filter(item => item.stock > 0 && item.stock <= item.stockMin)
  } else if (activeFilter.value === 'Agotado') {
    result = result.filter(item => item.stock === 0)
  }

  return result
})

const getStatusDef = (stock: number, min: number): { label: string, color: 'red' | 'amber' | 'green' } => {
  if (stock === 0) return { label: 'Agotado', color: 'red' }
  if (stock <= min) return { label: 'Stock Bajo', color: 'amber' }
  return { label: 'En stock', color: 'green' }
}

const lowStockItemsCount = computed(() => {
  return inventory.value.filter(i => i.stock <= i.stockMin && i.stock > 0).length
})

const outOfStockItemsCount = computed(() => {
  return inventory.value.filter(i => i.stock === 0).length
})

// --- Actions ---
const incrementStock = (item: InventoryItem) => { item.stock++ }
const decrementStock = (item: InventoryItem) => { if (item.stock > 0) item.stock-- }

const updateStockAmount = (item: InventoryItem, value: any) => {
  const num = parseInt(value)
  if (!isNaN(num) && num >= 0) {
    item.stock = num
  }
}

const saveInventory = async () => {
  isSaving.value = true
  // Mock API Call delay
  await new Promise(r => setTimeout(r, 600))
  isSaving.value = false
  selectedInventoryItems.value = []
  toast.add({ 
    title: 'Inventario actualizado', 
    description: `Los niveles de existencias se han sincronizado correctamente.`, 
    color: 'green' 
  })
}

const selectRow = (row: InventoryItem) => {
  const index = selectedInventoryItems.value.findIndex((item) => item.id === row.id)
  if (index === -1) {
    selectedInventoryItems.value.push(row)
  } else {
    selectedInventoryItems.value.splice(index, 1)
  }
}

const getRowOptions = (row: InventoryItem) => [
  [
    {
      label: 'Editar artículo',
      icon: 'i-lucide-pencil',
      click: () => openEditItemModal(row)
    }
  ],
  [
    {
      label: 'Eliminar del inventario',
      icon: 'i-lucide-trash-2',
      class: 'text-red-500 dark:text-red-400',
      iconClass: 'text-red-500 dark:text-red-400',
      click: () => {
        inventory.value = inventory.value.filter(i => i.id !== row.id)
        selectedInventoryItems.value = selectedInventoryItems.value.filter(i => i.id !== row.id)
        toast.add({ title: 'Producto eliminado', description: `${row.name} ha sido borrado exitosamente.`, color: 'red' })
      }
    }
  ]
]
</script>

<template>
  <div class="absolute inset-0 flex flex-col bg-gray-50 dark:bg-gray-900 z-10 w-full">
    
    <!-- Top Header Navigation -->
    <div class="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-20">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-boxes" class="text-black dark:text-white" />
          Inventario
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Lleva el recuento de existencias y actualizaciones de cantidad.</p>
      </div>
      <div class="flex gap-3 items-center">
        <UButton color="gray" variant="ghost" icon="i-lucide-download">Exportar</UButton>
        <UButton color="gray" variant="ghost" icon="i-lucide-upload">Importar</UButton>
        <UButton color="black" icon="i-lucide-plus" @click="openAddItemModal">Añadir artículo</UButton>
      </div>
    </div>

    <!-- Core Layout -->
    <div class="flex-1 overflow-y-auto w-full relative">
      <div class="p-6 lg:p-8 mx-auto space-y-6 pb-24">
        
        <!-- Alertas de Stock Inteligentes -->
        <div class="space-y-4">
          <UAlert 
            v-if="outOfStockItemsCount > 0 && !isOutOfStockAlertDismissed"
            icon="i-lucide-alert-octagon"
            color="red"
            variant="subtle"
            :title="`Tienes ${outOfStockItemsCount} ${outOfStockItemsCount === 1 ? 'producto' : 'productos'} sin existencias.`"
            description="Asegúrate alinear tu inventario pronto o marca los productos como ocultos de tus plataformas de venta."
            class="shadow-sm !mb-4 !mt-0"
            :close-button="{}"
            @close="isOutOfStockAlertDismissed = true"
          />

          <UAlert 
            v-if="lowStockItemsCount > 0 && !isLowStockAlertDismissed"
            icon="i-lucide-alert-triangle"
            color="amber"
            variant="subtle"
            :title="`El stock está bajo en ${lowStockItemsCount} productos.`"
            class="shadow-sm ring-1 ring-amber-500/50 dark:ring-amber-400/50 !mb-4 !mt-0"
            :ui="{ ring: 'ring-1 ring-amber-600/50 dark:ring-amber-500/50' }"
            :close-button="{}"
            @close="isLowStockAlertDismissed = true"
          />
        </div>

        <!-- Tabla principal de Interacción -->
        <UCard class="!mt-0" :ui="{ base: 'overflow-hidden', shadow: 'shadow-sm', rounded: 'rounded-xl', body: { padding: 'p-0 sm:p-0' }, header: { padding: 'p-4', base: 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800' } }">
           
           <!-- Filters Toolbar -->
           <template #header>
              <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                 <div class="flex items-center gap-2 flex-wrap">
                    <UButton 
                      size="sm" 
                      :color="activeFilter === 'Todo' ? 'black' : 'gray'" 
                      :variant="activeFilter === 'Todo' ? 'solid' : 'ghost'"
                      @click="activeFilter = 'Todo'"
                      class="rounded-full px-4"
                    >
                      Todos
                    </UButton>
                    <UButton 
                      size="sm" 
                      :color="activeFilter === 'Stock bajo' ? 'amber' : 'gray'" 
                      :variant="activeFilter === 'Stock bajo' ? 'solid' : 'ghost'"
                      @click="activeFilter = 'Stock bajo'"
                      class="rounded-full px-4"
                    >
                      Stock Bajo ({{ lowStockItemsCount }})
                    </UButton>
                     <UButton 
                      size="sm" 
                      :color="activeFilter === 'Agotado' ? 'red' : 'gray'" 
                      :variant="activeFilter === 'Agotado' ? 'solid' : 'ghost'"
                      @click="activeFilter = 'Agotado'"
                      class="rounded-full px-4"
                    >
                      Agotado ({{ outOfStockItemsCount }})
                    </UButton>
                 </div>
                 
                 <div class="w-full sm:w-72">
                   <UInput 
                     v-model="searchQuery" 
                     icon="i-lucide-search" 
                     placeholder="Buscar ingrediente, producto o SKU..." 
                     size="sm"
                   />
                 </div>
              </div>

              <!-- Bulk Actions Barra (solo visible si algo seleccionado) -->
              <div v-if="selectedInventoryItems.length > 0" class="mt-4 p-3 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800 rounded-lg flex items-center justify-between">
                <span class="text-sm font-medium text-primary-700 dark:text-primary-400 flex items-center gap-2">
                  <UIcon name="i-lucide-check-square" class="w-4 h-4" />
                  {{ selectedInventoryItems.length }} seleccionados
                </span>
                <div class="flex gap-2">
                  <UButton size="xs" color="white" icon="i-lucide-pencil">Ajuste masivo</UButton>
                  <UButton size="xs" color="white" icon="i-lucide-tag">Categorizar</UButton>
                </div>
              </div>
           </template>

           <!-- UI Table Native -->
           <UTable 
             v-model="selectedInventoryItems" 
             :rows="filteredInventory" 
             :columns="columns"
             :empty-state="{ icon: 'i-lucide-search-x', label: 'No se encontraron artículos que coincidan con los filtros.' }"
             @select="selectRow"
             class="w-full"
           >
             
             <!-- Article Details -->
             <template #name-data="{ row }">
               <div class="flex items-center gap-3 w-max">
                  <div class="w-10 h-10 rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <img :src="row.image" class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div class="font-medium text-sm text-gray-900 dark:text-white">{{ row.name }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">SKU: <span class="font-mono">{{ row.sku }}</span></div>
                  </div>
               </div>
             </template>

             <!-- Status Badge -->
             <template #status-data="{ row }">
               <UBadge :color="getStatusDef(row.stock, row.stockMin).color" variant="subtle" size="xs">
                 {{ getStatusDef(row.stock, row.stockMin).label }}
               </UBadge>
             </template>

             <!-- Alerta Mínima -->
             <template #min-data="{ row }">
               <div class="flex items-center gap-1.5 text-sm text-gray-500">
                 <UIcon name="i-lucide-bell" class="w-3 h-3" />
                 <span>{{ row.stockMin }} uds</span>
               </div>
             </template>

             <!-- Quick Actions (Stock Modifier) -->
             <template #action-data="{ row }">
                <div class="flex items-center justify-end">
                  <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-shadow">
                    
                    <button @click.stop="decrementStock(row)" class="p-2 w-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" :disabled="row.stock <= 0">
                      <UIcon name="i-lucide-minus" class="w-3.5 h-3.5" />
                    </button>
                    
                    <input 
                      type="number" 
                      :value="row.stock"
                      @click.stop
                      @input="e => updateStockAmount(row, (e.target as HTMLInputElement).value)"
                      class="w-12 text-center text-sm font-bold text-gray-900 dark:text-white bg-transparent outline-none border-x border-gray-200 dark:border-gray-700 p-1.5 hide-arrows" 
                    />
                    
                    <button @click.stop="incrementStock(row)" class="p-2 w-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <UIcon name="i-lucide-plus" class="w-3.5 h-3.5" />
                    </button>
                    
                  </div>
                </div>
             </template>

             <!-- Row Options -->
             <template #options-data="{ row }">
               <div class="flex items-center justify-end" @click.stop>
                 <UDropdown :items="getRowOptions(row)" :popper="{ placement: 'bottom-end' }">
                   <UButton color="gray" variant="ghost" icon="i-lucide-more-horizontal" />
                 </UDropdown>
               </div>
             </template>

           </UTable>
        </UCard>
      </div>

       <!-- Sticky Footer for Save Action -->
       <transition enter-active-class="transform transition ease-out duration-300" enter-from-class="translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transform transition ease-in duration-200" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-full opacity-0">
          <div v-if="filteredInventory.some(i => i.stock !== inventory.find(orig => orig.id === i.id)?.stock)" class="fixed bottom-0 left-0 lg:ml-[256px] right-0 flex-shrink-0 p-4 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center z-50 shadow-[0_-10px_15px_rgba(0,0,0,0.05)]">
             <div class="flex items-center gap-3">
                <div class="bg-primary-100 dark:bg-primary-900/50 w-8 h-8 rounded-full flex items-center justify-center">
                  <UIcon name="i-lucide-save" class="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div class="font-bold text-gray-900 dark:text-white text-sm">Cambios detectados</div>
                  <span class="text-xs text-gray-500">Guarda el inventario para actualizar los niveles permanentemente.</span>
                </div>
             </div>
             <UButton color="black" size="md" :loading="isSaving" @click="saveInventory" class="px-8 shadow-sm">
               Aplicar Cantidades
             </UButton>
          </div>
       </transition>
    </div>

    <!-- Add/Edit Modal -->
    <UModal v-model="isItemModalOpen" :ui="{ width: 'sm:max-w-md' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ modalMode === 'add' ? 'Añadir artículo de inventario' : 'Editar artículo' }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isItemModalOpen = false" />
          </div>
        </template>

        <form @submit.prevent="submitItemForm" class="space-y-4 flex-column">
          <UFormGroup label="Nombre del Artículo" required>
            <UInput v-model="currentItemForm.name" placeholder="Ej: Latas de Ketchup" autofocus />
          </UFormGroup>
          <div class="space-y-4 flex flex-row align-middle space-x-2">
            <UFormGroup label="SKU / Código" required class="w-1/2">
               <UInput v-model="currentItemForm.sku" placeholder="Ej: INGR-001" />
            </UFormGroup>
            <UFormGroup label="Stock Mínimo (Alerta)" required class="!mt-0 w-1/2">
              <UInput v-model.number="currentItemForm.stockMin" type="number" min="0" placeholder="10" />
            </UFormGroup>
          </div>
          <UFormGroup label="URL externa de Imagen">
            <UInput v-model="currentItemForm.image" placeholder="https://..." />
          </UFormGroup>

          <div class="pt-4 flex justify-end gap-3">
            <UButton color="gray" variant="ghost" @click="isItemModalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="black" :disabled="!currentItemForm.name">Guardar</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

  </div>
</template>

<style scoped>
.hide-arrows::-webkit-inner-spin-button, 
.hide-arrows::-webkit-outer-spin-button { 
  -webkit-appearance: none;
  appearance: none;
  margin: 0; 
}
.hide-arrows {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
