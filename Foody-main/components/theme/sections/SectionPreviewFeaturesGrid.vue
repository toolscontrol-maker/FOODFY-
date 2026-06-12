<script setup lang="ts">
import { computed } from 'vue'
import { useOnlineStoreStore, type ThemeSection } from '~/stores/useOnlineStoreStore'
import { useThemePreviewData } from '~/composables/useThemePreviewData'
import { THEME_ICON_MAP } from '~/composables/useThemePreviewData'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const store = useOnlineStoreStore()
const { getSetting } = useThemePreviewData()
const gs = (key: string) => getSetting(props.sec, key)

const bgColor = computed(() => gs('bg_color') || 'var(--theme-bg, #ffffff)')
const iconColor = computed(() => gs('icon_color') || '#e63946')
const title = computed(() => gs('title') || '¿Por qué elegirnos?')
const columns = computed(() => Number(gs('columns') ?? 3))
const visibleBlocks = computed(() => props.sec.blocks.filter(b => !b.hidden))

const gridCols = computed(() => {
  if (props.isMobile) return 'grid-cols-1'
  if (columns.value === 2) return 'grid-cols-2'
  if (columns.value === 4) return 'grid-cols-4'
  return 'grid-cols-3'
})

const blockGs = (blk: any, key: string) => blk.settings.find((s: any) => s.key === key)?.value ?? null
const getIcon = (blk: any) => THEME_ICON_MAP[blockGs(blk, 'icon') || 'star'] || 'i-lucide-star'

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'" :style="{ backgroundColor: bgColor }">
    <ThemeSectionHeader v-if="title" :title="title" centered />

    <div class="grid gap-6" :class="gridCols">
      <div
        v-for="blk in visibleBlocks"
        :key="blk.id"
        class="flex gap-5 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all bg-white dark:bg-gray-900"
        :class="store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id
          ? 'ring-2 ring-primary-500'
          : ''"
        @click.stop="selectBlock(blk.id)"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          :style="{ backgroundColor: iconColor + '15' }"
        >
          <UIcon :name="getIcon(blk)" class="w-6 h-6" :style="{ color: iconColor }" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-1.5">{{ blockGs(blk, 'title') || '' }}</h3>
          <p class="text-xs text-gray-500 leading-relaxed">{{ blockGs(blk, 'description') || '' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
