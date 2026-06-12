<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '~/stores/useProductsStore'

definePageMeta({ layout: 'dashboard' })

const store = useProductsStore()
const { products, categories } = storeToRefs(store)
const router = useRouter()

const activeTab = ref(0)
const searchQuery = ref('')
const searchInputOpen = ref(false)

const filters = ref({
  status: [] as string[],
  category: [] as string[]
})

const activeFiltersCount = computed(() => {
  return filters.value.status.length + filters.value.category.length
})

function clearFilters() {
  filters.value = {
    status: [],
    category: []
  }
}

const statusOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Borrador', value: 'Borrador' },
  { label: 'Archivado', value: 'Archivado' }
]

const categoryOptions = computed(() => {
  return categories.value.map(c => ({ label: c, value: c }))
})

const tabs = computed(() => {
  const all = products.value || []
  return [
    { label: 'Todos', badge: all.length },
    { label: 'Activos', badge: all.filter((p: any) => p.status === 'Activo').length },
    { label: 'Borradores', badge: all.filter((p: any) => p.status === 'Borrador').length },
    { label: 'Archivados', badge: all.filter((p: any) => p.status === 'Archivado').length }
  ]
})

const filteredTableProducts = computed(() => {
  let list = [...products.value]
  
  if (activeTab.value === 1) {
    list = list.filter(p => p.status === 'Activo')
  } else if (activeTab.value === 2) {
    list = list.filter(p => p.status === 'Borrador')
  } else if (activeTab.value === 3) {
    list = list.filter(p => p.status === 'Archivado')
  }

  if (filters.value.status.length > 0) {
    list = list.filter(p => filters.value.status.includes(p.status as never))
  }
  if (filters.value.category.length > 0) {
    list = list.filter(p => filters.value.category.includes(p.category as never))
  }

  if (!searchQuery.value) return list
  return list.filter((row: any) => {
    return Object.values(row).some((value) => {
      return String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    })
  })
})

const selectedProducts = ref<any[]>([])
const tableColumns = ref([
  { key: 'name', label: 'Producto', sortable: true },
  { key: 'status', label: 'Estado', sortable: true },
  { key: 'inventory', label: 'Inventario', sortable: true },
  { key: 'category', label: 'Categoría', sortable: true },
])

const toast = useToast()

const isAddModalOpen = ref(false)
const newProductForm = ref({
  name: '',
  price: 0,
  category: categories.value[0],
  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'
})

const isCategoryDrawerOpen = ref(false)
const newCategoryInput = ref('')
const editingCategory = ref<string | null>(null)
const editingCategoryInput = ref('')

const isImportModalOpen = ref(false)
const isDraggingGlobal = ref(false)
const selectedImportFile = ref<File | null>(null)
const importFileInput = ref<HTMLInputElement | null>(null)
const overwriteProducts = ref(false)
const publishProducts = ref(true)

let dragCounter = 0

const onGlobalDragEnter = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer?.types.includes('Files')) {
    dragCounter++
    isDraggingGlobal.value = true
    isImportModalOpen.value = true
  }
}

const onGlobalDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const onGlobalDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    isDraggingGlobal.value = false
  }
}

const onGlobalDrop = (e: DragEvent) => {
  e.preventDefault()
  dragCounter = 0
  isDraggingGlobal.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      selectedImportFile.value = file
    } else {
      toast.add({ title: 'Error', description: 'Por favor, sube un archivo CSV válido (.csv)', color: 'red' })
    }
  }
}

onMounted(() => {
  window.addEventListener('dragenter', onGlobalDragEnter)
  window.addEventListener('dragover', onGlobalDragOver)
  window.addEventListener('dragleave', onGlobalDragLeave)
  window.addEventListener('drop', onGlobalDrop)
})

onUnmounted(() => {
  window.removeEventListener('dragenter', onGlobalDragEnter)
  window.removeEventListener('dragover', onGlobalDragOver)
  window.removeEventListener('dragleave', onGlobalDragLeave)
  window.removeEventListener('drop', onGlobalDrop)
})

const triggerFileInput = () => importFileInput.value?.click()

const onFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedImportFile.value = target.files[0]
  }
}

watch(isImportModalOpen, (val) => {
  if (!val) {
    selectedImportFile.value = null
    if (importFileInput.value) importFileInput.value.value = ''
  }
})

