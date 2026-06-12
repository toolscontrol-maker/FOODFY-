import { computed } from 'vue'
import { useCatalogStore } from '~/stores/useCatalogStore'
import { useCollectionsStore } from '~/stores/useCollectionsStore'
import { useOnlineStoreStore } from '~/stores/useOnlineStoreStore'
import { useProductsStore } from '~/stores/useProductsStore'
import { useStudioStore } from '~/stores/useStudioStore'
import { getProductPrice, getProductCompareAtPrice, getProductCoverImage } from '~/types/commerce'
import type { Product } from '~/types/commerce'

export const THEME_ICON_MAP: Record<string, string> = {
  truck: 'i-lucide-truck',
  shield: 'i-lucide-shield-check',
  clock: 'i-lucide-clock',
  star: 'i-lucide-star',
  heart: 'i-lucide-heart',
  check: 'i-lucide-check-circle',
  leaf: 'i-lucide-leaf',
  flame: 'i-lucide-flame',
  zap: 'i-lucide-zap',
  map: 'i-lucide-map-pin',
  phone: 'i-lucide-phone',
  mail: 'i-lucide-mail',
  gift: 'i-lucide-gift',
}

export type SectionLike = { settings: { key: string; value: any }[] }

export function useThemePreviewData() {
  const catalogStore = useCatalogStore()
  const collectionsStore = useCollectionsStore()
  const store = useOnlineStoreStore()
  const productsStore = useProductsStore()
  const studioStore = useStudioStore()

  const getSetting = <T = any>(sec: SectionLike, key: string, fallback?: T): T =>
    (sec.settings.find(s => s.key === key)?.value ?? fallback ?? null) as T

  /* Build a catalog-compatible Product from the legacy productsStore entry */
  const bridgeProduct = (raw: any): Product => ({
    id: String(raw.id),
    handle: raw.name?.toLowerCase().replace(/\s+/g, '-') ?? '',
    name: raw.name ?? '',
    description: raw.desc ?? '',
    categoryId: '',
    categoryName: raw.category ?? '',
    vendor: raw.vendor ?? '',
    type: raw.type ?? '',
    tags: raw.tags ?? [],
    status: raw.status === 'Activo' ? 'active' : raw.status === 'Archivado' ? 'archived' : 'draft',
    publishedAt: null,
    images: raw.images?.map((url: string, i: number) => ({ id: `img-${i}`, url, alt: raw.name ?? '', position: i })) ?? (raw.image ? [{ id: 'img-0', url: raw.image, alt: raw.name ?? '', position: 0 }] : []),
    variants: [{
      id: `var-${raw.id}`,
      productId: String(raw.id),
      name: 'Default',
      price: raw.price ?? 0,
      compareAtPrice: (raw.comparePrice && raw.comparePrice > 0) ? raw.comparePrice : null,
      sku: raw.sku ?? '',
      barcode: '',
      inventoryQuantity: raw.inventory ?? raw.available ?? 0,
      availableForSale: (raw.inventory ?? raw.available ?? 0) > 0,
      image: raw.coverImage ?? raw.image ?? '',
      options: [],
      weight: raw.weight ?? 0,
      weightUnit: 'g' as const,
      position: 0,
    }],
    modifiers: raw.modifiers ?? [],
    templateSuffix: '',
    createdAt: '',
    updatedAt: '',
  })

  const resolveProduct = (id: string | undefined | null): Product | null => {
    if (!id) return null
    /* Try catalog first */
    const catalogProduct = catalogStore.getProductById(id)
    if (catalogProduct) return catalogProduct
    /* Fall back to legacy products store */
    const legacy = productsStore.products.find((p: any) => String(p.id) === String(id))
    if (legacy) return bridgeProduct(legacy)
    return null
  }

  const resolveCollection = (id: string | undefined | null) => {
    if (!id) return null
    return collectionsStore.getCollectionById(id) ?? null
  }

  const resolveCollectionProducts = (collectionId: string | undefined | null): Product[] => {
    if (!collectionId) return []
    const col = collectionsStore.getCollectionById(collectionId)
    if (!col || !col.productIds.length) return []
    return col.productIds
      .map(pid => catalogStore.getProductById(pid))
      .filter((p): p is Product => p !== null)
  }

  const previewProduct = computed<Product | null>(() => {
    if (catalogStore.publishedProducts.length) return catalogStore.publishedProducts[0]
    const first = productsStore.products.find((p: any) => p.status === 'Activo' || p.status === 'active')
    return first ? bridgeProduct(first) : null
  })
  const previewProducts = computed<Product[]>(() => {
    if (catalogStore.publishedProducts.length) return catalogStore.publishedProducts.slice(0, 8)
    return productsStore.products
      .filter((p: any) => p.status === 'Activo' || p.status === 'active')
      .slice(0, 8)
      .map(bridgeProduct)
  })
  const previewCollections = computed(() => collectionsStore.publishedCollections.slice(0, 6))

  const resolvedSectionProducts = (sec: SectionLike, maxKey = 'max_products', defaultMax = 8): Product[] => {
    const colId = getSetting<string>(sec, 'collectionId')
      || (store.editorActiveTemplateId === 'tmpl-collection' ? store.editorPreviewCollectionId : null)
    const max = Number(getSetting(sec, maxKey) ?? defaultMax)
    if (colId) return resolveCollectionProducts(colId).slice(0, max)
    return previewProducts.value.slice(0, max)
  }

  const resolvedProductDetail = (sec: SectionLike): Product | null => {
    const pid = getSetting<string>(sec, 'productId')
      || (store.editorActiveTemplateId === 'tmpl-product' ? store.editorPreviewProductId : null)
    if (pid) return resolveProduct(pid)
    return previewProduct.value
  }

  /* Returns the modifier groups for the resolved product */
  const resolvedProductModifiers = (sec: SectionLike) => {
    const p = resolvedProductDetail(sec)
    if (!p) return []
    /* modifiers live on the bridged Product or on the legacy products store */
    return (p as any).modifiers ?? []
  }

  /* Returns the recipe linked to the resolved product (by productId) */
  const resolvedProductRecipe = (sec: SectionLike) => {
    const p = resolvedProductDetail(sec)
    if (!p) return null
    return studioStore.recipes.find((r: any) => String(r.productId) === String(p.id)) ?? null
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(price)

  return {
    getSetting,
    resolveProduct,
    resolveCollection,
    resolveCollectionProducts,
    previewProduct,
    previewProducts,
    previewCollections,
    resolvedSectionProducts,
    resolvedProductDetail,
    resolvedProductModifiers,
    resolvedProductRecipe,
    formatPrice,
    getProductPrice,
    getProductCompareAtPrice,
    getProductCoverImage,
  }
}
