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

const bgColor = computed(() => gs('bg_color') || 'var(--theme-bg, #f9fafb)')
const title = computed(() => gs('title') || '¿Cómo funciona?')
const subtitle = computed(() => gs('subtitle') || '')
const visibleBlocks = computed(() => props.sec.blocks.filter(b => !b.hidden))

const blockGs = (blk: any, key: string) => blk.settings.find((s: any) => s.key === key)?.value ?? null
const getIcon = (blk: any) => THEME_ICON_MAP[blockGs(blk, 'icon') || 'check'] || 'i-lucide-check-circle'

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'" :style="{ backgroundColor: bgColor }">
    <ThemeSectionHeader :title="title" :subtitle="subtitle" centered />

    <div
      class="grid gap-6"
      :class="isMobile ? 'grid-cols-1' : visibleBlocks.length === 3 ? 'grid-cols-3' : 'grid-cols-4'"
    >
      <div
        v-for="(blk, idx) in visibleBlocks"
        :key="blk.id"
        class="relative flex flex-col items-center text-center gap-4 p-6"
        :class="store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id
          ? 'ring-2 ring-primary-500 rounded-2xl bg-primary-50/30'
          : ''"
        @click.stop="selectBlock(blk.id)"
      >
        <!-- Connector line (not on last) -->
        <div
          v-if="!isMobile && idx < visibleBlocks.length - 1"
          class="absolute top-10 left-[calc(50%+2.5rem)] right-0 h-px border-t-2 border-dashed border-gray-200 dark:border-gray-700"
        />

        <!-- Step number circle -->
        <div
          class="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
          :style="{ backgroundColor: primaryColor + '18' }"
        >
          <UIcon :name="getIcon(blk)" class="w-7 h-7" :style="{ color: primaryColor }" />
          <div
            class="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
            :style="{ backgroundColor: primaryColor }"
          >
            {{ idx + 1 }}
          </div>
        </div>

        <div>
          <h3 class="font-bold text-sm text-gray-900 dark:text-white mb-1.5">
            {{ blockGs(blk, 'title') || `Paso ${idx + 1}` }}
          </h3>
          <p class="text-xs text-gray-500 leading-relaxed max-w-[180px] mx-auto">
            {{ blockGs(blk, 'description') || '' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
