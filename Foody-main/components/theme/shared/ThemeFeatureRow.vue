<script setup lang="ts">
import { computed } from 'vue'
import { THEME_ICON_MAP } from '~/composables/useThemePreviewData'

export interface FeatureItem {
  id: string
  icon: string
  title: string
  description: string
}

const props = defineProps<{
  features: FeatureItem[]
  columns?: '2' | '3' | '4'
  iconColor?: string
  textColor?: string
  isMobile?: boolean
  gap?: string
}>()

const colClass = computed(() => {
  if (props.isMobile) return 'grid-cols-1'
  switch (props.columns) {
    case '2': return 'grid-cols-2'
    case '3': return 'grid-cols-3'
    case '4':
    default:  return 'sm:grid-cols-2 lg:grid-cols-4'
  }
})

const resolveIcon = (key: string) => THEME_ICON_MAP[key] || `i-lucide-${key}` || 'i-lucide-check-circle'
</script>

<template>
  <div v-if="features.length" class="grid" :class="colClass" :style="gap ? { gap } : { gap: '32px' }">
    <div v-for="feat in features" :key="feat.id" class="flex flex-col gap-2">
      <UIcon
        :name="resolveIcon(feat.icon)"
        class="w-5 h-5 flex-shrink-0"
        :style="{ color: iconColor || '#c9a96e' }"
      />
      <p
        class="text-[13px] font-semibold uppercase tracking-widest"
        :style="{ color: textColor || 'inherit' }"
      >
        {{ feat.title }}
      </p>
      <p class="text-[13px] leading-relaxed opacity-70" :style="{ color: textColor || 'inherit' }">
        {{ feat.description }}
      </p>
    </div>
  </div>
</template>
