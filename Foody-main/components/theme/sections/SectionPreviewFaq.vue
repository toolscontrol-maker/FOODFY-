<script setup lang="ts">
import { computed, ref } from 'vue'
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
const title = computed(() => gs('title') || 'Preguntas frecuentes')
const visibleBlocks = computed(() => props.sec.blocks.filter(b => !b.hidden))

const openId = ref<string | null>(null)
const toggle = (id: string) => {
  openId.value = openId.value === id ? null : id
}

const blockGs = (blk: any, key: string) => blk.settings.find((s: any) => s.key === key)?.value ?? null

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'" :style="{ backgroundColor: bgColor }">
    <ThemeSectionHeader v-if="title" :title="title" centered />

    <div class="max-w-2xl mx-auto space-y-3">
      <div
        v-for="blk in visibleBlocks"
        :key="blk.id"
        class="border rounded-2xl overflow-hidden transition-all"
        :class="store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id
          ? 'ring-2 ring-primary-500 border-primary-300'
          : 'border-gray-200 dark:border-gray-800'"
        @click.stop="selectBlock(blk.id)"
      >
        <!-- Question row -->
        <button
          class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          @click.stop="toggle(blk.id)"
        >
          <span class="text-sm font-semibold text-gray-900 dark:text-white pr-4">
            {{ blockGs(blk, 'question') || 'Pregunta' }}
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200"
            :class="openId === blk.id ? 'rotate-180' : ''"
          />
        </button>

        <!-- Answer -->
        <div v-if="openId === blk.id" class="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
          {{ blockGs(blk, 'answer') || 'Respuesta' }}
        </div>
      </div>
    </div>
  </div>
</template>
