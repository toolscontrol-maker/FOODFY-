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

const bgColor = computed(() => gs('bg_color') || props.primaryColor)
const textColor = computed(() => gs('text_color') || '#ffffff')
const heading = computed(() => gs('heading') || '¿Listo para pedir?')
const subtext = computed(() => gs('subtext') || 'Entrega rápida directamente a tu puerta.')
const ctaText = computed(() => gs('cta_text') || 'Ver el menú')
const style = computed(() => gs('style') || 'filled')
</script>

<template>
  <div
    :class="isMobile ? 'px-5 py-12' : 'px-10 py-14'"
    class="relative overflow-hidden"
    :style="{ backgroundColor: style !== 'outline' ? bgColor : '#ffffff' }"
  >
    <!-- Decorative blobs -->
    <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 pointer-events-none" :style="{ backgroundColor: textColor }" />
    <div class="absolute -bottom-16 -left-8 w-48 h-48 rounded-full opacity-10 pointer-events-none" :style="{ backgroundColor: textColor }" />

    <div
      class="relative z-10 flex items-center gap-8"
      :class="isMobile ? 'flex-col text-center' : 'justify-between'"
    >
      <div>
        <h2
          class="font-bold leading-tight"
          :class="isMobile ? 'text-2xl' : 'text-3xl'"
          :style="{ color: style !== 'outline' ? textColor : bgColor }"
        >
          {{ heading }}
        </h2>
        <p
          v-if="subtext"
          class="text-sm mt-2 opacity-75"
          :style="{ color: style !== 'outline' ? textColor : bgColor }"
        >
          {{ subtext }}
        </p>
      </div>

      <ThemeCtaButton
        v-if="ctaText"
        :variant="style === 'outline' ? 'primary' : 'secondary'"
        :primary-color="style === 'outline' ? bgColor : undefined"
        size="lg"
        class="flex-shrink-0"
      >
        {{ ctaText }}
        <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
      </ThemeCtaButton>
    </div>
  </div>
</template>
