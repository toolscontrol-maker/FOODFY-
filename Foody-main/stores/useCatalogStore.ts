/* ─────────────────────────────────────────────────────────
   Catalog Store — Single source of truth for products and
   categories. All pages consume from here instead of local
   mocks. Backed by /api/catalog/* endpoints.
   ───────────────────────────────────────────────────────── */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, Category, ProductStatus } from '~/types/commerce'
import { getProductPrice, getProductCompareAtPrice, getProductCoverImage, isProductAvailable, getProductTotalStock } from '~/types/commerce'

export const useCatalogStore = defineStore('catalog', () => {
  /* ── State ── */
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /* ── Computed ── */
  const publishedProducts = computed(() =>
    products.value.filter(p => p.status === 'active')
  )

  const draftProducts = computed(() =>
    products.value.filter(p => p.status === 'draft')
  )

  const archivedProducts = computed(() =>
    products.value.filter(p => p.status === 'archived')
  )

  /* ── Fetchers ── */
  const fetchProducts = async (params?: { status?: ProductStatus; categoryId?: string; q?: string }) => {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      if (params?.categoryId) query.set('categoryId', params.categoryId)
      if (params?.q) query.set('q', params.q)
      const qs = query.toString()
      products.value = await $fetch<Product[]>(`/api/catalog/products${qs ? '?' + qs : ''}`)
    } catch (e: any) {
      error.value = e?.message || 'Error loading products'
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      categories.value = await $fetch<Category[]>('/api/catalog/categories')
    } catch { /* silent */ }
  }

  const fetchProduct = async (id: string): Promise<Product | null> => {
    try {
      return await $fetch<Product>(`/api/catalog/products/${id}`)
    } catch {
      return null
    }
  }

  /* ── Mutations ── */
  const createProduct = async (data: Partial<Product>): Promise<Product | null> => {
    try {
      const created = await $fetch<Product>('/api/catalog/products', {
        method: 'POST',
        body: data,
      })
      await fetchProducts()
      return created
    } catch (e: any) {
      error.value = e?.message || 'Error creating product'
      return null
    }
  }

  const updateProduct = async (id: string, data: Partial<Product>): Promise<Product | null> => {
    try {
      const updated = await $fetch<Product>(`/api/catalog/products/${id}`, {
        method: 'PUT',
        body: data,
      })
      const idx = products.value.findIndex(p => p.id === id)
      if (idx >= 0) products.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e?.message || 'Error updating product'
      return null
    }
  }

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      await $fetch(`/api/catalog/products/${id}`, { method: 'DELETE' })
      products.value = products.value.filter(p => p.id !== id)
      return true
    } catch {
      return false
    }
  }

  /* ── Getters ── */
  const getProductById = (id: string) => products.value.find(p => p.id === id) ?? null

  const getProductByHandle = (handle: string) => products.value.find(p => p.handle === handle) ?? null

  const getProductsByCategory = (categoryId: string) =>
    products.value.filter(p => p.categoryId === categoryId)

  const getProductsByIds = (ids: string[]) =>
    ids.map(id => products.value.find(p => p.id === id)).filter(Boolean) as Product[]

  const searchProducts = (query: string) => {
    const q = query.toLowerCase()
    return products.value.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.vendor.toLowerCase().includes(q)
    )
  }

  return {
    /* state */
    products,
    categories,
    loading,
    error,
    /* computed */
    publishedProducts,
    draftProducts,
    archivedProducts,
    /* fetchers */
    fetchProducts,
    fetchCategories,
    fetchProduct,
    /* mutations */
    createProduct,
    updateProduct,
    deleteProduct,
    /* getters */
    getProductById,
    getProductByHandle,
    getProductsByCategory,
    getProductsByIds,
    searchProducts,
    /* re-export helpers */
    getProductPrice,
    getProductCompareAtPrice,
    getProductCoverImage,
    isProductAvailable,
    getProductTotalStock,
  }
})
