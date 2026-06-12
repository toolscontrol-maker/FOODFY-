<script setup lang="ts">
import { ref, computed, watch } from 'vue'

definePageMeta({ layout: 'dashboard' })

const categories = ref(['Hamburguesas', 'Entrantes', 'Bebidas', 'Postres'])
const activeCategory = ref('Hamburguesas')
const searchQuery = ref('')

const products = ref([
  { id: 1, name: 'Hamburguesa Clásica', desc: 'Carne 100% vacuno, lechuga, tomate, cebolla roja y salsa especial.', price: 12.50, status: 'Activo', category: 'Hamburguesas', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop' },
  { id: 2, name: 'Doble Smash Bacon', desc: 'Doble smash patty, cuádruple cheddar, bacon crujiente y salsa BBQ.', price: 15.00, status: 'Activo', category: 'Hamburguesas', image: 'https://i.redd.it/az5zx99z1vhb1.jpg' },
  { id: 3, name: 'Truffle Mushroom', desc: 'Hamburguesa con setas, queso suizo y mahonesa de trufa.', price: 14.00, status: 'Inactivo', category: 'Hamburguesas', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=300&auto=format&fit=crop' },
])

const isAddModalOpen = ref(false)
const newProductForm = ref({
  name: '',
  price: 0,
  category: activeCategory.value,
  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'
})

const isCategoryDrawerOpen = ref(false)
const newCategoryInput = ref('')
const editingCategory = ref<string | null>(null)
const editingCategoryInput = ref('')

const isImportModalOpen = ref(false)
const isExportModalOpen = ref(false)
const exportOption = ref('all')
const selectedProductIds = ref<number[]>([])

watch(isExportModalOpen, (isOpen) => {
  if (isOpen) {
    exportOption.value = selectedProductIds.value.length > 0 ? 'selected' : 'all'
  }
})

const bulkActions = [
  [
    { label: 'Archivar productos', icon: 'i-lucide-archive' },
    { label: 'Ocultar productos', icon: 'i-lucide-eye-off' }
  ],
  [
    { label: 'Incluir en canales de venta', icon: 'i-lucide-check-circle' },
    { label: 'Excluir de canales de venta', icon: 'i-lucide-minus-circle' }
  ],
  [
    { label: 'Agregar etiquetas', icon: 'i-lucide-tag' },
    { label: 'Eliminar etiquetas', icon: 'i-lucide-tags' }
  ],
  [
    { label: 'Agregar a colección/es', icon: 'i-lucide-folder-plus' },
    { label: 'Eliminar de colección/es', icon: 'i-lucide-folder-minus' }
  ],
  [
    { label: 'Apps sinc', icon: 'i-lucide-puzzle' }
  ]
]

const toggleSelectAll = () => {
  if (selectedProductIds.value.length === filteredProducts.value.length) {
    selectedProductIds.value = []
  } else {
    selectedProductIds.value = filteredProducts.value.map(p => p.id)
  }
}


const filteredProducts = computed(() => {
  return products.value.filter(p => 
    p.category === activeCategory.value && 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectedProduct = ref(JSON.parse(JSON.stringify(products.value[0])))

// Modifiers State
const modifiers = ref([
  {
    id: 1,
    name: 'Punto de la carne',
    required: true,
    maxSelect: 1,
    options: [
      { name: 'Poco hecha (Sangrante)', price: 0 },
      { name: 'Al punto (Recomendado)', price: 0 },
      { name: 'Muy hecha', price: 0 },
    ]
  },
  {
    id: 2,
    name: 'Ingredientes a retirar',
    required: false,
    maxSelect: 4,
    options: [
      { name: 'Sin cebolla', price: 0 },
      { name: 'Sin tomate', price: 0 },
      { name: 'Sin lechuga', price: 0 },
      { name: 'Sin salsa', price: 0 },
    ]
  },
  {
    id: 3,
    name: 'Extras y Añadidos (Up-selling)',
    required: false,
    maxSelect: 3,
    options: [
      { name: 'Extra de Queso Cheddar', price: 1.50 },
      { name: 'Añadir Bacon ahumado', price: 2.00 },
      { name: 'Patty de carne extra', price: 3.50 },
      { name: 'Huevo frito', price: 1.20 },
    ]
  }
])

const isSaving = ref(false)
const toast = useToast()

const saveMenu = async () => {
  isSaving.value = true
  await new Promise(r => setTimeout(r, 600))
  // Save logic mock updating the local products list
  const index = products.value.findIndex(p => p.id === selectedProduct.value.id)
  if(index !== -1) {
    products.value[index] = { ...selectedProduct.value }
  }
  isSaving.value = false
  toast.add({ 
    title: 'Producto guardado', 
    description: `Cambios aplicados correctamente a "${selectedProduct.value.name}".`, 
    color: 'green' 
  })
}

const formatPrice = (p: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(p)

const selectProduct = (p: any) => {
  selectedProduct.value = JSON.parse(JSON.stringify(p))
}

const addModifierGroup = () => {
  modifiers.value.push({
    id: Date.now(),
    name: 'Nuevo Grupo',
    required: false,
    maxSelect: 1,
    options: [{ name: '', price: 0 }]
  })
}

const deleteModifierGroup = (index: number) => {
  modifiers.value.splice(index, 1)
}

const addOption = (groupIndex: number) => {
  modifiers.value[groupIndex].options.push({ name: '', price: 0 })
}

const deleteOption = (groupIndex: number, optionIndex: number) => {
  modifiers.value[groupIndex].options.splice(optionIndex, 1)
}

const submitCategory = () => {
  if (newCategoryInput.value && !categories.value.includes(newCategoryInput.value)) {
    categories.value.push(newCategoryInput.value)
    if (categories.value.length === 1) {
      changeCategory(newCategoryInput.value)
    }
    newCategoryInput.value = ''
  }
}

const deleteCategory = (cat: string) => {
  const idx = categories.value.indexOf(cat)
  if (idx !== -1) {
    categories.value.splice(idx, 1)
    if (activeCategory.value === cat) {
      const nextCategory = categories.value[0] || ''
      changeCategory(nextCategory)
    }
  }
}

const addProduct = () => {
  newProductForm.value = {
    name: '',
    price: 0,
    category: activeCategory.value,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'
  }
  isAddModalOpen.value = true
}

const submitNewProduct = () => {
  if (!newProductForm.value.name) return
  
  const newProduct = {
    id: Date.now(),
    name: newProductForm.value.name,
    desc: 'Nueva descripción del producto...',
    price: newProductForm.value.price,
    status: 'Activo',
    category: newProductForm.value.category,
    image: newProductForm.value.image
  }
  
  products.value.unshift(newProduct)
  searchQuery.value = ''
  activeCategory.value = newProduct.category
  isAddModalOpen.value = false
  selectProduct(products.value[0])
  
  toast.add({ 
    title: 'Producto creado', 
    description: `El producto "${newProduct.name}" ha sido creado.`, 
    color: 'green' 
  })
}

const changeCategory = (cat: string) => {
  activeCategory.value = cat
  const firstInCat = products.value.find(p => p.category === cat)
  if (firstInCat) {
    selectProduct(firstInCat)
  } else {
    selectedProduct.value = null
  }
}

const startEditCategory = (cat: string) => {
  editingCategory.value = cat
  editingCategoryInput.value = cat
}

const saveEditCategory = () => {
  if (!editingCategory.value || !editingCategoryInput.value) return
  if (editingCategory.value === editingCategoryInput.value) {
    editingCategory.value = null
    return
  }
  if (categories.value.includes(editingCategoryInput.value)) {
    toast.add({ title: 'Error', description: 'Esa categoría ya existe.', color: 'red' })
    return
  }

  const oldName = editingCategory.value
  const newName = editingCategoryInput.value

  const idx = categories.value.indexOf(oldName)
  if (idx !== -1) {
    categories.value[idx] = newName
    
    if (activeCategory.value === oldName) activeCategory.value = newName
    if (newProductForm.value.category === oldName) newProductForm.value.category = newName
    
    products.value.forEach(p => {
      if (p.category === oldName) p.category = newName
    })
  }
  editingCategory.value = null
}

const isActiveStatus = computed({
  get: () => selectedProduct.value?.status === 'Activo' || selectedProduct.value?.status === true,
  set: (val) => {
    if (selectedProduct.value) {
      selectedProduct.value.status = val ? 'Activo' : 'Inactivo'
    }
  }
})
</script>

<template>
  <div class="absolute inset-0 flex flex-col bg-white dark:bg-gray-900 z-10">
    
    <!-- Top Header Navigation -->
    <div class="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-20">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-box" class="text-black dark:text-white" />
          Catálogo
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Controla tu inventario, precios y variaciones.</p>
      </div>
      <div class="flex gap-3">
        <UDropdown :items="[[{ label: 'Gestionar categorías', icon: 'i-lucide-layers', click: () => { isCategoryDrawerOpen = true; } }]]">
          <UButton color="gray" variant="ghost" icon="i-lucide-more-horizontal" />
        </UDropdown>
        <UButton color="gray" variant="ghost" icon="i-lucide-download" @click="isExportModalOpen = true">Exportar</UButton>
        <UButton color="gray" variant="ghost" icon="i-lucide-upload" @click="isImportModalOpen = true">Importar</UButton>
        <UButton color="black" icon="i-lucide-plus" @click="addProduct">Agregar producto</UButton>
      </div>
    </div>

    <!-- Core Layout with Columns -->
    <div class="flex-1 flex overflow-hidden">
      
      <!-- Left Panel: Products Sidebar (Scrollable internally) -->
      <div class="w-80 lg:w-[400px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col">
        
        <!-- Search & Categories -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
          <div class="flex items-center gap-2">
            <UInput 
              v-model="searchQuery" 
              icon="i-lucide-search" 
              placeholder="Buscar producto..." 
              class="flex-1"
            />
          </div>
          
          <div class="flex gap-2 overflow-x-auto hide-scrollbar">
            <UButton 
              v-for="cat in categories" 
              :key="cat"
              @click="changeCategory(cat)"
              size="sm"
              :color="activeCategory === cat ? 'black' : 'gray'"
              :variant="activeCategory === cat ? 'solid' : 'ghost'"
              class="rounded-full flex-shrink-0"
            >
              {{ cat }}
            </UButton>
          </div>
        </div>

        <!-- Bulk Actions Bar (Sticky above list when items selected) -->
        <div v-if="selectedProductIds.length > 0" class="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800 text-sm">
          <span class="font-medium text-primary-700 dark:text-primary-400">{{ selectedProductIds.length }} seleccionados</span>
          <div class="flex items-center gap-2">
            <UButton size="xs" color="white" variant="solid" icon="i-lucide-edit-3">Edición masiva</UButton>
            <UButton size="xs" color="white" variant="solid" icon="i-lucide-file-text">Borrador</UButton>
            <UDropdown :items="bulkActions" :popper="{ placement: 'bottom-end' }">
              <UButton color="white" variant="solid" icon="i-lucide-more-horizontal" size="xs" />
            </UDropdown>
          </div>
        </div>

        <div class="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500">
          <UCheckbox :model-value="selectedProductIds.length > 0 && selectedProductIds.length === filteredProducts.length" :indeterminate="selectedProductIds.length > 0 && selectedProductIds.length < filteredProducts.length" @change="toggleSelectAll" class="mr-4" />
          <span>{{ filteredProducts.length }} productos en esta vista</span>
        </div>

        <!-- Scrollable Product List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="filteredProducts.length === 0" class="text-center py-10 text-gray-500">
            <UIcon name="i-lucide-search-x" class="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p class="text-sm font-medium">No se encontraron productos</p>
          </div>
          
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="w-full text-left flex gap-3 p-3 rounded-xl transition-colors border group relative cursor-pointer"
            :class="selectedProduct.id === product.id 
              ? 'bg-primary-50/50 dark:bg-primary-900/5 border-primary-500 ring-1 ring-primary-500' 
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
          >
            <div class="pt-1 select-none flex-shrink-0" @click.stop>
              <UCheckbox :model-value="selectedProductIds.includes(product.id)" @update:model-value="i => { if(i) selectedProductIds.push(product.id); else selectedProductIds = selectedProductIds.filter(id => id !== product.id); }" />
            </div>
            
            <div class="flex-1 flex gap-3 min-w-0" @click="selectProduct(product)">
              <div class="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
                <img :src="product.image" class="w-full h-full object-cover" :alt="product.name" />
              </div>
            <div class="flex-1 min-w-0 flex flex-col justify-center">
              <div class="flex justify-between items-start mb-1">
                <h4 class="font-semibold text-gray-900 dark:text-white truncate pr-2 text-sm" :class="selectedProduct.id === product.id ? 'text-primary-700 dark:text-primary-400' : ''">{{ product.name }}</h4>
                <div class="font-bold text-gray-900 dark:text-white text-sm">{{ formatPrice(product.price) }}</div>
              </div>
              <div class="flex justify-between items-center mt-1">
                 <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 flex-1 pr-4">{{ product.desc }}</p>
                 <UBadge :color="product.status === 'Activo' ? 'green' : 'red'" variant="subtle" size="xs">
                   {{ product.status }}
                 </UBadge>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Advanced Product Editor (Scrollable internally) -->
      <div v-if="selectedProduct" class="flex-1 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
        
        <div class="flex-1 overflow-y-auto p-8 lg:px-12 bg-gray-50 dark:bg-gray-900">
          <div class="mx-auto space-y-8 pb-12">
            
            <!-- Bloque 1: Producto -->
            <UCard :ui="{ shadow: 'shadow-sm', rounded: 'rounded-xl' }" class="relative">
               
               <!-- Disponibilidad Float Widget -->
               <div class="absolute top-5 right-6 flex items-center gap-2 z-10">
                 <span class="text-xs font-bold uppercase tracking-wider text-right" :class="(selectedProduct.status === 'Activo' || selectedProduct.status === true) ? 'text-green-600' : 'text-red-500'">{{ (selectedProduct.status === 'Activo' || selectedProduct.status === true) ? 'Activo' : 'Inactivo' }}</span>
                 <UToggle v-model="isActiveStatus" color="green" size="md" />
               </div>

               <div class="flex flex-col sm:flex-row gap-8 items-start mt-8 sm:mt-6">
                  <div class="w-40 h-40 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gray-100">
                    <img :src="selectedProduct.image" class="w-full h-full object-cover" />
                  </div>
                  
                  <div class="flex-1 w-full space-y-5">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <UFormGroup label="Nombre del producto" class="sm:col-span-2">
                        <UInput v-model="selectedProduct.name" size="lg" color="gray" />
                      </UFormGroup>
                      <UFormGroup label="Precio (€)">
                        <UInput v-model.number="selectedProduct.price" type="number" step="0.10" size="lg" color="gray" />
                      </UFormGroup>
                    </div>
                    
                    <UFormGroup label="Descripción">
                      <UTextarea v-model="selectedProduct.desc" autoresize :rows="2" color="gray" />
                    </UFormGroup>
                  </div>
               </div>
            </UCard>

            <UDivider class="border-gray-200 dark:border-gray-800" />

            <!-- Bloque 2: Modificadores -->
            <div>
              <div class="flex items-center justify-between mb-6">
                  <div>
                    <h3 class="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                      <UIcon name="i-lucide-list-plus" class="text-gray-500" />
                      Atributos y Modificadores
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Opciones extra de personalización del producto.</p>
                 </div>
                 <UButton color="black" icon="i-lucide-plus" @click="addModifierGroup">Nuevo Grupo</UButton>
              </div>

              <!-- Lista real de modifiers -->
              <div class="space-y-6">
                 <UCard v-for="(group, gIdx) in modifiers" :key="group.id" :ui="{ shadow: 'shadow-sm border border-gray-200 dark:border-gray-700', rounded: 'rounded-xl', body: { padding: 'p-0 sm:p-0' }, header: { padding: 'p-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700' } }">
                     <template #header>
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div class="flex items-center gap-3 flex-1">
                           <UIcon name="i-lucide-grip-vertical" class="text-gray-400 cursor-move hidden sm:block" />
                           <UInput v-model="group.name" variant="none" class="font-bold text-lg p-0 text-gray-900 dark:text-white" placeholder="Introduce el título (ej. Eligir Salsa)" />
                        </div>
                        <div class="flex items-center gap-4">
                           <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                             <UToggle v-model="group.required" size="sm" color="primary" />
                             Obligatorio
                           </label>
                           <div class="flex items-center gap-2 text-sm">
                             <span class="text-gray-500 font-medium">Máx:</span>
                             <UInput v-model.number="group.maxSelect" type="number" color="gray" class="w-16" size="sm" :min="1" />
                           </div>
                           <UButton color="gray" variant="ghost" icon="i-lucide-trash-2" size="sm" class="text-gray-400 hover:text-red-500" @click="deleteModifierGroup(gIdx)" />
                        </div>
                      </div>
                    </template>
                    
                    <!-- Options table -->
                    <div class="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                      <div class="flex items-center text-xs font-bold text-gray-500 uppercase px-4 py-2 bg-gray-50 dark:bg-gray-800/10">
                         <div class="w-8 hidden sm:block"></div>
                         <div class="flex-1">Nombre Opción</div>
                         <div class="w-32">Precio extra (€)</div>
                         <div class="w-8"></div>
                      </div>
                      
                      <div v-for="(opt, oIdx) in group.options" :key="oIdx" class="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/row">
                        <UIcon name="i-lucide-grip-vertical" class="text-gray-300 w-8 hidden sm:block cursor-move text-center" />
                        
                        <div class="flex-1">
                           <UInput v-model="opt.name" color="gray" size="sm" placeholder="Añade un ingrediente o variación..." />
                        </div>
                        
                        <div class="w-32 relative">
                           <UInput v-model.number="opt.price" type="number" step="0.5" color="gray" size="sm" placeholder="0">
                             <template #leading><span class="text-gray-400 font-bold">+</span></template>
                           </UInput>
                        </div>

                        <div class="w-8 flex justify-end">
                           <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="deleteOption(gIdx, oIdx)" class="text-gray-400 hover:text-red-500 sm:opacity-0 sm:group-hover/row:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      
                      <!-- Añadir Nueva Opción -->
                      <div class="p-3">
                         <UButton color="gray" variant="soft" icon="i-lucide-plus" size="sm" @click="addOption(gIdx)" class="w-full justify-center text-gray-500 dark:text-gray-400 font-medium border border-dashed border-gray-300 dark:border-gray-700 hover:border-black hover:text-black dark:hover:border-gray-500 dark:hover:text-gray-300 transition-colors">
                           Añadir nueva opción
                         </UButton>
                      </div>
                    </div>
                 </UCard>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Footer for Save Action -->
        <div class="flex-shrink-0 p-4 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
           <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">Editando un producto <span class="font-bold text-gray-900 dark:text-white capitalize">{{ selectedProduct.status }}</span></span>
           </div>
           <UButton color="black" size="md" icon="i-lucide-save" :loading="isSaving" @click="saveMenu" class="px-6 shadow-sm">
             Guardar y Publicar
           </UButton>
        </div>

      </div>
    </div>

    <!-- Nuevo Plato Modal -->
    <UModal v-model="isAddModalOpen" :ui="{ width: 'sm:max-w-md' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Agregar producto
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isAddModalOpen = false" />
          </div>
        </template>

        <form @submit.prevent="submitNewProduct" class="space-y-4 flex-column">
          <UFormGroup label="Nombre del Producto" required>
            <UInput v-model="newProductForm.name" placeholder="Ej: Buey Suprema" autofocus />
          </UFormGroup>
          <div class="space-y-4 flex flex-row align-middle space-x-2">
            <UFormGroup label="Categoría" required class="w-3/5">
              <USelectMenu v-model="newProductForm.category" :options="categories" />
            </UFormGroup>
            <UFormGroup label="Precio Base (€)" required class="!mt-0 w-2/5">
              <UInput v-model.number="newProductForm.price" type="number" step="0.10" min="0" placeholder="0.00" />
            </UFormGroup>
          </div>
          <UFormGroup label="URL de Imagen">
            <UInput v-model="newProductForm.image" placeholder="https://..." />
          </UFormGroup>

          <div class="pt-4 flex justify-end gap-3">
            <UButton color="gray" variant="ghost" @click="isAddModalOpen = false">Cancelar</UButton>
            <UButton type="submit" color="black" :disabled="!newProductForm.name">Guardar producto</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Import Modal (Mock) -->
    <UModal v-model="isImportModalOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold leading-6">Importar productos</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isImportModalOpen = false" />
          </div>
        </template>
        <div class="space-y-4 pt-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Descarga la plantilla CSV y súbela con los nuevos productos o variaciones de inventario.</p>
          <UButton color="gray" variant="soft" icon="i-lucide-download">Descargar plantilla CSV</UButton>
          <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center mt-4 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <UIcon name="i-lucide-upload-cloud" class="w-8 h-8 text-gray-400" />
            <span class="text-sm font-semibold">Arrastra tu archivo CSV aquí</span>
            <span class="text-xs text-gray-500">o haz clic para seleccionar archivo</span>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Export Modal (Mock) -->
    <UModal v-model="isExportModalOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold leading-6">Exportar productos</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isExportModalOpen = false" />
          </div>
        </template>
        <div class="space-y-4 pt-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">¿Qué te gustaría exportar a CSV?</p>
          <URadioGroup 
            v-model="exportOption"
            :options="[{ label: 'Página actual', value: 'page' }, { label: 'Todos los productos', value: 'all' }, { label: 'Productos seleccionados', value: 'selected', disabled: selectedProductIds.length === 0 }]"
          />
          <div class="flex justify-end gap-3 mt-6">
            <UButton color="gray" variant="ghost" @click="isExportModalOpen = false">Cancelar</UButton>
            <UButton color="black" icon="i-lucide-download" @click="isExportModalOpen = false">Exportar CSV</UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Category Manager Slideover -->
    <USlideover v-model="isCategoryDrawerOpen">
      <div class="p-6 flex flex-col h-full bg-white dark:bg-gray-900">
        <div class="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-lucide-layers" class="w-5 h-5" />
            Gestionar Categorías
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isCategoryDrawerOpen = false" />
        </div>

        <div class="flex-1 overflow-y-auto space-y-6 hide-scrollbar pl-1">
          <!-- Create Category -->
          <form @submit.prevent="submitCategory" class="space-y-3">
            <UFormGroup label="Añadir nueva categoría">
              <div class="flex gap-2">
                <UInput v-model="newCategoryInput" placeholder="Ej: Entrantes, Postres..." class="flex-1" />
                <UButton type="submit" color="black" icon="i-lucide-plus" :disabled="!newCategoryInput" />
              </div>
            </UFormGroup>
          </form>

          <!-- List Categories -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Categorías Existentes</h4>
            <div class="space-y-2">
              <div v-for="cat in categories" :key="cat" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 group transition-all">
                
                <!-- View Mode -->
                <template v-if="editingCategory !== cat">
                  <span class="font-medium text-sm text-gray-700 dark:text-gray-300">{{ cat }}</span>
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <UButton color="gray" variant="ghost" icon="i-lucide-pencil" size="xs" class="text-gray-400 hover:text-primary-500" @click="startEditCategory(cat)" />
                    <UButton color="gray" variant="ghost" icon="i-lucide-trash-2" size="xs" class="text-gray-400 hover:text-red-500" @click="deleteCategory(cat)" />
                  </div>
                </template>
                
                <!-- Edit Mode -->
                <template v-else>
                  <UInput v-model="editingCategoryInput" size="sm" class="flex-1 mr-3" autofocus @keyup.enter="saveEditCategory" @keyup.esc="editingCategory = null" />
                  <div class="flex items-center gap-1">
                    <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="editingCategory = null" />
                    <UButton color="black" variant="solid" icon="i-lucide-check" size="xs" @click="saveEditCategory" />
                  </div>
                </template>

              </div>
              
              <div v-if="categories.length === 0" class="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                No tienes categorías. Crea una arriba.
              </div>
            </div>
          </div>
        </div>
      </div>
    </USlideover>
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
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
</style>
