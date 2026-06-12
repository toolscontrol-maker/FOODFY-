<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types/commerce'

const props = defineProps<{
  product?: Product | null
  image?: string
  alternateImage?: string
  name?: string
  price?: string
  compareAtPrice?: string
  badge?: string
  rankNumber?: number
  primaryColor?: string
  isMobile?: boolean
  isSelected?: boolean
  inspectorEnabled?: boolean
  variant?: 'default' | 'editorial' | 'drop'
  hoverMode?: 'zoom' | 'swap' | 'none'
  imageRatio?: 'square' | 'portrait' | 'landscape'
  globalHoverEffect?: string
}>()

const emit = defineEmits<{
  (e: 'add-to-cart'): void
  (e: 'click'): void
}>()

/* ── Image behaviour ── */
const effectiveHoverMode = computed(() => {
  if (props.hoverMode) return props.hoverMode
  /* editorial: imagen estática, el scale lo hace el card wrapper */
  if (props.variant === 'editorial') return 'none'
  if (props.variant === 'drop') return 'swap'
  return 'zoom'
})

const effectiveRatio = computed(() => {
  if (props.imageRatio) return props.imageRatio
  if (props.variant === 'drop') return 'portrait'
  return 'square'
})

/* ── Card wrapper ── */
const cardRadius = computed(() => {
  if (props.variant === 'editorial' || props.variant === 'drop') return '0px'
  return 'var(--theme-card-radius, 12px)'
})

/* ── Name ── */
const nameStyle = computed(() => {
  if (props.variant === 'editorial') {
    return {
      textTransform: 'uppercase' as const,
      letterSpacing: '0.10em',
      fontSize: '13px',
      fontWeight: '500',
      marginTop: '16px',
    }
  }
  if (props.variant === 'drop') {
    return { fontSize: '14px', fontWeight: '500' }
  }
  return {}
})

/* ── Price ── */
const priceStyle = computed(() => {
  if (props.variant === 'editorial') {
    return { fontSize: '12px', fontWeight: '400', color: 'inherit', marginTop: '4px' }
  }
  if (props.variant === 'drop') {
    return { fontSize: '14px', fontWeight: '700', color: props.primaryColor || 'var(--theme-primary, #e63946)' }
  }
  return { fontSize: '13px', fontWeight: '700', color: props.primaryColor || 'var(--theme-buttons, #e63946)' }
})

const infoStyle = computed(() => {
  if (props.variant === 'editorial') return { padding: '0 0 4px 0' }
  if (props.variant === 'drop') return { padding: '12px 12px 16px' }
  return { padding: '14px' }
})
</script>

<template>
  <div
    class="group/card overflow-hidden"
    :class="[
      /* inspector ring */
      isSelected && inspectorEnabled
        ? 'ring-2 ring-primary-500'
        : inspectorEnabled
          ? 'hover:ring-2 hover:ring-primary-200 hover:ring-inset'
          : '',
      /* bg: transparent for editorial (premium air), white for others */
      variant === 'editorial'
        ? 'bg-transparent'
        : variant === 'drop'
          ? 'bg-transparent'
          : 'bg-white dark:bg-gray-900',
      /* border & shadow per variant */
      variant === 'editorial' || variant === 'drop'
        ? 'border-0'
        : 'border border-gray-100 dark:border-gray-800',
      /* global hover effect from theme settings */
      globalHoverEffect === 'lift' && variant !== 'editorial'
        ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200'
        : globalHoverEffect === 'scale' && variant !== 'editorial'
          ? 'hover:scale-[1.03] transition-all duration-200'
          : globalHoverEffect === 'highlight' && variant !== 'editorial'
            ? 'hover:ring-2 hover:ring-primary-300 transition-all duration-200'
            : variant !== 'editorial' ? 'transition-all duration-200' : '',
      /* scale hover ONLY for editorial */
      variant === 'editorial'
        ? 'cursor-pointer'
        : '',
    ]"
    :style="{
      borderRadius: cardRadius,
      /* editorial: scale on hover via inline transition so it doesn't rely on Tailwind JIT */
      transition: variant === 'editorial' ? 'transform 400ms ease-out' : undefined,
    }"
    @mouseenter="variant === 'editorial' ? ($el as HTMLElement).style.transform = 'scale(1.03)' : undefined"
    @mouseleave="variant === 'editorial' ? ($el as HTMLElement).style.transform = 'scale(1)' : undefined"
    @click="emit('click')"
  >
    <!-- Image -->
    <div class="relative">
      <ThemeProductImage
        :src="image"
        :alternate-src="alternateImage"
        :alt="name"
        :ratio="effectiveRatio"
        :hover-mode="effectiveHoverMode"
      />

      <!-- Rank badge -->
      <div v-if="rankNumber" class="absolute top-2 left-2 w-7 h-7 rounded-full bg-gray-900/90 text-white text-[11px] font-bold flex items-center justify-center shadow">
        {{ rankNumber }}
      </div>

      <!-- Text badge (default only) -->
      <div v-else-if="badge && !variant" class="absolute top-2 left-2">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-900/90 text-white shadow">
          {{ badge }}
        </span>
      </div>

      <!-- Quick add: drop + default variants only -->
      <div
        v-if="variant !== 'editorial'"
        class="absolute inset-x-2 bottom-2 flex justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-200 translate-y-[10px] group-hover/card:translate-y-0"
        @click.stop="emit('add-to-cart')"
      >
        <button
          class="w-full py-2 text-white text-xs font-semibold text-center transition-opacity"
          :style="{
            backgroundColor: primaryColor || 'var(--theme-buttons, #e63946)',
            borderRadius: 'var(--theme-btn-radius, 12px)',
          }"
        >
          + Añadir al carrito
        </button>
      </div>
    </div>

    <!-- Info block -->
    <div :style="infoStyle">
      <p
        class="leading-tight line-clamp-1 text-gray-900 dark:text-white"
        :style="nameStyle"
      >
        {{ name || product?.name || 'Producto' }}
      </p>
      <div class="flex items-baseline gap-2 mt-1">
        <span v-if="price" :style="priceStyle">{{ price }}</span>
        <span v-if="compareAtPrice" class="text-[11px] text-gray-400 line-through">{{ compareAtPrice }}</span>
      </div>
    </div>
  </div>
</template>
