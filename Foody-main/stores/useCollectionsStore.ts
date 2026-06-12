/* ─────────────────────────────────────────────────────────
   Collections Store — Single source of truth for product
   collections. Backed by /api/catalog/collections endpoints.
   ───────────────────────────────────────────────────────── */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Collection } from '~/types/commerce'

export const useCollectionsStore = defineStore('collections', () => {
  /* ── State ── */
  const collections = ref<Collection[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /* ── Computed ── */
  const publishedCollections = computed(() =>
    collections.value.filter(c => c.status === 'active')
  )

  const draftCollections = computed(() =>
    collections.value.filter(c => c.status === 'draft')
  )

  /* ── Fetchers ── */
  const fetchCollections = async (params?: { status?: string; q?: string }) => {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      if (params?.q) query.set('q', params.q)
      const qs = query.toString()
      collections.value = await $fetch<Collection[]>(`/api/catalog/collections${qs ? '?' + qs : ''}`)
    } catch (e: any) {
      error.value = e?.message || 'Error loading collections'
    } finally {
      loading.value = false
    }
  }

  const fetchCollection = async (id: string): Promise<Collection | null> => {
    try {
      return await $fetch<Collection>(`/api/catalog/collections/${id}`)
    } catch {
      return null
    }
  }

  /* ── Mutations ── */
  const createCollection = async (data: Partial<Collection>): Promise<Collection | null> => {
    try {
      const created = await $fetch<Collection>('/api/catalog/collections', {
        method: 'POST',
        body: data,
      })
      await fetchCollections()
      return created
    } catch (e: any) {
      error.value = e?.message || 'Error creating collection'
      return null
    }
  }

  const updateCollection = async (id: string, data: Partial<Collection>): Promise<Collection | null> => {
    try {
      const updated = await $fetch<Collection>(`/api/catalog/collections/${id}`, {
        method: 'PUT',
        body: data,
      })
      const idx = collections.value.findIndex(c => c.id === id)
      if (idx >= 0) collections.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e?.message || 'Error updating collection'
      return null
    }
  }

  const deleteCollection = async (id: string): Promise<boolean> => {
    try {
      await $fetch(`/api/catalog/collections/${id}`, { method: 'DELETE' })
      collections.value = collections.value.filter(c => c.id !== id)
      return true
    } catch {
      return false
    }
  }

  /* ── Getters ── */
  const getCollectionById = (id: string) =>
    collections.value.find(c => c.id === id) ?? null

  const getCollectionByHandle = (handle: string) =>
    collections.value.find(c => c.handle === handle) ?? null

  return {
    /* state */
    collections,
    loading,
    error,
    /* computed */
    publishedCollections,
    draftCollections,
    /* fetchers */
    fetchCollections,
    fetchCollection,
    /* mutations */
    createCollection,
    updateCollection,
    deleteCollection,
    /* getters */
    getCollectionById,
    getCollectionByHandle,
  }
})
