<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeSection } from '~/stores/useOnlineStoreStore'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const gs = (key: string, fallback: any = null) =>
  props.sec.settings.find(s => s.key === key)?.value ?? fallback

const image           = computed(() => gs('image', ''))
const imageMobile     = computed(() => gs('image_mobile', ''))
const heading         = computed(() => gs('heading', ''))
const eyebrow         = computed(() => gs('eyebrow', ''))
const headingPosition = computed(() => gs('heading_position', 'bottom-left'))
const textColor       = computed(() => gs('text_color', '#ffffff'))
const showCta         = computed(() => gs('show_cta', false))
const ctaText         = computed(() => gs('cta_text', ''))
const ctaUrl          = computed(() => gs('cta_url', '#'))
const height          = computed(() => gs('height', 'full'))
const overlayStart    = computed(() => gs('overlay_start', 20))

const activeSrc = computed(() => (props.isMobile && imageMobile.value) ? imageMobile.value : image.value)

const heightStyle = computed(() => {
  switch (height.value) {
    case 'large':  return { height: '80vh', minHeight: '480px' }
    case 'medium': return { height: '60vh', minHeight: '360px' }
    default:       return { height: props.isMobile ? '80vh' : '100vh', minHeight: '480px' }
  }
})

const textPositionClass = computed(() => {
  if (props.isMobile || headingPosition.value === 'bottom-left') return 'items-end justify-start'
  if (headingPosition.value === 'center') return 'items-center justify-center'
  if (headingPosition.value === 'bottom-right') return 'items-end justify-end'
  return 'items-end justify-start'
})

const isDrop = computed(() => headingPosition.value === 'center')

const gradientStyle = computed(() => ({
  background: `linear-gradient(to top, rgba(0,0,0,0.${Math.round(overlayStart.value * 0.9)}) 0%, transparent 60%)`,
}))

const fallbackBg = computed(() =>
  isDrop.value
    ? 'linear-gradient(to bottom, #1a1209 0%, #3a2e24 100%)'
    : 'radial-gradient(circle at 30% 20%, #3a2e24, #1a1209 70%)'
)

const textPadding = computed(() => {
  if (props.isMobile) return { padding: '24px' }
  return headingPosition.value === 'center'
    ? { padding: '40px' }
    : { paddingBottom: '40px', paddingLeft: '40px', paddingRight: '40px', paddingTop: '40px' }
})
</script>

<template>
  <div class="relative w-full overflow-hidden" :style="heightStyle">
    <!-- Image -->
    <div class="absolute inset-0">
      <img
        v-if="activeSrc"
        :src="activeSrc"
        alt=""
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full" :style="{ background: fallbackBg, minHeight: '70vh' }" />
    </div>

    <!-- Bottom gradient -->
    <div class="absolute inset-0 pointer-events-none" :style="gradientStyle" />

    <!-- Text overlay -->
    <div
      v-if="heading || eyebrow || (showCta && ctaText)"
      class="absolute inset-0 flex"
      :class="textPositionClass"
      :style="textPadding"
    >
      <div
        class="flex flex-col gap-2"
        :style="{ maxWidth: '600px' }"
        :class="headingPosition === 'center' ? 'items-center text-center' : 'items-start text-left'"
      >
        <p
          v-if="eyebrow"
          class="text-[11px] font-semibold uppercase tracking-[0.25em]"
          :style="{ color: textColor, opacity: 0.8 }"
        >
          {{ eyebrow }}
        </p>
        <h1
          v-if="heading"
          class="leading-none"
          :class="[
            isMobile ? 'text-3xl' : isDrop ? 'text-7xl' : 'text-5xl',
            isDrop ? 'font-black' : 'font-bold',
          ]"
          :style="{ color: textColor, textTransform: 'uppercase', letterSpacing: isDrop ? '0.02em' : '0.06em' }"
        >
          {{ heading }}
        </h1>
        <a
          v-if="showCta && ctaText"
          :href="ctaUrl"
          class="mt-4 inline-flex items-center gap-2 px-8 py-3.5 text-[13px] font-semibold uppercase tracking-widest transition-opacity hover:opacity-85"
          :style="{ backgroundColor: textColor, color: '#000000' }"
          @click.prevent
        >
          {{ ctaText }}
        </a>
      </div>
    </div>
  </div>
</template>
