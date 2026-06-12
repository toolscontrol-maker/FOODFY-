<script setup lang="ts">
import { computed } from 'vue'
import { useOnlineStoreStore, type ThemeSection } from '~/stores/useOnlineStoreStore'
import { useThemePreviewData } from '~/composables/useThemePreviewData'
import { useCartStore } from '~/composables/useCartStore'
import { useShopIdentity } from '~/composables/useShopIdentity'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const store = useOnlineStoreStore()
const { getSetting, resolvedProductDetail, formatPrice, getProductPrice, getProductCompareAtPrice, getProductCoverImage } = useThemePreviewData()
const cart = useCartStore()
const { shopName } = useShopIdentity()

const gs = (key: string) => getSetting(props.sec, key)

const bgColor = computed(() => gs('bg_color') || 'var(--theme-bg, #fffbf5)')
const badgeText = computed(() => gs('badge_text') || 'Plato del día')
const heading = computed(() => gs('heading') || '')
const imageOverride = computed(() => gs('image_override') || '')

const product = computed(() => resolvedProductDetail(props.sec))
const coverImage = computed(() => imageOverride.value || (product.value ? getProductCoverImage(product.value) : ''))
const price = computed(() => product.value ? formatPrice(getProductPrice(product.value)) : '')
const compareAtPrice = computed(() => {
  const cp = product.value ? getProductCompareAtPrice(product.value) : null
  return cp ? formatPrice(cp) : ''
})

const addToCart = () => {
  if (!product.value) return
  cart.addItem({
    variantId: product.value.variants?.[0]?.id,
    productName: product.value.name,
    variantName: product.value.variants?.[0]?.name || 'Default',
    vendor: product.value.vendor || shopName.value,
    price: getProductPrice(product.value),
    compareAtPrice: getProductCompareAtPrice(product.value),
    image: coverImage.value,
  })
}
</script>

<template>
  <div :style="{ backgroundColor: bgColor }">
    <!-- No product state -->
    <div
      v-if="!product"
      class="text-center py-16 border-2 border-dashed border-amber-200 dark:border-gray-700 rounded-2xl mx-6 my-6"
    >
      <UIcon name="i-lucide-chef-hat" class="w-12 h-12 text-amber-200 mx-auto mb-4" />
      <p class="text-sm font-medium text-gray-500">Selecciona un producto para el plato del día</p>
    </div>

    <div
      v-else
      :class="isMobile ? 'flex flex-col' : 'grid grid-cols-2'"
    >
      <!-- Image -->
      <div class="relative overflow-hidden" :class="isMobile ? 'aspect-[4/3]' : 'min-h-[400px]'">
        <img v-if="coverImage" :src="coverImage" class="w-full h-full object-cover" :alt="product.name" />
        <ThemePlaceholderImage v-else variant="food" class="w-full h-full" />

        <!-- Badge overlay -->
        <div class="absolute top-4 left-4">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg"
            :style="{ backgroundColor: primaryColor }"
          >
            <UIcon name="i-lucide-chef-hat" class="w-3.5 h-3.5" />
            {{ badgeText }}
          </span>
        </div>
      </div>

      <!-- Info -->
      <div
        :class="isMobile ? 'px-5 py-8' : 'px-10 py-12'"
        class="flex flex-col justify-center gap-5"
      >
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{{ badgeText }}</p>
          <h2
            class="font-bold text-gray-900 dark:text-white leading-tight"
            :class="isMobile ? 'text-2xl' : 'text-3xl'"
          >
            {{ heading || product.name }}
          </h2>
        </div>

        <p v-if="product.description" class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
          {{ product.description }}
        </p>

        <div class="flex items-baseline gap-3">
          <span class="text-2xl font-extrabold" :style="{ color: primaryColor }">{{ price }}</span>
          <span v-if="compareAtPrice" class="text-sm text-gray-400 line-through">{{ compareAtPrice }}</span>
        </div>

        <button
          class="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          :style="{ backgroundColor: primaryColor }"
          @click.stop="addToCart"
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  </div>
</template>
