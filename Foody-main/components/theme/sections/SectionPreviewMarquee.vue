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

const bgColor = computed(() => gs('bg_color') || '#111827')
const textColor = computed(() => gs('text_color') || '#ffffff')
const text = computed(() => gs('text') || '🔥 Envío gratis en pedidos superiores a 25€')
const animated = computed(() => gs('animated') === true)
const dismissible = computed(() => gs('dismissible') !== false)
</script>

<template>
  <div
    class="relative flex items-center overflow-hidden"
    :style="{ backgroundColor: bgColor, color: textColor, height: '40px' }"
  >
    <!-- Animated marquee or static -->
    <div
      v-if="animated"
      class="flex items-center gap-12 animate-marquee whitespace-nowrap px-4"
      style="animation: marquee 18s linear infinite"
    >
      <span v-for="i in 4" :key="i" class="text-[12px] font-medium flex items-center gap-2">
        {{ text }}
        <span class="text-xs opacity-40 mx-2">·</span>
      </span>
    </div>
    <div v-else class="flex-1 flex items-center justify-center gap-2 px-4">
      <span class="text-[12px] font-medium text-center">{{ text }}</span>
    </div>

    <!-- Dismiss button -->
    <button
      v-if="dismissible"
      class="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
      :style="{ color: textColor }"
    >
      <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
    </button>

  </div>
</template>

<style scoped>
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 18s linear infinite;
}
</style>
