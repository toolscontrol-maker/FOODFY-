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

const bgColor = computed(() => gs('bg_color') || 'var(--theme-bg, #f9fafb)')
const textColor = computed(() => gs('text_color') || 'var(--theme-text, #111827)')
const heading = computed(() => gs('heading') || 'Comida fresca cada día')
const subheading = computed(() => gs('subheading') || 'Ingredientes de primera calidad')
const imageUrl = computed(() => gs('image') || '')
const imagePosition = computed(() => gs('image_position') || 'right')
const ctaText = computed(() => gs('cta_text') || 'Pedir ahora')
</script>

<template>
  <div
    :class="isMobile ? 'flex flex-col' : 'grid grid-cols-2'"
    :style="{ backgroundColor: bgColor, minHeight: isMobile ? 'auto' : '420px' }"
  >
    <!-- Text side -->
    <div
      :class="[
        isMobile ? 'order-2 px-5 py-10' : 'px-10 py-12',
        !isMobile && imagePosition === 'left' ? 'order-2' : 'order-1',
        'flex flex-col justify-center gap-5'
      ]"
    >
      <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">Descúbrenos</p>
      <h2
        :class="isMobile ? 'text-2xl' : 'text-3xl'"
        class="font-bold leading-tight"
        :style="{ color: textColor }"
      >
        {{ heading }}
      </h2>
      <p class="text-sm leading-relaxed opacity-70" :style="{ color: textColor }">{{ subheading }}</p>
      <ThemeCtaButton v-if="ctaText" :primary-color="primaryColor" size="md" class="self-start">
        {{ ctaText }}
      </ThemeCtaButton>
    </div>

    <!-- Image side -->
    <div
      :class="[
        isMobile ? 'order-1' : '',
        !isMobile && imagePosition === 'left' ? 'order-1' : 'order-2',
        isMobile ? 'aspect-[16/9]' : ''
      ]"
      class="relative overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center"
    >
      <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-cover" alt="" />
      <ThemePlaceholderImage v-else variant="food" class="w-full h-full" />
    </div>
  </div>
</template>
