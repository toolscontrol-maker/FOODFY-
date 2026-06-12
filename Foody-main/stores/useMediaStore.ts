import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface FocalPoint {
  x: number  // 0–1 relative to image width
  y: number  // 0–1 relative to image height
}

export interface MediaItem {
  id: number
  name: string
  url: string
  type: string
  size?: number
  uploadedAt: string
  altText?: string
  focalPoint?: FocalPoint
}

const STORAGE_KEY = 'foodfy_media_library'

const SEED: MediaItem[] = [
  { id: 1, name: 'hamburguesa_clasica.jpg', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300', type: 'JPG', uploadedAt: new Date().toISOString() },
  { id: 2, name: 'patatas_fritas.png', url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=300', type: 'PNG', uploadedAt: new Date().toISOString() },
  { id: 3, name: 'combo_grande.webp', url: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?q=80&w=300', type: 'WEBP', uploadedAt: new Date().toISOString() },
  { id: 4, name: 'ensalada_cesar.jpg', url: 'https://images.unsplash.com/photo-1546793665-c74683c3f38d?q=80&w=300', type: 'JPG', uploadedAt: new Date().toISOString() },
  { id: 5, name: 'cocacola_zero.png', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300', type: 'PNG', uploadedAt: new Date().toISOString() },
]

function loadFromStorage(): MediaItem[] {
  if (typeof window === 'undefined') return [...SEED]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...SEED]
    const parsed = JSON.parse(raw) as MediaItem[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEED]
  } catch {
    return [...SEED]
  }
}

function saveToStorage(items: MediaItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage full or unavailable — data lives in memory for this session
  }
}

export const useMediaStore = defineStore('media', () => {
  const mediaLibrary = ref<MediaItem[]>(loadFromStorage())

  watch(mediaLibrary, (val) => saveToStorage(val), { deep: true })

  function addItem(item: Omit<MediaItem, 'id' | 'uploadedAt'>): MediaItem {
    const newItem: MediaItem = {
      ...item,
      id: Date.now() + Math.floor(Math.random() * 1000),
      uploadedAt: new Date().toISOString(),
    }
    mediaLibrary.value.unshift(newItem)
    return newItem
  }

  function removeItem(id: number) {
    mediaLibrary.value = mediaLibrary.value.filter(m => m.id !== id)
  }

  function getById(id: number): MediaItem | undefined {
    return mediaLibrary.value.find(m => m.id === id)
  }

  function updateItem(id: number, patch: Partial<Omit<MediaItem, 'id' | 'uploadedAt'>>) {
    const idx = mediaLibrary.value.findIndex(m => m.id === id)
    if (idx === -1) return
    mediaLibrary.value[idx] = { ...mediaLibrary.value[idx], ...patch }
  }

  return {
    mediaLibrary,
    addItem,
    removeItem,
    getById,
    updateItem,
  }
})
