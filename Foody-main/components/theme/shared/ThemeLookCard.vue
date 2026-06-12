<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product } from '~/types/commerce'
import { getProductPrice, getProductCoverImage, getProductCompareAtPrice } from '~/types/commerce'

const props = defineProps<{
  product: Product | null
  label?: string
  showSizes?: boolean
  primaryColor?: string
  formatPrice?: (n: number) => string
}>()

const emit = defineEmits<{
  (e: 'add-to-cart', payload: { productId: string; size: string | null }): void
}>()

const selectedSize = ref<string | null>(null)

const name = computed(() => props.label || props.product?.name || 'Producto')
const price = computed(() => {
  if (!props.product) return ''
  const n = getProductPrice(props.product)
  return props.formatPrice ? props.formatPrice(n) : `${n.toFixed(2)} €`
})
const comparePrice = computed(() => {
  if (!props.product) return null
  const n = getProductCompareAtPrice(props.product)
  if (!n) return null
  return props.formatPrice ? props.formatPrice(n) : `${n.toFixed(2)} €`
})
const image = computed(() => props.product ? getProductCoverImage(props.product) : '')

const sizes = computed(() => {
  if (!props.showSizes || !props.product?.variants?.length) return []
  const first = props.product.variants[0]
  if (first.name && first.name !== props.product.name) {
    return props.product.variants.map(v => v.name)
  }
  return ['XS', 'S', 'M', 'L', 'XL']
})

const soldOut = computed(() =>
  props.product?.variants
    .filter(v => (v.inventoryQuantity ?? 1) <= 0)
    .map(v => v.name) ?? []
)

const onAdd = () => {
  if (!props.product) return
  emit('add-to-cart', { productId: props.product.id, size: selectedSize.value })
}
</script>

<template>
  <div class="flex gap-3 items-start py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <!-- Thumbnail -->
    <div class="w-16 h-20 flex-shrink-0 overflow-hidden rounded-sm bg-gray-50 dark:bg-gray-900">
      <img
        v-if="image"
        :src="image"
        :alt="name"
        class="w-full h-full object-cover"
      />
      <ThemePlaceholderImage v-else class="w-full h-full" />
    </div>

    <!-- Info + sizes + add -->
    <div class="flex-1 min-w-0 flex flex-col gap-2">
      <div>
        <p class="text-[13px] font-medium leading-tight line-clamp-2 text-gray-900 dark:text-white">
          {{ name }}
        </p>
        <div class="flex items-baseline gap-1.5 mt-0.5">
          <span class="text-[13px] font-bold" :style="{ color: primaryColor || '#0f0f0f' }">{{ price }}</span>
          <span v-if="comparePrice" class="text-[11px] text-gray-400 line-through">{{ comparePrice }}</span>
        </div>
      </div>

      <!-- Size selector -->
      <ThemeSizeSelector
        v-if="sizes.length"
        :sizes="sizes"
        :selected="selectedSize"
        :sold-out="soldOut"
        @select="selectedSize = $event"
      />

      <!-- Quick add -->
      <ThemeQuickAddButton
        label="QUICK ADD"
        :primary-color="primaryColor"
        :disabled="!product"
        size="sm"
        @click="onAdd"
      />
    </div>
  </div>
</template>
