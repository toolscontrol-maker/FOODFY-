<script setup lang="ts">
import { computed } from 'vue'
import type { FeatureItem } from './ThemeFeatureRow.vue'

const props = defineProps<{
  heading?: string
  eyebrow?: string
  body?: string
  layout?: 'centered' | 'left-aligned' | 'split'
  textColor?: string
  bgImage?: string
  overlayOpacity?: number
  features?: FeatureItem[]
  ctaText?: string
  ctaUrl?: string
  maxWidth?: 'narrow' | 'medium' | 'wide'
  primaryColor?: string
  isMobile?: boolean
}>()

const alignClass = computed(() => {
  if (props.layout === 'left-aligned') return 'text-left items-start'
  return 'text-center items-center'
})

const maxWidthStyle = computed(() => {
  switch (props.maxWidth) {
    case 'narrow': return { maxWidth: '720px' }
    case 'wide':   return { maxWidth: '1200px' }
    default:       return { maxWidth: '860px' }
  }
})

const headingStyle = computed(() => ({
  color: props.textColor || 'inherit',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  fontWeight: '600',
}))
</script>

<template>
  <div
    class="relative w-full"
    :style="bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
  >
    <!-- Overlay -->
    <div
      v-if="bgImage && (overlayOpacity ?? 0) > 0"
      class="absolute inset-0"
      :style="{ backgroundColor: `rgba(0,0,0,${(overlayOpacity ?? 0) / 100})` }"
    />

    <div class="relative mx-auto px-6" :style="maxWidthStyle">
      <div class="flex flex-col gap-6" :class="alignClass">
        <!-- Eyebrow -->
        <p
          v-if="eyebrow"
          class="text-[11px] font-semibold uppercase tracking-[0.25em]"
          :style="{ color: textColor ? `${textColor}99` : 'currentColor', opacity: 0.65 }"
        >
          {{ eyebrow }}
        </p>

        <!-- Heading -->
        <h2
          v-if="heading"
          class="text-3xl md:text-4xl leading-tight"
          :style="headingStyle"
        >
          {{ heading }}
        </h2>

        <!-- Body -->
        <p
          v-if="body"
          class="text-base leading-relaxed font-light max-w-xl"
          :class="layout === 'centered' ? 'mx-auto' : ''"
          :style="{ color: textColor ? `${textColor}cc` : 'currentColor' }"
        >
          {{ body }}
        </p>

        <!-- CTA -->
        <a
          v-if="ctaText && ctaUrl"
          :href="ctaUrl"
          class="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-widest hover:opacity-70 transition-opacity"
          :style="{ color: primaryColor || textColor || 'inherit' }"
          @click.prevent
        >
          {{ ctaText }}
          <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
        </a>
      </div>

      <!-- Features row -->
      <div v-if="features && features.length" class="mt-12">
        <ThemeFeatureRow
          :features="features"
          :columns="isMobile ? '2' : '4'"
          :icon-color="primaryColor || '#c9a96e'"
          :text-color="textColor"
          :is-mobile="isMobile"
        />
      </div>
    </div>
  </div>
</template>
