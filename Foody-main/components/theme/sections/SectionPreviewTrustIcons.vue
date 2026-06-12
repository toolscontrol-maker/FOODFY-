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
const iconColor = computed(() => gs('icon_color') || '#059669')
const title = computed(() => gs('title') || '')
const columns = computed(() => Number(gs('columns') ?? 4))
const visibleBlocks = computed(() => props.sec.blocks.filter(b => !b.hidden))

const gridCols = computed(() => {
  if (props.isMobile) return 'grid-cols-2'
  if (columns.value === 3) return 'grid-cols-3'
  if (columns.value === 5) return 'grid-cols-5'
  return 'grid-cols-4'
})

const blockGs = (blk: any, key: string) => blk.settings.find((s: any) => s.key === key)?.value ?? null
const getIcon = (blk: any) => THEME_ICON_MAP[blockGs(blk, 'icon') || 'check'] || 'i-lucide-check-circle'

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div :class="isMobile ? 'px-5 py-10' : 'px-10 py-12'" :style="{ backgroundColor: bgColor }">
    <ThemeSectionHeader v-if="title" :title="title" centered class="mb-6" />

    <div class="grid gap-6" :class="gridCols">
      <div
        v-for="blk in visibleBlocks"
        :key="blk.id"
        class="flex flex-col items-center text-center gap-3 p-4 rounded-2xl transition-all"
        :class="store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id
          ? 'ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
          : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'"
        @click.stop="selectBlock(blk.id)"
      >
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: iconColor + '18' }"
        >
          <UIcon :name="getIcon(blk)" class="w-7 h-7" :style="{ color: iconColor }" />
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ blockGs(blk, 'title') || '' }}</p>
          <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ blockGs(blk, 'description') || '' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
