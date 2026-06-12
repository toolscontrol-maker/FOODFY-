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

const bgColor    = computed(() => gs('bg_color') || 'var(--theme-bg, #ffffff)')
const title      = computed(() => gs('title') || 'Platos populares')
const subtitle   = computed(() => gs('subtitle') || '')
const columns    = computed(() => Number(gs('columns') ?? 4))
const showPrice  = computed(() => gs('show_price') !== false)
const resolvedCollection = computed(() => resolveCollection(gs('collectionId')))

/* Derive card visual variant from hover_effect setting so Meridional → editorial, Drop → drop */
const cardVariant = computed<'default' | 'editorial' | 'drop'>(() => {
  const he = gs('hover_effect')
  if (he === 'zoom') return 'editorial'
  if (he === 'swap') return 'drop'
  return 'default'
})

const products = computed(() => resolvedSectionProducts(props.sec))

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
  <div :class="isMobile ? 'px-5 py-12' : 'px-10 py-24'" :style="{ backgroundColor: bgColor }">
    <!-- Header -->
    <div class="flex items-end justify-between mb-8">
      <ThemeSectionHeader :title="title" :subtitle="subtitle" />
      <UBadge
        v-if="resolvedCollection"
        color="primary"
        variant="soft"
        size="xs"
        class="mb-8 flex-shrink-0"
      >
        {{ resolvedCollection.title }}
      </UBadge>
    </div>

    <!-- Empty state -->
    <div v-if="products.length === 0" class="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
      <UIcon name="i-lucide-folder-open" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="text-sm text-gray-400 font-medium">Selecciona una colección en los ajustes de esta sección</p>
    </div>

    <!-- Product grid -->
    <div
      v-else
      class="grid"
      :class="gridCols"
      :style="{ gap: cardVariant === 'editorial' ? '2rem' : cardVariant === 'drop' ? '0.5rem' : 'var(--theme-grid-h, 1.5rem)' }"
    >
      <ThemeProductCard
        v-for="prod in products"
        :key="prod.id"
        :product="prod"
        :image="getProductCoverImage(prod)"
        :name="prod.name"
        :price="showPrice ? formatPrice(getProductPrice(prod)) : undefined"
        :compare-at-price="getProductCompareAtPrice(prod) ? formatPrice(getProductCompareAtPrice(prod)!) : undefined"
        :primary-color="primaryColor"
        :is-mobile="isMobile"
        :variant="cardVariant"
        :global-hover-effect="hoverEffect"
        :is-selected="store.editorInspectorEnabled && store.editorSelectedBlockId === prod.id"
        :inspector-enabled="store.editorInspectorEnabled"
        @add-to-cart="addToCart(prod)"
      />
    </div>
  </div>
</template>
