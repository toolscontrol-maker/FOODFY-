<script setup lang="ts">
import { useCatalogStore } from '~/stores/useCatalogStore'
import { getProductPrice, getProductCoverImage } from '~/types/commerce'
import type { Product } from '~/types/commerce'

const props = defineProps<{
  modelValue: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const catalogStore = useCatalogStore()
const isOpen = ref(false)
const search = ref('')

const products = computed(() => {
  const q = search.value.toLowerCase().trim()
  const all = catalogStore.products
  if (!q) return all
  return all.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.handle.toLowerCase().includes(q) ||
    p.vendor.toLowerCase().includes(q)
  )
})

const selectedProduct = computed<Product | null>(() => {
  if (!props.modelValue) return null
  return catalogStore.getProductById(props.modelValue)
})

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)

const selectProduct = (id: string) => {
  emit('update:modelValue', id)
  isOpen.value = false
  search.value = ''
}

const clearSelection = () => {
  emit('update:modelValue', '')
}

const openPicker = () => {
  search.value = ''
  isOpen.value = true
}

const statusLabel = (p: Product) => {
  if (p.status === 'draft') return 'Borrador'
  if (p.status === 'archived') return 'Archivado'
  return null
}

const statusColor = (p: Product) => {
  if (p.status === 'draft') return 'amber'
  if (p.status === 'archived') return 'gray'
  return 'green'
}
</script>

<template>
  <div class="space-y-1.5">
    <p class="text-[11px] font-medium text-gray-500">{{ label || 'Producto' }}</p>

    <!-- Current selection -->
    <div v-if="selectedProduct" class="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div class="w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
        <img v-if="getProductCoverImage(selectedProduct)" :src="getProductCoverImage(selectedProduct)" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center">
          <UIcon name="i-lucide-package" class="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[12px] font-medium text-gray-900 dark:text-white truncate">{{ selectedProduct.name }}</p>
        <p class="text-[11px] text-gray-500">{{ formatPrice(getProductPrice(selectedProduct)) }}</p>
      </div>
      <div class="flex gap-1 flex-shrink-0">
        <UButton icon="i-lucide-replace" color="gray" variant="ghost" size="xs" @click="openPicker" title="Cambiar" />
        <UButton icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="clearSelection" title="Quitar" />
      </div>
    </div>

    <!-- Missing product warning -->
    <div v-else-if="modelValue && !selectedProduct" class="flex items-center gap-2 p-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
      <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-amber-500 flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-[11px] font-medium text-amber-700 dark:text-amber-400">Producto no encontrado</p>
        <p class="text-[10px] text-amber-600 dark:text-amber-500 truncate">ID: {{ modelValue }}</p>
      </div>
      <UButton size="xs" color="amber" variant="soft" @click="openPicker">Reemplazar</UButton>
    </div>

    <!-- Empty state -->
    <button
      v-else
      class="w-full flex items-center gap-2 p-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors text-left"
      @click="openPicker"
    >
      <div class="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <UIcon name="i-lucide-package" class="w-4 h-4 text-gray-400" />
      </div>
      <span class="text-[12px] text-gray-500 font-medium">Seleccionar producto</span>
    </button>

    <!-- Picker modal -->
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', body: { padding: 'p-0' } }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Seleccionar producto</h3>
            <UButton icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="isOpen = false" />
          </div>
          <UInput v-model="search" icon="i-lucide-search" placeholder="Buscar productos..." size="sm" class="mt-2" autofocus />
        </template>
        <div class="max-h-[360px] overflow-y-auto">
          <div v-if="products.length === 0" class="py-10 text-center">
            <UIcon name="i-lucide-search-x" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-[13px] text-gray-500">No se encontraron productos</p>
          </div>
          <button
            v-for="p in products"
            :key="p.id"
            class="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left border-b border-gray-50 dark:border-gray-800/50 last:border-0"
            :class="p.id === modelValue ? 'bg-primary-50 dark:bg-primary-900/20' : ''"
            @click="selectProduct(p.id)"
          >
            <div class="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
              <img v-if="getProductCoverImage(p)" :src="getProductCoverImage(p)" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-lucide-package" class="w-4 h-4 text-gray-300" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <p class="text-[13px] font-medium text-gray-900 dark:text-white truncate">{{ p.name }}</p>
                <UBadge v-if="statusLabel(p)" :color="statusColor(p)" variant="soft" size="xs">{{ statusLabel(p) }}</UBadge>
              </div>
              <p class="text-[11px] text-gray-500">{{ formatPrice(getProductPrice(p)) }} · {{ p.vendor || 'Sin marca' }}</p>
            </div>
            <UIcon v-if="p.id === modelValue" name="i-lucide-check" class="w-4 h-4 text-primary-500 flex-shrink-0" />
          </button>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
