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

const bgColor = computed(() => gs('bg_color') || '#fef3c7')
const textColor = computed(() => gs('text_color') || '#92400e')
const heading = computed(() => gs('heading') || '¡Oferta especial!')
const subheading = computed(() => gs('subheading') || '20% de descuento en tu primer pedido')
const ctaText = computed(() => gs('cta_text') || '')
</script>

<template>
  <div
    :class="isMobile ? 'px-5 py-6' : 'px-10 py-8'"
    :style="{ backgroundColor: bgColor }"
  >
    <div
      class="flex gap-4 items-center"
      :class="isMobile ? 'flex-col text-center' : 'flex-row justify-between'"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: textColor + '18' }"
        >
          <UIcon name="i-lucide-badge-percent" class="w-6 h-6" :style="{ color: textColor }" />
        </div>
        <div>
          <p class="font-bold text-sm leading-tight" :style="{ color: textColor }">{{ heading }}</p>
          <p class="text-xs opacity-75 mt-0.5" :style="{ color: textColor }">{{ subheading }}</p>
        </div>
      </div>

      <div v-if="ctaText">
        <span
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border-2"
          :style="{ borderColor: textColor, color: textColor }"
        >
          <UIcon name="i-lucide-tag" class="w-3.5 h-3.5" />
          {{ ctaText }}
        </span>
      </div>
    </div>
  </div>
</template>
