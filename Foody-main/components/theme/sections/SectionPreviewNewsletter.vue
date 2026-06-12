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

const bgColor = computed(() => gs('bg_color') || 'var(--theme-bg, #f3f4f6)')
const textColor = computed(() => gs('text_color') || 'var(--theme-text, #111827)')
const heading = computed(() => gs('heading') || '¿No te lo quieres perder?')
const subheading = computed(() => gs('subheading') || 'Suscríbete y recibe ofertas exclusivas y novedades.')
const placeholder = computed(() => gs('placeholder') || 'Tu email')
const buttonText = computed(() => gs('button_text') || 'Suscribirme')

const isDark = computed(() => {
  const c = bgColor.value
  if (!c.startsWith('#')) return false
  const r = parseInt(c.slice(1, 3), 16)
  const g = parseInt(c.slice(3, 5), 16)
  const b = parseInt(c.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
})
</script>

<template>
  <div
    :class="isMobile ? 'px-5 py-12' : 'px-10 py-16'"
    class="relative overflow-hidden"
    :style="{ backgroundColor: bgColor, color: textColor }"
  >
    <!-- Subtle pattern dots -->
    <div
      class="absolute inset-0 opacity-[0.04] pointer-events-none"
      :style="{
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }"
    />

    <div class="relative z-10 max-w-2xl mx-auto text-center">
      <div class="flex justify-center mb-5">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center"
          :style="{ backgroundColor: primaryColor + '20' }"
        >
          <UIcon name="i-lucide-mail" class="w-7 h-7" :style="{ color: primaryColor }" />
        </div>
      </div>

      <h2 :class="isMobile ? 'text-2xl' : 'text-3xl'" class="font-bold mb-3">
        {{ heading }}
      </h2>
      <p class="text-sm leading-relaxed mb-8" :class="isDark ? 'opacity-70' : 'text-gray-500'">
        {{ subheading }}
      </p>

      <!-- Input row -->
      <div
        class="flex rounded-2xl overflow-hidden border shadow-sm mx-auto"
        :class="isMobile ? 'flex-col gap-2 max-w-full' : 'flex-row max-w-md'"
        :style="{ borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e5e7eb' }"
      >
        <div
          class="flex-1 flex items-center px-4 h-12 bg-white dark:bg-gray-900"
          :class="isMobile ? 'rounded-xl border border-gray-200 dark:border-gray-700' : 'rounded-l-2xl'"
        >
          <UIcon name="i-lucide-at-sign" class="w-4 h-4 text-gray-300 mr-2 flex-shrink-0" />
          <span class="text-sm text-gray-400 select-none">{{ placeholder }}</span>
        </div>
        <button
          class="h-12 px-6 font-bold text-sm text-white flex-shrink-0 transition-opacity hover:opacity-90"
          :class="isMobile ? 'rounded-xl' : 'rounded-r-2xl'"
          :style="{ backgroundColor: primaryColor }"
        >
          {{ buttonText }}
        </button>
      </div>

      <p class="text-xs mt-4 opacity-50">Sin spam. Cancela cuando quieras.</p>
    </div>
  </div>
</template>
