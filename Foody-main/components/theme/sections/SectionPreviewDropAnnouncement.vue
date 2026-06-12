<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ThemeSection } from '~/stores/useOnlineStoreStore'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const dismissed = ref(false)

const gs = (key: string, fallback: any = null) =>
  props.sec.settings.find(s => s.key === key)?.value ?? fallback

const badgeText    = computed(() => gs('badge_text', 'NUEVO DROP'))
const showBadge    = computed(() => gs('show_badge', true))
const badgeAnimate = computed(() => gs('badge_animate', true))
const heading      = computed(() => gs('heading', 'Nueva colección disponible ahora'))
const tagline      = computed(() => gs('tagline', ''))
const ctaText      = computed(() => gs('cta_text', 'Ver colección'))
const ctaUrl       = computed(() => gs('cta_url', '#'))
const bgColor      = computed(() => gs('bg_color', '#0f0f0f'))
const textColor    = computed(() => gs('text_color', '#ffffff'))
const dismissible  = computed(() => gs('dismissible', false))
const height       = computed(() => gs('height', 'compact'))

const barHeight = computed(() => {
  switch (height.value) {
    case 'medium': return '72px'
    case 'tall':   return '200px'
    default:       return '44px'
  }
})
</script>

<template>
  <div
    v-if="!dismissed"
    class="w-full flex items-center justify-center relative overflow-hidden"
    :style="{ backgroundColor: bgColor, color: textColor, minHeight: barHeight }"
  >
    <div
      class="flex items-center gap-3 px-4 w-full"
      :class="height === 'tall' ? 'flex-col justify-center py-10' : 'justify-center'"
    >
      <!-- Badge -->
      <ThemeAnnouncementBadge
        v-if="showBadge && badgeText"
        :text="badgeText"
        :animate="badgeAnimate"
        color="#22c55e"
        text-color="#ffffff"
      />

      <!-- Heading -->
      <span
        class="font-semibold"
        :class="height === 'tall' ? 'text-xl text-center' : (isMobile ? 'text-[13px]' : 'text-[13px]')"
        :style="{ color: textColor }"
      >
        {{ heading }}
      </span>

      <!-- Tagline (medium/tall only) -->
      <span
        v-if="tagline && height !== 'compact'"
        class="text-[12px] opacity-70"
        :style="{ color: textColor }"
      >
        {{ tagline }}
      </span>

      <!-- CTA -->
      <a
        v-if="ctaText"
        :href="ctaUrl"
        class="text-[12px] font-semibold uppercase tracking-widest underline hover:opacity-70 transition-opacity flex-shrink-0"
        :style="{ color: textColor }"
        @click.prevent
      >
        {{ ctaText }}
      </a>
    </div>

    <!-- Dismiss -->
    <button
      v-if="dismissible"
      class="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
      :style="{ color: textColor }"
      @click="dismissed = true"
    >
      <UIcon name="i-lucide-x" class="w-4 h-4" />
    </button>
  </div>
</template>
