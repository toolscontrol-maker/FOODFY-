<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeSection } from '~/stores/useOnlineStoreStore'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const gs = (key: string) => props.sec.settings.find(s => s.key === key)?.value ?? null

const bgColor = computed(() => gs('bg_color') || '#1a1a2e')
const textColor = computed(() => gs('text_color') || '#ffffff')
const bgImage = computed(() => gs('bg_image') || '')
const overlayOpacity = computed(() => Number(gs('overlay_opacity') ?? 40) / 100)
const height = computed(() => Number(gs('height') ?? 500))
const alignment = computed(() => gs('alignment') || 'center')
const heading = computed(() => gs('heading') || '¡Bienvenidos!')
const subheading = computed(() => gs('subheading') || '')
const ctaText = computed(() => gs('cta_text') || '')
const ctaUrl = computed(() => gs('cta_url') || '#')

const containerAlign = computed(() => {
  if (alignment.value === 'left') return 'items-start text-left'
  if (alignment.value === 'right') return 'items-end text-right'
  return 'items-center text-center'
})

const headingSize = computed(() => {
  if (props.isMobile) return 'text-3xl'
  return height.value >= 500 ? 'text-5xl' : 'text-4xl'
})
</script>

<template>
  <div
    class="relative flex items-center overflow-hidden"
    :class="alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center'"
    :style="{
      backgroundColor: bgColor,
      minHeight: `${isMobile ? Math.min(height, 380) : height}px`,
    }"
  >
    <!-- Background image -->
    <img
      v-if="bgImage"
      :src="bgImage"
      class="absolute inset-0 w-full h-full object-cover"
      alt=""
    />
    <!-- Overlay -->
    <div
      v-if="bgImage"
      class="absolute inset-0"
      :style="{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }"
    />

    <!-- Grain texture (subtle, always) -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E&quot;)" />

    <!-- Content -->
    <div
      class="relative z-10 flex flex-col gap-5"
      :class="[containerAlign, isMobile ? 'px-6 py-12 w-full max-w-full' : 'px-12 max-w-3xl w-full']"
    >
      <h1
        class="font-bold leading-tight"
        :class="headingSize"
        :style="{ color: textColor }"
      >
        {{ heading }}
      </h1>
      <p
        v-if="subheading"
        class="leading-relaxed"
        :class="isMobile ? 'text-base' : 'text-xl'"
        :style="{ color: textColor, opacity: 0.85 }"
      >
        {{ subheading }}
      </p>
      <ThemeCtaButton
        v-if="ctaText"
        :primary-color="primaryColor"
        :size="isMobile ? 'md' : 'lg'"
        class="mt-1"
        :style="{ borderRadius: 'var(--theme-btn-radius, 12px)' }"
      >
        {{ ctaText }}
      </ThemeCtaButton>
    </div>
  </div>
</template>
