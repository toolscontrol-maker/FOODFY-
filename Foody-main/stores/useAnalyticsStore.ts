/* ─────────────────────────────────────────────────────────
   Analytics Store — Tracks storefront events and persists
   them via /api/analytics endpoints.
   ───────────────────────────────────────────────────────── */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AnalyticsEvent, AnalyticsEventType } from '~/types/commerce'

export const useAnalyticsStore = defineStore('analytics', () => {
  /* ── State ── */
  const events = ref<AnalyticsEvent[]>([])
  const sessionId = ref(`session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  const loading = ref(false)

  /* ── Computed ── */
  const recentEvents = computed(() => events.value.slice(-50))

  const eventsByType = (type: AnalyticsEventType) =>
    events.value.filter(e => e.type === type)

  /* ── Actions ── */
  const trackEvent = async (type: AnalyticsEventType, payload: Record<string, unknown> = {}) => {
    try {
      const evt = await $fetch<AnalyticsEvent>('/api/analytics/events', {
        method: 'POST',
        body: {
          type,
          sessionId: sessionId.value,
          payload,
        },
      })
      events.value.push(evt)
      // Keep local buffer trimmed
      if (events.value.length > 200) events.value.splice(0, events.value.length - 200)
      return evt
    } catch {
      // Silent fail — analytics should never block UX
      return null
    }
  }

  const fetchEvents = async (params?: { type?: AnalyticsEventType; limit?: number }) => {
    loading.value = true
    try {
      const query = new URLSearchParams()
      if (params?.type) query.set('type', params.type)
      if (params?.limit) query.set('limit', String(params.limit))
      const qs = query.toString()
      events.value = await $fetch<AnalyticsEvent[]>(`/api/analytics/events${qs ? '?' + qs : ''}`)
    } catch { /* silent */ }
    finally { loading.value = false }
  }

  return {
    events,
    sessionId,
    loading,
    recentEvents,
    eventsByType,
    trackEvent,
    fetchEvents,
  }
})
