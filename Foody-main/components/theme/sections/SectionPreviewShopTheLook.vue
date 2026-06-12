<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeSection } from '~/stores/useOnlineStoreStore'
import { useThemePreviewData } from '~/composables/useThemePreviewData'
import { useCartStore } from '~/composables/useCartStore'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const { resolveProduct, formatPrice } = useThemePreviewData()
const cart = useCartStore()

const gs = (key: string, fallback: any = null) =>
  props.sec.settings.find(s => s.key === key)?.value ?? fallback

const heading        = computed(() => gs('heading', 'Shop The Look'))
const editorialImage = computed(() => gs('editorial_image', ''))
const imagePosition  = computed(() => gs('image_position', 'left'))
const bgColor        = computed(() => gs('bg_color', 'var(--theme-bg, #ffffff)'))
const showTotal      = computed(() => gs('show_total_price', false))
const addAllText     = computed(() => gs('cta_add_all_text', ''))
const imageRatio     = computed(() => gs('image_ratio', '4:5') as '4:5' | '3:4' | '1:1')

interface LookItem {
  id: string
  productId: string
  label: string
  showSizes: boolean
}

const lookItems = computed<LookItem[]>(() =>
  props.sec.blocks
    .filter(b => !b.hidden && b.type === 'look_item')
    .map(b => {
      const sv = (k: string) => b.settings.find(s => s.key === k)?.value ?? ''
      return {
        id: b.id,
        productId: sv('productId'),
        label: sv('label'),
        showSizes: b.settings.find(s => s.key === 'show_sizes')?.value ?? true,
      }
    })
)

const resolvedItems = computed(() =>
  lookItems.value.map(item => ({
    ...item,
    product: item.productId ? resolveProduct(item.productId) : null,
  }))
)

const hasImage = computed(() => !!editorialImage.value)

const imageOrderClass = computed(() =>
  imagePosition.value === 'right' ? 'order-last' : 'order-first'
)

const ratioClass = computed(() => {
  switch (imageRatio.value) {
    case '3:4': return 'aspect-[3/4]'
    case '1:1': return 'aspect-square'
    default:    return 'aspect-[4/5]'
  }
})

const onAddToCart = ({ productId, size }: { productId: string; size: string | null }) => {
  const product = resolveProduct(productId)
  if (!product) return
  const variant = product.variants.find(v => v.name === size) ?? product.variants[0]
  cart.addItem({
    productName: product.name,
    variantName: variant?.name ?? size ?? '',
    variantId: variant?.id,
    vendor: '',
    price: variant?.price ?? 0,
    compareAtPrice: variant?.compareAtPrice ?? null,
    image: '',
  })
}
</script>

<template>
  <div :style="{ backgroundColor: bgColor }">
    <div class="mx-auto px-6 md:px-10 py-16" style="max-width: 1280px;">
      <!-- Heading -->
      <h2
        v-if="heading"
        class="font-semibold mb-8"
        :class="isMobile ? 'text-xl' : 'text-2xl'"
        :style="{ textTransform: 'uppercase', letterSpacing: '0.12em' }"
      >
        {{ heading }}
      </h2>

      <!-- Body: image + products -->
      <div
        class="flex"
        :class="isMobile || !hasImage ? 'flex-col gap-6' : 'flex-row items-start gap-0'"
      >
        <!-- Editorial image -->
        <div
          v-if="hasImage"
          class="flex-shrink-0"
          :class="[isMobile ? 'w-full' : '', imageOrderClass, ratioClass]"
          :style="!isMobile ? { width: '55%' } : {}"
        >
          <img
            :src="editorialImage"
            alt="Shop the look"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Placeholder if no image -->
        <div
          v-else-if="!isMobile"
          class="flex-shrink-0"
          :class="ratioClass"
          style="width: 55%"
        >
          <ThemePlaceholderImage class="w-full h-full" variant="hero" />
        </div>

        <!-- Products stack -->
        <div
          class="min-w-0"
          :style="!isMobile && hasImage ? { width: '45%', paddingLeft: '40px' } : {}"
        >
          <template v-if="resolvedItems.length">
            <ThemeLookCard
              v-for="item in resolvedItems"
              :key="item.id"
              :product="item.product"
              :label="item.label || undefined"
              :show-sizes="item.showSizes"
              :primary-color="primaryColor"
              :format-price="formatPrice"
              @add-to-cart="onAddToCart"
            />
          </template>

          <!-- Empty state -->
          <template v-else>
            <div v-for="i in 2" :key="i" class="flex gap-3 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div class="w-16 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-sm animate-pulse" />
              <div class="flex-1 flex flex-col gap-2 pt-1">
                <div class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div class="h-3 w-14 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                <div class="flex gap-1 mt-1">
                  <div v-for="s in 4" :key="s" class="w-8 h-7 bg-gray-100 dark:bg-gray-800 rounded-sm animate-pulse" />
                </div>
              </div>
            </div>
          </template>

          <!-- Add all CTA -->
          <div v-if="addAllText && resolvedItems.length" class="mt-6">
            <button
              class="w-full py-3 text-[13px] font-semibold uppercase tracking-widest border transition-opacity hover:opacity-70"
              :style="{ borderColor: '#0f0f0f', color: '#0f0f0f' }"
            >
              {{ addAllText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
