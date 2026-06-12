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

const bgColor = computed(() => gs('bg_color') || '#111827')
const textColor = computed(() => gs('text_color') || '#ffffff')
const visibleBlocks = computed(() => props.sec.blocks.filter(b => !b.hidden))

const blockGs = (blk: any, key: string) => blk.settings.find((s: any) => s.key === key)?.value ?? null

const isDark = computed(() => {
  const c = bgColor.value
  if (!c.startsWith('#')) return true
  const r = parseInt(c.slice(1, 3), 16)
  const g = parseInt(c.slice(3, 5), 16)
  const b = parseInt(c.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
})

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div
    :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'"
    :style="{ backgroundColor: bgColor }"
  >
    <div
      class="grid gap-8"
      :class="isMobile ? 'grid-cols-2' : visibleBlocks.length <= 3 ? `grid-cols-${visibleBlocks.length}` : 'grid-cols-4'"
    >
      <div
        v-for="blk in visibleBlocks"
        :key="blk.id"
        class="text-center transition-all cursor-pointer"
        :class="store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id
          ? 'ring-2 ring-primary-400 rounded-2xl p-2 -m-2'
          : ''"
        @click.stop="selectBlock(blk.id)"
      >
        <p
          class="font-extrabold leading-none"
          :class="isMobile ? 'text-3xl' : 'text-4xl'"
          :style="{ color: primaryColor }"
        >
          {{ blockGs(blk, 'value') || '—' }}
        </p>
        <p
          class="text-sm mt-2 font-medium"
          :class="isDark ? 'opacity-60' : 'text-gray-500'"
          :style="isDark ? { color: textColor } : {}"
        >
          {{ blockGs(blk, 'label') || '' }}
        </p>
      </div>
    </div>
  </div>
</template>
