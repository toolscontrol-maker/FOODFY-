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

const bgColor = computed(() => gs('bg_color') || '#000000')
const heading = computed(() => gs('heading') || '')
const isDark = computed(() => {
  const c = bgColor.value
  if (!c.startsWith('#')) return true
  const r = parseInt(c.slice(1, 3), 16)
  const g = parseInt(c.slice(3, 5), 16)
  const b = parseInt(c.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
})
</script>

<template>
  <div :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'" :style="{ backgroundColor: bgColor }">
    <h2
      v-if="heading"
      class="font-bold mb-6"
      :class="[isMobile ? 'text-xl' : 'text-2xl', isDark ? 'text-white' : 'text-gray-900 dark:text-white']"
    >
      {{ heading }}
    </h2>

    <div
      class="aspect-video rounded-2xl overflow-hidden relative flex items-center justify-center max-w-4xl mx-auto"
      style="background: rgba(255,255,255,0.06)"
    >
      <!-- Thumbnail placeholder -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />

      <!-- Fake waveform decoration -->
      <div class="absolute bottom-0 inset-x-0 h-16 flex items-end justify-center gap-0.5 px-8 pb-4 opacity-20">
        <div
          v-for="i in 40"
          :key="i"
          class="w-1 bg-white rounded-full"
          :style="{ height: `${Math.sin(i * 0.5) * 20 + 24}px` }"
        />
      </div>

      <!-- Play button -->
      <button
        class="relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-2xl"
        :style="{ backgroundColor: primaryColor }"
      >
        <UIcon name="i-lucide-play" class="w-7 h-7 text-white ml-1" />
      </button>
    </div>
  </div>
</template>
