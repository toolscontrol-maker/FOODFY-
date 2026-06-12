<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeSection } from '~/stores/useOnlineStoreStore'
import { useThemePreviewData } from '~/composables/useThemePreviewData'
import { getProductPrice, getProductCoverImage } from '~/types/commerce'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const { resolveCollectionProducts, formatPrice } = useThemePreviewData()

const gs = (key: string, fallback: any = null) =>
  props.sec.settings.find(s => s.key === key)?.value ?? fallback

const title       = computed(() => gs('title', ''))
const titleStyle  = computed(() => gs('title_style', 'uppercase'))
const subtitle    = computed(() => gs('subtitle', ''))
const columns     = computed(() => Number(gs('columns', 3)))
const imageRatio  = computed(() => gs('image_ratio', 'portrait') as 'square' | 'portrait' | 'landscape')
const showPrice   = computed(() => gs('show_price', true))
const showName    = computed(() => gs('show_name', true))
const gap         = computed(() => gs('gap', 'small'))
const hoverEffect = computed(() => gs('hover_effect', 'zoom') as 'zoom' | 'swap' | 'none')
const isEditorial  = computed(() => hoverEffect.value === 'zoom')
const namePos     = computed(() => gs('name_position', 'below'))
const bgColor     = computed(() => gs('bg_color', 'var(--theme-bg, #fafaf8)'))
const maxProducts = computed(() => Number(gs('max_products', 6)))
const ctaText     = computed(() => gs('cta_text', ''))
const ctaUrl      = computed(() => gs('cta_url', '#'))
const collectionId = computed(() => gs('collectionId', ''))

const allProducts = computed(() => resolveCollectionProducts(collectionId.value))
const products    = computed(() => allProducts.value.slice(0, maxProducts.value))

const gapPx = computed(() => {
  if (gap.value === 'seamless') return '8px'
  if (gap.value === 'medium') return '24px'
  return '16px'
})

const colsClass = computed(() => {
  if (props.isMobile) return 'grid-cols-1'
  switch (columns.value) {
    case 2: return 'grid-cols-2'
    case 4: return 'grid-cols-2 md:grid-cols-4'
    default: return 'grid-cols-2 md:grid-cols-3'
  }
})

const PLACEHOLDERS = 6
</script>

<template>
  <div :style="{ backgroundColor: bgColor, paddingBottom: isMobile ? '48px' : '96px' }">
    <!-- Section header -->
    <div v-if="title || subtitle" class="px-6 md:px-10 pt-20 pb-0" style="margin-bottom: 32px">
      <p
        v-if="title"
        class="text-2xl md:text-3xl font-semibold tracking-widest"
        :style="{
          textTransform: titleStyle === 'uppercase' ? 'uppercase' : 'none',
          color: bgColor === '#fafaf8' || bgColor === '#ffffff' ? '#1a1209' : '#fafaf8'
        }"
      >
        {{ title }}
      </p>
      <p v-if="subtitle" class="mt-2 text-sm opacity-60">{{ subtitle }}</p>
    </div>

    <!-- Product grid -->
    <div
      class="grid"
      :class="colsClass"
      :style="{ gap: gapPx, padding: title ? '0' : '0' }"
    >
      <template v-if="products.length">
        <div
          v-for="product in products"
          :key="product.id"
          class="group relative overflow-hidden"
          :style="isEditorial ? { maxWidth: '420px', margin: '0 auto', width: '100%' } : {}"
        >
          <!-- Image -->
          <ThemeProductImage
            :src="getProductCoverImage(product)"
            :ratio="imageRatio"
            :hover-mode="hoverEffect"
          />

          <!-- Overlay name -->
          <div
            v-if="namePos === 'overlay'"
            class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50 to-transparent"
          >
            <p
              class="text-white text-[13px] font-medium leading-tight"
              :style="{ textTransform: titleStyle === 'uppercase' ? 'uppercase' : 'none', letterSpacing: '0.08em' }"
            >
              {{ product.name }}
            </p>
            <p v-if="showPrice" class="text-white/80 text-[12px] mt-0.5">
              {{ formatPrice(getProductPrice(product)) }}
            </p>
          </div>

          <!-- Below name -->
          <div v-if="namePos === 'below'" class="pt-3 pb-1 px-1">
            <p
              v-if="showName"
              class="text-[13px] font-medium leading-tight line-clamp-1"
              :style="{
                textTransform: titleStyle === 'uppercase' ? 'uppercase' : 'none',
                letterSpacing: titleStyle === 'uppercase' ? '0.10em' : '0',
              }"
            >
              {{ product.name }}
            </p>
            <p v-if="showPrice" class="text-[13px] font-bold mt-1">
              {{ formatPrice(getProductPrice(product)) }}
            </p>
          </div>
        </div>
      </template>

      <!-- Empty state placeholders -->
      <template v-else>
        <div
          v-for="i in PLACEHOLDERS"
          :key="i"
          class="overflow-hidden"
          :style="isEditorial ? { maxWidth: '420px', margin: '0 auto', width: '100%' } : {}"
        >
          <ThemeProductImage :ratio="imageRatio" hover-mode="none" />
          <div v-if="namePos === 'below'" class="pt-3 pb-1 px-1">
            <div class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div class="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2" />
          </div>
        </div>
      </template>
    </div>

    <!-- CTA -->
    <div v-if="ctaText" class="flex justify-center py-10">
      <a
        :href="ctaUrl"
        class="inline-flex items-center gap-2 px-8 py-3.5 text-[13px] font-semibold uppercase tracking-widest border transition-opacity hover:opacity-70"
        :style="{ borderColor: '#1a1209', color: '#1a1209' }"
        @click.prevent
      >
        {{ ctaText }}
        <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
      </a>
    </div>
  </div>
</template>
