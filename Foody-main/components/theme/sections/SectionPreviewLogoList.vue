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

const bgColor = computed(() => gs('bg_color') || 'var(--theme-bg, #ffffff)')
const title = computed(() => gs('title') || 'Confían en nosotros')
const grayscale = computed(() => gs('grayscale') !== false)
const visibleBlocks = computed(() => props.sec.blocks.filter(b => !b.hidden))

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div :class="isMobile ? 'px-5 py-8' : 'px-10 py-10'" :style="{ backgroundColor: bgColor }">
    <p v-if="title" class="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-6">
      {{ title }}
    </p>

    <div
      class="flex items-center justify-center gap-6 flex-wrap"
      :class="isMobile ? 'gap-4' : 'gap-10'"
    >
      <div
        v-for="blk in visibleBlocks"
        :key="blk.id"
        class="group relative transition-all cursor-pointer"
        :class="store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id
          ? 'ring-2 ring-primary-400 rounded-xl'
          : ''"
        @click.stop="selectBlock(blk.id)"
      >
        <div
          class="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center transition-all"
          :class="grayscale ? 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100' : 'hover:shadow-md'"
        >
          <img
            v-if="blk.settings.find((s: any) => s.key === 'image')?.value"
            :src="blk.settings.find((s: any) => s.key === 'image')?.value"
            class="h-7 object-contain max-w-[100px]"
            :alt="blk.settings.find((s: any) => s.key === 'name')?.value"
          />
          <span v-else class="text-sm font-semibold text-gray-400">
            {{ blk.settings.find((s: any) => s.key === 'name')?.value || 'Logo' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