const isPreviewModalOpen = ref(false)
const importPreviewData = ref({
  totalCount: 0,
  skuCount: 0,
  imageCount: 0,
  hasInvalidCategories: false,
  productsToUpdate: [] as any[],
  productsToAdd: [] as any[],
  firstProduct: null as any
})

const handleImportPreview = () => {
  if (!selectedImportFile.value) return

  const fileReader = new FileReader()

  fileReader.onload = (e) => {
    const text = e.target?.result as string
    if (!text) return

    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '')
    if (lines.length < 2) {
      toast.add({ title: 'Error', description: 'El archivo CSV está vacío o no tiene el formato correcto.', color: 'red' })
      return
    }

    const firstLine = lines[0]
    const separator = firstLine.includes(';') ? ';' : ','
    const headers = firstLine.split(separator).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())

    const productsToAdd: any[] = []
    const productsToUpdate: any[] = []
    let hasInvalidCategories = false
    let imageCount = 0

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`))
      const values = parts.map(p => p.trim().replace(/^"|"$/g, ''))

      const newProduct: any = {}

      headers.forEach((header, index) => {
        let val: any = values[index]
        if (header === 'id' || header === 'precio' || header === 'inventario' || header === 'canales') { val = Number(val) }
        
        if (header === 'id') newProduct.id = val
        if (header === 'nombre') newProduct.name = val
        if (header === 'descripción' || header === 'descripcion') newProduct.desc = val
        if (header === 'precio') newProduct.price = val
        if (header === 'estado') newProduct.status = val || 'Activo'
        if (header === 'categoría' || header === 'categoria') newProduct.category = val || 'Sin categoría'
        if (header === 'inventario') newProduct.inventory = val || 0
        if (header === 'canales') newProduct.channels = val || 0
        if (header === 'imagen' || header === 'url de imagen') newProduct.image = val
      })

      if (!newProduct.name) continue

      if (newProduct.image) imageCount++
      if (newProduct.category && !categories.value.includes(newProduct.category) && newProduct.category !== 'Sin categoría' && newProduct.category !== 'Todas') {
        hasInvalidCategories = true
      }

      const existingIndex = products.value.findIndex(p => p.id === newProduct.id)
      if (existingIndex !== -1 && overwriteProducts.value) {
        productsToUpdate.push(newProduct)
      } else if (existingIndex === -1 && publishProducts.value) {
        if (!newProduct.id || Number.isNaN(newProduct.id)) {
          newProduct.id = Date.now() + Math.floor(Math.random() * 1000) + i
        }
        if (!newProduct.image) newProduct.image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'
        
        productsToAdd.push(newProduct)
      }
    }

    if (productsToAdd.length === 0 && productsToUpdate.length === 0) {
      toast.add({ title: 'Aviso', description: 'No se encontraron productos válidos o todos fueron omitidos por la configuración.', color: 'amber' })
      return
    }

    importPreviewData.value = {
      totalCount: productsToAdd.length + productsToUpdate.length,
      skuCount: productsToAdd.length + productsToUpdate.length,
      imageCount,
      hasInvalidCategories,
      productsToAdd,
      productsToUpdate,
      firstProduct: productsToAdd.length > 0 ? productsToAdd[0] : productsToUpdate[0]
    }

    isPreviewModalOpen.value = true
    setTimeout(() => {
      isImportModalOpen.value = false
    }, 50)
  }

  fileReader.onerror = () => {
    toast.add({ title: 'Error', description: 'Hubo un error al leer el archivo.', color: 'red' })
  }

  fileReader.readAsText(selectedImportFile.value)
}

const confirmImport = () => {
  let importedCount = 0
  let updatedCount = 0

  importPreviewData.value.productsToUpdate.forEach(newProduct => {
    store.updateProduct(newProduct)
    updatedCount++
  })

  importPreviewData.value.productsToAdd.forEach(newProduct => {
    store.addProduct(newProduct)
    if (newProduct.category && !categories.value.includes(newProduct.category) && newProduct.category !== 'Sin categoría' && newProduct.category !== 'Todas') {
      store.addCategory(newProduct.category)
    }
    importedCount++
  })

  toast.add({ 
    title: 'Importación completada', 
    description: `Se han importado ${importedCount} y actualizado ${updatedCount} productos correctamente.`, 
    color: 'green' 
  })
  
  isPreviewModalOpen.value = false
  selectedImportFile.value = null
  if (importFileInput.value) importFileInput.value.value = ''
}

const downloadSampleCSV = () => {
  const headers = ['ID', 'Nombre', 'Descripción', 'Precio', 'Estado', 'Categoría', 'Inventario', 'Canales']
  const sampleData = [
    [1001, '"Ejemplo Producto A"', '"Descripción del producto de ejemplo"', 15.50, 'Activo', '"Categoría de prueba"', 50, 2],
    [1002, '"Ejemplo Producto B"', '"Otra descripción"', 9.99, 'Borrador', '"Otra categoría"', 10, 1]
  ]
  const csvContent = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'producto_ejemplo.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const isExportModalOpen = ref(false)
const exportOption = ref('all')
const exportTypeOption = ref('excel')
const exportTypeOptions = [
  { label: 'CSV para Excel, Numbers u otros programas de hojas de cálculo', value: 'excel' },
  { label: 'Archivo CSV sin formato', value: 'raw' }
]

const computedExportOptions = computed(() => {
  const hasSelected = selectedProducts.value.length > 0;
  const isFiltered = activeTab.value !== 0 || searchQuery.value !== '' || activeFiltersCount.value > 0;
  
  return [
    { label: 'Página actual', value: 'page' },
    { label: 'Todos los productos', value: 'all' },
    { label: `Seleccionados: ${selectedProducts.value.length} productos`, value: 'selected', disabled: !hasSelected },
    { label: `${filteredTableProducts.value.length} producto${filteredTableProducts.value.length === 1 ? '' : 's'} coincide${filteredTableProducts.value.length === 1 ? '' : 'n'} con tu búsqueda`, value: 'filtered', disabled: !isFiltered }
  ]
})

watch(isExportModalOpen, (isOpen) => {
  if (isOpen) {
    exportOption.value = selectedProducts.value.length > 0 ? 'selected' : 'all'
  }
})

const handleExport = () => {
  let productsToExport: any[] = []
  
  if (exportOption.value === 'selected') {
    productsToExport = selectedProducts.value
  } else if (exportOption.value === 'all') {
    productsToExport = products.value
  } else if (exportOption.value === 'filtered' || exportOption.value === 'page') {
    productsToExport = filteredTableProducts.value
  }

  const headers = ['ID', 'Nombre', 'Descripción', 'Precio', 'Estado', 'Categoría', 'Inventario', 'Canales']
  const separator = exportTypeOption.value === 'excel' ? ';' : ','

  const csvContent = [
    headers.join(separator),
    ...productsToExport.map(p => 
      [p.id, `"${p.name}"`, `"${p.desc}"`, p.price, p.status, `"${p.category}"`, p.inventory, p.channels].join(separator)
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'products_export.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.add({ title: 'Exportación completada', description: `Se han exportado ${productsToExport.length} productos correctamente.`, color: 'green' })
  isExportModalOpen.value = false
}

const isStatsBarVisible = ref(false)

const statsDateRange = ref('30days')
const statsDateOptions = [
  { value: 'today', label: 'Hoy', description: 'En comparación con ayer hasta la hora actual' },
  { value: '7days', label: 'Últimos siete días', description: 'En comparación con los 7 días anteriores' },
  { value: '30days', label: 'Últimos 30 días', description: 'En comparación con los 30 días anteriores' }
]

const currentStatsDateLabel = computed(() => {
  if (statsDateRange.value === 'today') return 'Hoy'
  if (statsDateRange.value === '7days') return '7 días'
  return '30 días'
})

const bulkActions = computed(() => [
  [
    { 
      label: isStatsBarVisible.value ? 'Ocultar barra de informes y estadísticas' : 'Mostrar barra de informes y estadísticas', 
      icon: isStatsBarVisible.value ? 'i-lucide-eye-off' : 'i-lucide-bar-chart-2', 
      click: () => { isStatsBarVisible.value = !isStatsBarVisible.value } 
    }
  ],
  [
    { label: 'Archivar productos', icon: 'i-lucide-archive' },
    { label: 'Ocultar productos', icon: 'i-lucide-eye-off' }
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
])

const toggleSelectAll = () => {
  if (selectedProducts.value.length === filteredTableProducts.value.length) {
    selectedProducts.value = []
  } else {
    selectedProducts.value = [...filteredTableProducts.value]
  }
}


// activeCategory has been replaced with activeTab for filtering

// Component now redirects to individual product pages [id].vue 
const formatPrice = (p: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(p)

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
  }
}

const addProduct = () => {
  router.push('/producto/new')
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
    image: newProductForm.value.image,
    inventory: 0,
    channels: 0
  }
  
  store.addProduct(newProduct)
  searchQuery.value = ''
  isAddModalOpen.value = false
  
  toast.add({ 
    title: 'Producto creado', 
    description: `El producto "${newProduct.name}" ha sido creado.`, 
    color: 'green' 
  })
}

const changeCategory = (cat: string) => {
  // Not used in standard view anymore 
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

  store.updateCategory(oldName, newName)
  
  if (newProductForm.value.category === oldName) newProductForm.value.category = newName
    
  editingCategory.value = null
}
</script>

<template>
  <div class="space-y-4">
    
    <!-- Top Header Navigation -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-box" class="text-gray-900 dark:text-white w-5 h-5" />
          Catálogo
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <UButton color="gray" variant="soft" icon="i-lucide-upload" class="bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-semibold rounded-md" size="sm" @click="isExportModalOpen = true">Exportar</UButton>
        <UButton color="gray" variant="soft"icon="i-lucide-download" class="bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-semibold rounded-md" size="sm" @click="isImportModalOpen = true">Importar</UButton>
        <UDropdown :items="bulkActions">
          <UButton color="gray" variant="soft" trailing-icon="i-lucide-chevron-down" class="bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-semibold rounded-md" size="sm">Más acciones</UButton>
        </UDropdown>
        <UButton color="black" icon="i-lucide-plus" class="font-semibold rounded-md" size="sm" @click="addProduct">Agregar producto</UButton>
      </div>
    </div>

    <!-- Reports and Statistics Bar -->
    <div v-if="isStatsBarVisible">
      <UCard :ui="{ ring: 'ring-1 ring-gray-200 dark:ring-gray-800', shadow: 'shadow-sm', rounded: 'rounded-xl', body: { padding: 'p-0 sm:p-0' } }" class="bg-white dark:bg-gray-900 overflow-hidden">
        <div class="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800">
          <!-- Date filter section -->
          <UPopover :popper="{ placement: 'bottom-start' }" class="sm:w-48 flex-shrink-0 flex items-stretch">
            <template #default="{ open }">
              <div class="h-full w-full px-4 py-3 flex items-center justify-center sm:justify-start gap-2 text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors" :class="open ? 'bg-gray-50 dark:bg-gray-800/50' : ''">
                <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-500" />
                {{ currentStatsDateLabel }}
              </div>
            </template>
            <template #panel>
              <div class="p-5 w-[320px]">
                <URadioGroup
                  v-model="statsDateRange"
                  :options="statsDateOptions"
                  :ui="{ 
                    fieldset: 'space-y-4',
                  }"
                >
                  <template #label="{ option }">
                    <div class="flex flex-col cursor-pointer">
                      <span class="text-[14px] font-medium text-gray-800 dark:text-gray-200">{{ option.label }}</span>
                      <span class="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{{ option.description }}</span>
                    </div>
                  </template>
                </URadioGroup>
              </div>
            </template>
          </UPopover>
          
          <!-- Stat 1 -->
          <div class="px-4 py-3 flex-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
            <div class="text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-1 w-fit border-b border-dashed border-gray-400 dark:border-gray-500 group-hover:border-gray-600 dark:group-hover:border-gray-300 transition-colors">
              Tasa media de ventas directas
            </div>
            <div class="text-[15px] font-medium text-gray-900 dark:text-white">
              0 % <span class="text-gray-400 font-normal ml-1">—</span>
            </div>
          </div>
          
          <!-- Stat 2 -->
          <div class="px-4 py-3 flex-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
            <div class="text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-1 w-fit border-b border-dashed border-gray-400 dark:border-gray-500 group-hover:border-gray-600 dark:group-hover:border-gray-300 transition-colors">
              Productos por días de inventario restante
            </div>
            <div class="text-[14px] font-normal text-gray-500 dark:text-gray-400">
              Sin datos
            </div>
          </div>
          
          <!-- Stat 3 -->
          <div class="px-4 py-3 flex-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
            <div class="text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-1 w-fit border-b border-dashed border-gray-400 dark:border-gray-500 group-hover:border-gray-600 dark:group-hover:border-gray-300 transition-colors">
              Análisis ABC de productos
            </div>
            <div class="text-[15px] font-medium text-gray-900 dark:text-white">
              0,00 € <span class="text-gray-500 font-normal ml-1">C</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Core Layout with Table -->
    <UCard :ui="{ body: { padding: 'sm:p-0' } }">
        <div class="border-b border-gray-200 dark:border-gray-800 px-4 pt-4 flex gap-4 overflow-x-auto">
          <button
            v-for="(tab, index) in tabs"
            :key="index"
            @click="activeTab = index"
            class="pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap"
            :class="[
              activeTab === index 
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            ]"
          >
            {{ tab.label }}
            <UBadge v-if="tab.badge !== undefined" color="gray" variant="subtle" size="xs" class="flex items-center justify-center min-w-[1.5rem] px-1 pb-0 pt-0 text-[11px] h-5">{{ tab.badge }}</UBadge>
          </button>
          <div class="ml-auto">
            <UButton color="gray" variant="ghost" icon="i-lucide-layers" label="Gestionar Categorías" size="xs" class="rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white" @click="isCategoryDrawerOpen = true" />
          </div>
        </div>

        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <div class="flex gap-2 items-center">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              placeholder="Buscar productos"
              class="w-64"
            />
            <UPopover :popper="{ placement: 'bottom-start' }" :ui="{ base: 'overflow-visible focus:outline-none flex flex-col' }">
              <UButton color="gray" variant="ghost" icon="i-lucide-filter" label="Filtros">
                <template #trailing v-if="activeFiltersCount > 0">
                  <UBadge color="primary" variant="solid" size="xs" :ui="{ rounded: 'rounded-full' }">{{ activeFiltersCount }}</UBadge>
                </template>
              </UButton>

              <template #panel>
                <div class="p-4 w-72 space-y-4">
                  <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span class="font-medium text-sm">Filtros</span>
                    <UButton v-if="activeFiltersCount > 0" label="Limpiar" color="gray" variant="ghost" size="xs" @click="clearFilters" />
                  </div>
                  
                  <UFormGroup label="Estado">
                    <USelectMenu v-model="filters.status" :options="statusOptions" value-attribute="value" multiple placeholder="Todos los estados" class="w-full" :popper="{ strategy: 'fixed' }">
                      <template #label>
                        <div v-if="filters.status.length" class="flex gap-1 flex-wrap">
                          <UBadge v-for="v in filters.status" :key="v" color="gray" variant="subtle" size="xs" class="font-medium whitespace-nowrap">
                            {{ v }}
                          </UBadge>
                        </div>
                        <span v-else>Todos los estados</span>
                      </template>
                    </USelectMenu>
                  </UFormGroup>
                  
                  <UFormGroup label="Categoría">
                    <USelectMenu v-model="filters.category" :options="categoryOptions" value-attribute="value" multiple placeholder="Todas las categorías" class="w-full" :popper="{ strategy: 'fixed' }">
                      <template #label>
                        <div v-if="filters.category.length" class="flex gap-1 flex-wrap">
                          <UBadge v-for="v in filters.category" :key="v" color="gray" variant="subtle" size="xs" class="font-medium whitespace-nowrap">
                            {{ v }}
                          </UBadge>
                        </div>
                        <span v-else>Todas las categorías</span>
                      </template>
                    </USelectMenu>
                  </UFormGroup>
                </div>
              </template>
            </UPopover>
          </div>
          <UButton v-if="selectedProducts.length" color="white" label="Acciones en lote" icon="i-lucide-chevron-down" />
        </div>

        <!-- Table -->
        <UTable 
          v-model="selectedProducts" 
          :rows="filteredTableProducts" 
          :columns="tableColumns"
          class="w-full cursor-pointer"
          @select="(row: any) => navigateTo(`/producto/${row.id}`)"
        >
          <!-- Headers -->
          <template #name-header="{ column }">
            <span class="flex items-center gap-2 py-1"><UIcon name="i-lucide-box" class="w-4 h-4 text-gray-400" />{{ column.label }}</span>
          </template>
          <template #status-header="{ column }">
            <span class="flex items-center gap-2 py-1"><UIcon name="i-lucide-activity" class="w-4 h-4 text-gray-400" />{{ column.label }}</span>
          </template>
          <template #inventory-header="{ column, sort, onSort }">
            <UButton
              color="gray"
              variant="ghost"
              :label="column.label"
              :icon="sort.column === column.key ? (sort.direction === 'asc' ? 'i-heroicons-arrow-up-20-solid' : 'i-heroicons-arrow-down-20-solid') : 'i-heroicons-arrows-up-down-20-solid'"
              @click="onSort(column)"
              class="-ml-2.5 font-semibold text-gray-900 dark:text-white hover:bg-transparent"
            />
          </template>
          <template #category-header="{ column }">
            <span class="flex items-center gap-2 py-1"><UIcon name="i-lucide-tags" class="w-4 h-4 text-gray-400" />{{ column.label }}</span>
          </template>
          <template #channels-header="{ column }">
            <span class="flex items-center gap-2 py-1"><UIcon name="i-lucide-monitor" class="w-4 h-4 text-gray-400" />{{ column.label }}</span>
          </template>
          <!-- Custom Product Column -->
          <template #name-data="{ row }">
             <div class="flex items-center gap-3 py-1">
              <div class="w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <img v-if="row.image" :src="row.image" class="w-full h-full object-cover" :alt="row.name" />
                <UIcon v-else name="i-lucide-image" class="text-gray-400 w-5 h-5" />
              </div>
              <span class="font-semibold text-gray-900 dark:text-white">{{ row.name }}</span>
            </div>
          </template>

          <!-- Custom Status Column -->
          <template #status-data="{ row }">
             <UBadge :color="row.status === 'Activo' ? 'green' : 'gray'" variant="soft" class="font-semibold capitalize tracking-wide text-xs px-2" size="sm">
               {{ row.status }}
             </UBadge>
          </template>

          <!-- Custom Inventory Column -->
          <template #inventory-data="{ row }">
             <span :class="row.inventory === 0 ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400 font-medium'">
               {{ row.inventory === 0 ? '0 en existencias' : `${row.inventory} en existencias` }}
             </span>
          </template>
          
          <!-- Custom Category Column -->
          <template #category-data="{ row }">
             <span class="text-gray-500 dark:text-gray-400 font-medium">{{ row.category }}</span>
          </template>
          
          <!-- Custom Channels Column -->
          <template #channels-data="{ row }">
             <span class="text-gray-500 dark:text-gray-400 font-medium">{{ row.channels }}</span>
          </template>
        </UTable>
      </UCard>

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
    <UModal v-model="isImportModalOpen" :ui="{ width: 'sm:max-w-xl' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', body: { padding: 'p-4 sm:p-5' } }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-[17px] font-semibold text-gray-700 dark:text-gray-200">Importar productos por CSV</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isImportModalOpen = false" />
          </div>
        </template>
        
        <div v-if="isDraggingGlobal" class="border border-solid border-gray-600 dark:border-gray-400 rounded-lg py-16 flex flex-col items-center justify-center bg-transparent pointer-events-none">
          <span class="text-[15px] font-medium text-gray-700 dark:text-gray-200">Suelta el archivo que quieres cargar</span>
        </div>
        
        <div v-else-if="!selectedImportFile" class="border border-dashed border-gray-400 dark:border-gray-600 rounded-lg py-16 flex flex-col items-center justify-center bg-transparent">
          <input type="file" ref="importFileInput" accept=".csv" class="hidden" @change="onFileSelect" />
          <UButton color="white" icon="i-lucide-plus" size="sm" class="font-medium shadow-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md z-10" @click="triggerFileInput">Agregar archivo</UButton>
        </div>
        
        <div v-else class="space-y-6">
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between bg-white dark:bg-gray-900">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                <UIcon name="i-lucide-paperclip" class="w-5 h-5 text-gray-500" />
              </div>
              <span class="font-medium text-[15px] text-gray-900 dark:text-white">{{ selectedImportFile.name }}</span>
            </div>
            <input type="file" ref="importFileInput" accept=".csv" class="hidden" @change="onFileSelect" />
            <UButton color="white" size="sm" class="text-[14px] font-medium shadow-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md px-3" @click="triggerFileInput">Reemplazar archivo</UButton>
          </div>
          
          <div class="space-y-3 pt-1">
            <UCheckbox v-model="overwriteProducts" :ui="{ label: 'text-[15px] text-gray-700 dark:text-gray-300 font-normal', help: 'text-[14px] text-gray-500 mt-1' }" label="Sobrescribir productos con identificadores coincidentes." help="Se reemplazarán los valores existentes para todas las columnas incluidas en el CSV." />
            <UCheckbox v-model="publishProducts" :ui="{ label: 'text-[15px] text-gray-700 dark:text-gray-300 font-normal' }" label="Publicar productos nuevos en todos los canales de ventas." />
          </div>
        </div>
        
        <template #footer>
          <div class="flex items-center justify-between w-full">
            <a href="#" @click.prevent="downloadSampleCSV" class="text-[14px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline">Descargar CSV de ejemplo</a>
            <div class="flex items-center gap-2">
              <UButton color="white" variant="solid" size="sm" class="border border-gray-300 dark:border-gray-600 font-medium rounded-md px-4" @click="isImportModalOpen = false">Cancelar</UButton>
              <UButton color="gray" variant="solid" size="sm" :disabled="!selectedImportFile" class="font-medium rounded-md px-4 transition-colors" 
                       :class="!selectedImportFile ? 'bg-[#CFCFCF] text-white dark:bg-gray-700 dark:text-gray-300' : 'bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900'"
                       @click="handleImportPreview">
                Subir y previsualizar
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Preview Modal -->
    <UModal v-model="isPreviewModalOpen" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', body: { padding: 'p-4 sm:p-5' } }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-[17px] font-semibold text-gray-900 dark:text-white">Previsualiza tu primer producto</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isPreviewModalOpen = false" />
          </div>
        </template>
        
        <div class="space-y-4">
          <!-- Info Alert -->
          <div class="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg p-4 flex gap-3 text-sm border border-blue-100 dark:border-blue-900/50">
            <UIcon name="i-lucide-info" class="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <p>Estás importando un archivo al catálogo. Si esta vista previa no se ve correcta, puedes intentar <a href="#" class="underline">cambiar el orden de los encabezados de columna</a>.</p>
          </div>

          <p class="text-[15px] text-gray-700 dark:text-gray-300">
            Vas a importar aproximadamente <span class="font-bold">{{ importPreviewData.totalCount }} producto{{ importPreviewData.totalCount !== 1 ? 's' : '' }}</span> con un total de <span class="font-bold">{{ importPreviewData.skuCount }} SKU</span> y <span class="font-bold">{{ importPreviewData.imageCount }} imágenes</span>. La importación <span class="font-bold" v-if="!overwriteProducts">no </span><span class="font-bold">sobrescribirá los productos existentes</span> que tengan el mismo identificador de producto y <span class="font-bold">publicará en todos los canales de ventas</span>.
          </p>

          <!-- Warning Alert -->
          <div v-if="importPreviewData.hasInvalidCategories" class="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg p-4 flex gap-3 text-sm border border-red-100 dark:border-red-900/50">
            <UIcon name="i-lucide-alert-circle" class="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <p>Tu importación contiene una categoría de producto no registrada. Aún puedes importar, pero se crearán las nuevas categorías automáticamente. Consulta las <a href="#" class="underline font-semibold" @click="isCategoryDrawerOpen = true">categorías registradas</a> para ver una lista válida.</p>
          </div>

          <!-- Product Details preview -->
          <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-950 shadow-sm">
            <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-2 md:items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
               <div class="w-1/3 text-[14px] font-semibold text-gray-800 dark:text-gray-200">Título</div>
               <div class="w-2/3 text-[14px] text-gray-700 dark:text-gray-300">{{ importPreviewData.firstProduct?.name || '—' }}</div>
            </div>
            <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-2 md:items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
               <div class="w-1/3 text-[14px] font-semibold text-gray-800 dark:text-gray-200">Descripción</div>
               <div class="w-2/3 text-[14px] text-gray-700 dark:text-gray-300 line-clamp-1">{{ importPreviewData.firstProduct?.desc || '—' }}</div>
            </div>
            <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-2 md:items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
               <div class="w-1/3 text-[14px] font-semibold text-gray-800 dark:text-gray-200">Estado del producto</div>
               <div class="w-2/3 text-[14px] text-gray-700 dark:text-gray-300">{{ importPreviewData.firstProduct?.status || '—' }}</div>
            </div>
            <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-2 md:items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
               <div class="w-1/3 text-[14px] font-semibold text-gray-800 dark:text-gray-200">Categoría de producto</div>
               <div class="w-2/3 text-[14px] text-gray-700 dark:text-gray-300">{{ importPreviewData.firstProduct?.category || '—' }}</div>
            </div>
            <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-2 md:items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
               <div class="w-1/3 text-[14px] font-semibold text-gray-800 dark:text-gray-200">Tipo de producto</div>
               <div class="w-2/3 text-[14px] text-gray-700 dark:text-gray-300">Producto físico</div>
            </div>
            <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-2 md:items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
               <div class="w-1/3 text-[14px] font-semibold text-gray-800 dark:text-gray-200">Proveedor</div>
               <div class="w-2/3 text-[14px] text-gray-700 dark:text-gray-300">Mi tienda</div>
            </div>
            <div class="px-5 py-3 bg-white dark:bg-gray-950 overflow-x-auto">
               <table class="w-full text-left text-[14px] whitespace-nowrap">
                 <thead>
                   <tr class="text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                     <th class="font-medium pb-2 pr-4">Variante</th>
                     <th class="font-medium pb-2 px-4">SKU</th>
                     <th class="font-medium pb-2 px-4 text-right">Inventario</th>
                     <th class="font-medium pb-2 pl-4 text-right">Precio</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td class="pt-3 pr-4 text-gray-800 dark:text-gray-200">Predeterminada</td>
                     <td class="pt-3 px-4 text-gray-800 dark:text-gray-200">{{ importPreviewData.firstProduct?.id || '—' }}</td>
                     <td class="pt-3 px-4 text-right text-gray-800 dark:text-gray-200">{{ importPreviewData.firstProduct?.inventory ?? '—' }}</td>
                     <td class="pt-3 pl-4 text-right text-gray-800 dark:text-gray-200">{{ formatPrice(importPreviewData.firstProduct?.price || 0) }}</td>
                   </tr>
                 </tbody>
               </table>
            </div>
          </div>
        </div>
        
        <template #footer>
          <div class="flex items-center justify-end gap-2 w-full">
            <UButton color="white" variant="solid" size="sm" class="border border-gray-300 dark:border-gray-600 font-medium rounded-md px-4" @click="isPreviewModalOpen = false; isImportModalOpen = true">Cancelar</UButton>
            <UButton color="gray" variant="solid" size="sm" class="font-medium rounded-md px-4 transition-colors bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900" @click="confirmImport">
              Importar productos
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Export Modal -->
    <UModal v-model="isExportModalOpen" :ui="{ width: 'sm:max-w-xl' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-200 dark:divide-gray-800', body: { padding: 'p-5 sm:p-6' }, header: { padding: 'p-4 sm:px-6 sm:py-4' }, footer: { padding: 'p-4 sm:px-6 flex justify-end gap-3' } }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-[17px] font-semibold text-gray-900 dark:text-white">Exportar productos</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isExportModalOpen = false" />
          </div>
        </template>
        
        <div class="space-y-6">
          <p class="text-[15px] font-normal leading-relaxed text-gray-700 dark:text-gray-300">
            Este archivo CSV puede actualizar toda la información del producto. Para actualizar solo las cantidades de inventario, usa el <a href="#" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline">Archivo CSV para inventario</a>.
          </p>

          <div class="space-y-4">
             <h4 class="text-[15px] text-gray-900 dark:text-white font-medium">Exportar</h4>
             <URadioGroup 
               v-model="exportOption"
               :options="computedExportOptions"
               :ui="{ fieldset: 'space-y-3', label: 'text-[15px] font-normal text-gray-700 dark:text-gray-300' }"
               color="primary"
             />
          </div>

          <div class="space-y-4">
             <h4 class="text-[15px] text-gray-900 dark:text-white font-medium">Exportar como</h4>
             <URadioGroup 
               v-model="exportTypeOption"
               :options="exportTypeOptions"
               :ui="{ fieldset: 'space-y-3', label: 'text-[15px] font-normal text-gray-700 dark:text-gray-300' }"
               color="primary"
             />
          </div>

          <p class="text-[15px] font-normal text-gray-700 dark:text-gray-300">
            Más información sobre <a href="#" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline">exportar productos a archivo CSV</a> o el <a href="#" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline">editor masivo</a>.
          </p>
        </div>

        <template #footer>
          <UButton color="white" size="sm" class="border border-gray-300 dark:border-gray-600 font-medium rounded-md px-4" @click="isExportModalOpen = false">Cancelar</UButton>
          <UButton color="gray" size="sm" icon="i-lucide-upload" class="bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 font-medium rounded-md px-4" @click="handleExport">Exportar productos</UButton>
        </template>
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
