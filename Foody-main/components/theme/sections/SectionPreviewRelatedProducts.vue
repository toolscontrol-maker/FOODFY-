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
  hoverEffect?: string
}>()

const store = useOnlineStoreStore()
const { getSetting, resolvedSectionProducts, resolveCollection, formatPrice, getProductPrice, getProductCompareAtPrice, getProductCoverImage } = useThemePreviewData()
const cart = useCartStore()
const { shopName } = useShopIdentity()

const gs = (key: string) => getSetting(props.sec, key)

const title = computed(() => gs('title') || 'También te puede gustar')
const columns = computed(() => Number(gs('columns') ?? 4))
const resolvedCollection = computed(() => resolveCollection(gs('collectionId')))
const products = computed(() => resolvedSectionProducts(props.sec, 'max_products', 4))

const gridCols = computed(() => {
  if (props.isMobile) return 'grid-cols-2'
  if (columns.value === 2) return 'grid-cols-2'
  if (columns.value === 3) return 'grid-cols-3'
  return 'grid-cols-4'
})

const addToCart = (prod: any) => {
  cart.addItem({
    variantId: prod.variants?.[0]?.id,
    productName: prod.name,
    variantName: prod.variants?.[0]?.name || 'Default',
    vendor: prod.vendor || shopName.value,
    price: getProductPrice(prod),
    compareAtPrice: getProductCompareAtPrice(prod),
    image: getProductCoverImage(prod),
  })
}
</script>

<template>
  <div :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'" :style="{ backgroundColor: 'var(--theme-bg, #ffffff)' }">
    <div class="flex items-end justify-between mb-8">
      <ThemeSectionHeader :title="title" />
      <UBadge v-if="resolvedCollection" color="primary" variant="soft" size="xs" class="mb-8 flex-shrink-0">
        {{ resolvedCollection.title }}
      </UBadge>
    </div>

    <div v-if="products.length === 0" class="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
      <UIcon name="i-lucide-sparkles" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="text-sm text-gray-400 font-medium">Selecciona una colección fuente en los ajustes</p>
    </div>

    <div v-else class="grid" :class="gridCols" :style="{ gap: 'var(--theme-grid-h, 1rem)' }">
      <ThemeProductCard
        v-for="prod in products"
        :key="prod.id"
        :image="getProductCoverImage(prod)"
        :name="prod.name"
        :price="formatPrice(getProductPrice(prod))"
        :compare-at-price="getProductCompareAtPrice(prod) ? formatPrice(getProductCompareAtPrice(prod)!) : undefined"
        :primary-color="primaryColor"
        :is-mobile="isMobile"
        :global-hover-effect="hoverEffect"
        :inspector-enabled="store.editorInspectorEnabled"
        @add-to-cart="addToCart(prod)"
      />
    </div>
  </div>
</template>
