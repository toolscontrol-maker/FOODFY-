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
const heading = computed(() => gs('heading') || 'Nuestra historia')
const content = computed(() => gs('content') || '')
const imageUrl = computed(() => gs('image') || '')
const imagePosition = computed(() => gs('image_position') || 'left')
const ctaText = computed(() => gs('cta_text') || '')
const aspectRatio = computed(() => {
  const r = gs('aspect_ratio') || '1:1'
  if (r === '16:9') return 'aspect-video'
  if (r === '4:3') return 'aspect-[4/3]'
  return 'aspect-square'
})
</script>

<template>
  <div
    :class="isMobile ? 'flex flex-col' : 'grid grid-cols-2'"
    :style="{ backgroundColor: bgColor }"
  >
    <!-- Image -->
    <div
      :class="[
        aspectRatio,
        isMobile ? 'order-1 w-full' : imagePosition === 'right' ? 'order-2' : 'order-1',
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800'
      ]"
    >
      <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-cover" alt="" />
      <ThemePlaceholderImage v-else variant="food" class="w-full h-full" />
    </div>

    <!-- Text -->
    <div
      :class="[
        isMobile ? 'order-2 px-5 py-8' : 'px-10 py-12',
        !isMobile && imagePosition === 'right' ? 'order-1' : 'order-2',
        'flex flex-col justify-center gap-4'
      ]"
    >
      <h2
        :class="isMobile ? 'text-xl' : 'text-2xl'"
        class="font-bold text-gray-900 dark:text-white leading-tight"
      >
        {{ heading }}
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ content }}</p>
      <ThemeCtaButton
        v-if="ctaText"
        :primary-color="primaryColor"
        variant="outline"
        size="md"
        class="self-start mt-2"
      >
        {{ ctaText }}
      </ThemeCtaButton>
    </div>
  </div>
</template>
