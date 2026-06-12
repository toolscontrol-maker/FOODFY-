<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeSection } from '~/stores/useOnlineStoreStore'
import { useThemePreviewData } from '~/composables/useThemePreviewData'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const { getSetting } = useThemePreviewData()
const gs = (key: string) => getSetting(props.sec, key)

const bgColor = computed(() => gs('bg_color') || 'var(--theme-bg, #ffffff)')
const textColor = computed(() => gs('text_color') || 'var(--theme-text, #374151)')
const heading = computed(() => gs('heading') || '')
const content = computed(() => gs('content') || '')
const alignment = computed(() => gs('alignment') || 'center')
const maxWidth = computed(() => {
  const w = gs('max_width') || 'md'
  if (w === 'sm') return 'max-w-lg'
  if (w === 'lg') return 'max-w-4xl'
  if (w === 'full') return 'max-w-full'
  return 'max-w-2xl'
})
</script>

<template>
  <div
    :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'"
    :style="{ backgroundColor: bgColor, textAlign: alignment }"
  >
    <div
      class="mx-auto"
      :class="maxWidth"
    >
      <div
        v-if="heading"
        class="w-10 h-1 rounded-full mb-6"
        :class="alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : ''"
        :style="{ backgroundColor: primaryColor }"
      />
      <h3
        v-if="heading"
        class="font-bold text-gray-900 dark:text-white mb-4 leading-tight"
        :class="isMobile ? 'text-xl' : 'text-2xl'"
      >
        {{ heading }}
      </h3>
      <p
        class="leading-relaxed text-sm"
        :style="{ color: textColor }"
      >
        {{ content }}
      </p>
    </div>
  </div>
</template>
