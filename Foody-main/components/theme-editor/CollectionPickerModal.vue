<script setup lang="ts">
import { useCollectionsStore } from '~/stores/useCollectionsStore'
import type { Collection } from '~/types/commerce'

const props = defineProps<{
  modelValue: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const collectionsStore = useCollectionsStore()
const isOpen = ref(false)
const search = ref('')

const collections = computed(() => {
  const q = search.value.toLowerCase().trim()
  const all = collectionsStore.collections
  if (!q) return all
  return all.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.handle.toLowerCase().includes(q)
  )
})

const selectedCollection = computed<Collection | null>(() => {
  if (!props.modelValue) return null
  return collectionsStore.getCollectionById(props.modelValue)
})

const selectCollection = (id: string) => {
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

const statusLabel = (c: Collection) => {
  if (c.status === 'draft') return 'Borrador'
  return null
}
</script>

<template>
  <div class="space-y-1.5">
    <p class="text-[11px] font-medium text-gray-500">{{ label || 'Colección' }}</p>

    <!-- Current selection -->
    <div v-if="selectedCollection" class="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div class="w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
        <img v-if="selectedCollection.image" :src="selectedCollection.image" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center">
          <UIcon name="i-lucide-folder" class="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[12px] font-medium text-gray-900 dark:text-white truncate">{{ selectedCollection.title }}</p>
        <p class="text-[11px] text-gray-500">{{ selectedCollection.productIds.length }} producto{{ selectedCollection.productIds.length !== 1 ? 's' : '' }}</p>
      </div>
      <div class="flex gap-1 flex-shrink-0">
        <UButton icon="i-lucide-replace" color="gray" variant="ghost" size="xs" @click="openPicker" title="Cambiar" />
        <UButton icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="clearSelection" title="Quitar" />
      </div>
    </div>

    <!-- Missing collection warning -->
    <div v-else-if="modelValue && !selectedCollection" class="flex items-center gap-2 p-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
      <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-amber-500 flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-[11px] font-medium text-amber-700 dark:text-amber-400">Colección no encontrada</p>
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
        <UIcon name="i-lucide-folder" class="w-4 h-4 text-gray-400" />
      </div>
      <span class="text-[12px] text-gray-500 font-medium">Seleccionar colección</span>
    </button>

    <!-- Picker modal -->
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', body: { padding: 'p-0' } }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Seleccionar colección</h3>
            <UButton icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="isOpen = false" />
          </div>
          <UInput v-model="search" icon="i-lucide-search" placeholder="Buscar colecciones..." size="sm" class="mt-2" autofocus />
        </template>
        <div class="max-h-[360px] overflow-y-auto">
          <div v-if="collections.length === 0" class="py-10 text-center">
            <UIcon name="i-lucide-search-x" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-[13px] text-gray-500">No se encontraron colecciones</p>
          </div>
          <button
            v-for="c in collections"
            :key="c.id"
            class="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left border-b border-gray-50 dark:border-gray-800/50 last:border-0"
            :class="c.id === modelValue ? 'bg-primary-50 dark:bg-primary-900/20' : ''"
            @click="selectCollection(c.id)"
          >
            <div class="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
              <img v-if="c.image" :src="c.image" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-lucide-folder" class="w-4 h-4 text-gray-300" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <p class="text-[13px] font-medium text-gray-900 dark:text-white truncate">{{ c.title }}</p>
                <UBadge v-if="statusLabel(c)" color="amber" variant="soft" size="xs">{{ statusLabel(c) }}</UBadge>
                <UBadge v-if="c.productIds.length === 0" color="gray" variant="soft" size="xs">Vacía</UBadge>
              </div>
              <p class="text-[11px] text-gray-500">{{ c.productIds.length }} producto{{ c.productIds.length !== 1 ? 's' : '' }} · {{ c.type === 'automated' ? 'Automática' : 'Manual' }}</p>
            </div>
            <UIcon v-if="c.id === modelValue" name="i-lucide-check" class="w-4 h-4 text-primary-500 flex-shrink-0" />
          </button>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
