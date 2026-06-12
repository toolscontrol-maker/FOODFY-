/* ─────────────────────────────────────────────────────────
   Storefront Data Resolver — Maps business entities from
   Pinia stores to storefront-ready models. Handles:
   - Visibility (only published/active)
   - Stock / availability
   - Pricing (with compare-at)
   - Fallbacks for empty states
   - Currency formatting
   ───────────────────────────────────────────────────────── */
import { computed } from 'vue'
import { useCatalogStore } from '~/stores/useCatalogStore'
import { useCollectionsStore } from '~/stores/useCollectionsStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import type { Product, Collection, ProductVariant } from '~/types/commerce'
import {
  getProductPrice, getProductCompareAtPrice,
  getProductCoverImage, isProductAvailable, getProductTotalStock,
} from '~/types/commerce'

/* ── Storefront product (display-ready) ── */
export interface StorefrontProduct {
  id: string
  handle: string
  name: string
  description: string
  vendor: string
  price: number
  formattedPrice: string
  compareAtPrice: number | null
  formattedCompareAtPrice: string | null
  coverImage: string
  images: { url: string; alt: string }[]
  variants: StorefrontVariant[]
  tags: string[]
  categoryName: string
  available: boolean
  totalStock: number
  badge: string | null
}

export interface StorefrontVariant {
  id: string
  name: string
  price: number
  formattedPrice: string
  compareAtPrice: number | null
  sku: string
  available: boolean
  stock: number
  options: { name: string; value: string }[]
  image: string
}

export interface StorefrontCollection {
  id: string
  handle: string
  title: string
  description: string
  image: string
  productCount: number
  products: StorefrontProduct[]
}

/* ── Currency formatter ── */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })
}

/* ── Map product → storefront product ── */
function toStorefrontProduct(product: Product): StorefrontProduct {
  const price = getProductPrice(product)
  const compareAt = getProductCompareAtPrice(product)
  const available = isProductAvailable(product)
  const totalStock = getProductTotalStock(product)

  let badge: string | null = null
  if (!available) badge = 'Agotado'
  else if (product.tags.includes('popular')) badge = 'Popular'
  else if (product.tags.includes('nuevo')) badge = 'Nuevo'
  else if (compareAt && compareAt > price) badge = 'Oferta'

  return {
    id: product.id,
    handle: product.handle,
    name: product.name,
    description: product.description,
    vendor: product.vendor,
    price,
    formattedPrice: formatCurrency(price),
    compareAtPrice: compareAt,
    formattedCompareAtPrice: compareAt ? formatCurrency(compareAt) : null,
    coverImage: getProductCoverImage(product),
    images: product.images.map(i => ({ url: i.url, alt: i.alt })),
    variants: product.variants.map(v => toStorefrontVariant(v)),
    tags: product.tags,
    categoryName: product.categoryName,
    available,
    totalStock,
    badge,
  }
}

function toStorefrontVariant(v: ProductVariant): StorefrontVariant {
  return {
    id: v.id,
    name: v.name,
    price: v.price,
    formattedPrice: formatCurrency(v.price),
    compareAtPrice: v.compareAtPrice,
    sku: v.sku,
    available: v.availableForSale,
    stock: v.inventoryQuantity,
    options: v.options,
    image: v.image,
  }
}

function toStorefrontCollection(collection: Collection, products: Product[]): StorefrontCollection {
  const collectionProducts = collection.productIds
    .map(pid => products.find(p => p.id === pid))
    .filter((p): p is Product => !!p && p.status === 'active')
    .map(toStorefrontProduct)

  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    description: collection.description,
    image: collection.image,
    productCount: collectionProducts.length,
    products: collectionProducts,
  }
}

/* ── Composable ── */
export function useStorefrontData() {
  const catalogStore = useCatalogStore()
  const collectionsStore = useCollectionsStore()

  /* ── All published products as storefront models ── */
  const storefrontProducts = computed<StorefrontProduct[]>(() =>
    catalogStore.publishedProducts.map(toStorefrontProduct)
  )

  /* ── All published collections with resolved products ── */
  const storefrontCollections = computed<StorefrontCollection[]>(() =>
    collectionsStore.publishedCollections.map(c =>
      toStorefrontCollection(c, catalogStore.products)
    )
  )

  /* ── Get single product by ID (storefront-ready) ── */
  const getStorefrontProduct = (id: string): StorefrontProduct | null => {
    const product = catalogStore.getProductById(id)
    if (!product) return null
    return toStorefrontProduct(product)
  }

  /* ── Get single product by ID even if draft (for editor) ── */
  const getEditorProduct = (id: string): StorefrontProduct | null => {
    const product = catalogStore.getProductById(id)
    if (!product) return null
    return toStorefrontProduct(product)
  }

  /* ── Get single collection with products ── */
  const getStorefrontCollection = (id: string): StorefrontCollection | null => {
    const collection = collectionsStore.getCollectionById(id)
    if (!collection) return null
    return toStorefrontCollection(collection, catalogStore.products)
  }

  /* ── Recommendations (for empty cart, related products, etc.) ── */
  const getRecommendations = (excludeId?: string, limit = 4): StorefrontProduct[] => {
    return storefrontProducts.value
      .filter(p => p.available && p.id !== excludeId)
      .slice(0, limit)
  }

  /* ── Products for a specific collection (by ID) ── */
  const getCollectionProducts = (collectionId: string): StorefrontProduct[] => {
    const collection = collectionsStore.getCollectionById(collectionId)
    if (!collection) return []
    return collection.productIds
      .map(pid => catalogStore.getProductById(pid))
      .filter((p): p is Product => !!p && p.status === 'active')
      .map(toStorefrontProduct)
  }

  /* ── First available product (fallback for previews) ── */
  const firstProduct = computed<StorefrontProduct | null>(() =>
    storefrontProducts.value.find(p => p.available) ?? storefrontProducts.value[0] ?? null
  )

  /* ── First published collection ── */
  const firstCollection = computed<StorefrontCollection | null>(() =>
    storefrontCollections.value[0] ?? null
  )

  /* ── Loading state helper ── */
  const isLoading = computed(() => catalogStore.loading || collectionsStore.loading)
  const hasError = computed(() => !!(catalogStore.error || collectionsStore.error))
  const isEmpty = computed(() => storefrontProducts.value.length === 0)

  /* ── Init — fetch all data ── */
  const init = async () => {
    await Promise.all([
      catalogStore.fetchProducts(),
      catalogStore.fetchCategories(),
      collectionsStore.fetchCollections(),
    ])
  }

  return {
    /* data */
    storefrontProducts,
    storefrontCollections,
    firstProduct,
    firstCollection,
    /* getters */
    getStorefrontProduct,
    getEditorProduct,
    getStorefrontCollection,
    getRecommendations,
    getCollectionProducts,
    /* state */
    isLoading,
    hasError,
    isEmpty,
    /* actions */
    init,
    /* utils */
    formatCurrency,
    toStorefrontProduct,
  }
}
