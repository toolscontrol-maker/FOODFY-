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
const { getSetting } = useThemePreviewData()
const gs = (key: string) => getSetting(props.sec, key)

const bgColor = computed(() => gs('bg_color') || 'var(--theme-bg, #f9fafb)')
const title = computed(() => gs('title') || 'Lo que dicen nuestros clientes')
const showStars = computed(() => gs('show_stars') !== false)
const columns = computed(() => Number(gs('columns') ?? 3))
const visibleBlocks = computed(() => props.sec.blocks.filter(b => !b.hidden))

const gridCols = computed(() => {
  if (props.isMobile) return 'grid-cols-1'
  return columns.value === 2 ? 'grid-cols-2' : 'grid-cols-3'
})

const blockGs = (blk: any, key: string) => blk.settings.find((s: any) => s.key === key)?.value ?? null

const getInitials = (name: string) => {
  return (name || 'A').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
}

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'" :style="{ backgroundColor: bgColor }">
    <ThemeSectionHeader :title="title" centered />

    <div class="grid gap-5" :class="gridCols">
      <div
        v-for="blk in visibleBlocks"
        :key="blk.id"
        class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border transition-all flex flex-col gap-4"
        :class="store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id
          ? 'ring-2 ring-primary-500 border-primary-300'
          : 'border-gray-100 dark:border-gray-800 hover:shadow-md'"
        @click.stop="selectBlock(blk.id)"
      >
        <!-- Stars -->
        <div v-if="showStars" class="flex gap-0.5">
          <UIcon
            v-for="i in Number(blockGs(blk, 'rating') || 5)"
            :key="i"
            name="i-lucide-star"
            class="w-4 h-4 text-amber-400"
            style="fill: #f59e0b"
          />
        </div>

        <!-- Large decorative quote -->
        <p class="text-4xl font-serif text-gray-200 dark:text-gray-700 leading-none select-none -mb-3">"</p>

        <!-- Text -->
        <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
          {{ blockGs(blk, 'text') || '' }}
        </p>

        <!-- Author -->
        <div class="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            :style="{ backgroundColor: primaryColor }"
          >
            {{ getInitials(blockGs(blk, 'author') || 'A') }}
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ blockGs(blk, 'author') || 'Anónimo' }}</p>
            <p class="text-xs text-gray-400">Cliente verificado</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
