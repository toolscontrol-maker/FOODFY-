<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchQuery = ref('')
const selectedIds = ref<number[]>([])

// Mock existing media library
const mediaLibrary = ref([
  { id: 1, name: 'hamburguesa_clasica.jpg', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300', type: 'JPG' },
  { id: 2, name: 'patatas_fritas.png', url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=300', type: 'PNG' },
  { id: 3, name: 'combo_grande.webp', url: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?q=80&w=300', type: 'WEBP' },
  { id: 4, name: 'ensalada_cesar.jpg', url: 'https://images.unsplash.com/photo-1546793665-c74683c3f38d?q=80&w=300', type: 'JPG' },
  { id: 5, name: 'cocacola_zero.png', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300', type: 'PNG' },
])

const filteredMedia = computed(() => {
  if (!searchQuery.value) return mediaLibrary.value
  return mediaLibrary.value.filter(m => m.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const toggleSelection = (id: number) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const handleConfirm = () => {
  const selectedUrls = mediaLibrary.value
    .filter(m => selectedIds.value.includes(m.id))
    .map(m => m.url)
  
  emit('confirm', selectedUrls)
  isOpen.value = false
  selectedIds.value = []
}

const simulateUpload = () => {
  const url = window.prompt('Introduce la URL de la nueva imagen:')
  if (url) {
    const newMedia = {
      id: Date.now(),
      name: `upload_${Date.now()}.jpg`,
      url: url,
      type: 'JPG'
    }
    mediaLibrary.value.unshift(newMedia)
    selectedIds.value.push(newMedia.id)
  }
}
</script>

<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-4xl' }">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900 dark:text-white">Seleccionar archivo</h3>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isOpen = false" />
        </div>
      </template>

      <div class="p-1 space-y-4">
        <!-- Search and Filters -->
        <div class="flex flex-wrap items-center gap-2">
          <UInput 
            v-model="searchQuery" 
            icon="i-lucide-search" 
            placeholder="Buscar archivos" 
            class="flex-1 min-w-[200px]" 
          />
          <div class="flex items-center gap-1">
            <UButton icon="i-lucide-arrow-up-down" color="gray" variant="ghost" size="sm" label="Ordenar" />
            <div class="flex border border-gray-200 dark:border-gray-800 rounded-lg p-0.5">
              <UButton icon="i-lucide-layout-grid" color="primary" variant="soft" size="xs" />
              <UButton icon="i-lucide-list" color="gray" variant="ghost" size="xs" />
              <UIcon name="i-lucide-chevron-down" class="w-3 h-3 text-gray-400 ml-0.5" />
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton label="Tipo de archivo" color="gray" variant="ghost" size="xs" trailing-icon="i-lucide-chevron-down" class="border border-gray-200 dark:border-gray-800 px-2" />
          <UButton label="Tamaño del archivo" color="gray" variant="ghost" size="xs" trailing-icon="i-lucide-chevron-down" class="border border-gray-200 dark:border-gray-800 px-2" />
          <UButton label="Usado en" color="gray" variant="ghost" size="xs" trailing-icon="i-lucide-chevron-down" class="border border-gray-200 dark:border-gray-800 px-2" />
          <UButton label="Producto" color="gray" variant="ghost" size="xs" trailing-icon="i-lucide-chevron-down" class="border border-gray-200 dark:border-gray-800 px-2" />
        </div>

        <!-- Dropzone simulation -->
        <div 
          class="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl py-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
          @click="simulateUpload"
        >
          <UDropdown :items="[[{ label: 'Subir desde dispositivo' }, { label: 'Desde URL' }]]">
            <UButton color="white" label="Agregar multimedia" trailing-icon="i-lucide-chevron-down" class="border border-gray-200 dark:border-gray-800 shadow-sm mb-2" />
          </UDropdown>
          <p class="text-[12px] text-gray-500">Arrastra y suelta imágenes, videos, modelos 3D y archivos</p>
        </div>

        <!-- Selection Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 h-[300px] overflow-y-auto p-1 custom-scrollbar">
          <div 
            v-for="item in filteredMedia" 
            :key="item.id"
            class="group relative space-y-1 cursor-pointer"
            @click="toggleSelection(item.id)"
          >
            <div 
              class="aspect-square rounded-lg overflow-hidden border-2 transition-all relative"
              :class="selectedIds.includes(item.id) ? 'border-primary-500 ring-1 ring-primary-500 shadow-sm' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50 dark:bg-gray-800/50'"
            >
              <img :src="item.url" class="w-full h-full object-cover" />
              <!-- Tick circle like in image -->
              <div class="absolute top-2 left-2 z-10 w-5 h-5 rounded flex items-center justify-center border transition-all"
                :class="selectedIds.includes(item.id) ? 'bg-black border-black text-white' : 'bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100'"
              >
                <UIcon v-if="selectedIds.includes(item.id)" name="i-lucide-check" class="w-3.5 h-3.5" />
              </div>
            </div>
            <div class="px-1 overflow-hidden">
              <p class="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">{{ item.name }}</p>
              <p class="text-[9px] text-gray-400 font-bold uppercase">{{ item.type }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <UButton 
            v-if="selectedIds.length > 0" 
            label="Borrar selección" 
            color="primary" 
            variant="link" 
            size="sm" 
            @click="selectedIds = []" 
          />
          <div v-else />
          <div class="flex gap-2">
            <UButton label="Cancelar" color="gray" variant="ghost" @click="isOpen = false" />
            <UButton 
              label="Listo" 
              color="black" 
              :disabled="selectedIds.length === 0" 
              class="px-6"
              @click="handleConfirm" 
            />
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
