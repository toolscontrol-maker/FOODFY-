<script setup lang="ts">
import { computed } from 'vue'
import { useOnlineStoreStore, type ThemeSection } from '~/stores/useOnlineStoreStore'
import { useThemePreviewData } from '~/composables/useThemePreviewData'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const store = useOnlineStoreStore()
const { getSetting, resolveCollection } = useThemePreviewData()
const gs = (key: string) => getSetting(props.sec, key)

const title = computed(() => gs('title') || 'Nuestras categorías')
const columns = computed(() => Number(gs('columns') ?? 3))
const visibleBlocks = computed(() => props.sec.blocks.filter(b => !b.hidden))

const gridCols = computed(() => {
  if (props.isMobile) return 'grid-cols-2'
  if (columns.value === 2) return 'grid-cols-2'
  if (columns.value === 4) return 'grid-cols-4'
  return 'grid-cols-3'
})

const getCollection = (blk: any) =>
  resolveCollection(blk.settings.find((s: any) => s.key === 'collectionId')?.value)

const getTitle = (blk: any) => {
  const col = getCollection(blk)
  return col?.title || blk.settings.find((s: any) => s.key === 'title')?.value || 'Categoría'
}

const getImage = (blk: any) => {
  const col = getCollection(blk)
  return col?.image || blk.settings.find((s: any) => s.key === 'image')?.value || ''
}

const getCount = (blk: any) => {
  const col = getCollection(blk)
  return col ? `${col.productIds.length} productos` : ''
}

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'" :style="{ backgroundColor: 'var(--theme-bg, #ffffff)' }">
    <ThemeSectionHeader v-if="title" :title="title" class="mb-6" />

    <div class="grid" :class="gridCols" :style="{ gap: 'var(--theme-grid-h, 1rem)' }">
      <div
        v-for="blk in visibleBlocks"
        :key="blk.id"
        class="group/col rounded-2xl overflow-hidden relative flex items-end cursor-pointer transition-all hover:scale-[1.02]"
        :class="[
          isMobile ? 'h-36' : 'h-56',
          store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id ? 'ring-2 ring-primary-500' : ''
        ]"
        @click.stop="selectBlock(blk.id)"
      >
        <!-- Background image or placeholder -->
        <img
          v-if="getImage(blk)"
          :src="getImage(blk)"
          class="absolute inset-0 w-full h-full object-cover group-hover/col:scale-105 transition-transform duration-500"
          :alt="getTitle(blk)"
        />
        <ThemePlaceholderImage v-else variant="collection" class="absolute inset-0 w-full h-full" />

        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <!-- Text overlay -->
        <div class="relative z-10 p-4 w-full">
          <p class="text-white font-bold text-sm leading-tight">{{ getTitle(blk) }}</p>
          <p v-if="getCount(blk)" class="text-white/60 text-xs mt-0.5">{{ getCount(blk) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
