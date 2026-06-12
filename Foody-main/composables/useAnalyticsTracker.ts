/* ─────────────────────────────────────────────────────────
   Analytics Tracker — Convenience composable that wraps the
   analytics store with domain-specific tracking helpers.
   Import this in pages / components instead of the raw store.
   ───────────────────────────────────────────────────────── */
import { useAnalyticsStore } from '~/stores/useAnalyticsStore'

export function useAnalyticsTracker() {
  const store = useAnalyticsStore()

  /* ── Product events ── */
  const trackProductViewed = (productId: string, productName: string) =>
    store.trackEvent('product_viewed', { productId, productName })

  const trackCollectionViewed = (collectionId: string, collectionTitle: string) =>
    store.trackEvent('collection_viewed', { collectionId, collectionTitle })

  /* ── Cart events ── */
  const trackAddToCart = (productId: string, variantId: string, productName: string, price: number, quantity: number = 1) =>
    store.trackEvent('add_to_cart', { productId, variantId, productName, price, quantity })

  const trackRemoveFromCart = (productId: string, variantId: string, productName: string) =>
    store.trackEvent('remove_from_cart', { productId, variantId, productName })

  const trackQuantityChanged = (variantId: string, oldQty: number, newQty: number) =>
    store.trackEvent('quantity_changed', { variantId, oldQuantity: oldQty, newQuantity: newQty })

  /* ── Navigation / interaction events ── */
  const trackSearch = (query: string, resultCount: number) =>
    store.trackEvent('search', { query, resultCount })

  const trackCtaClicked = (ctaLabel: string, sectionType?: string) =>
    store.trackEvent('cta_clicked', { ctaLabel, sectionType })

  const trackBannerViewed = (bannerId: string, heading?: string) =>
    store.trackEvent('banner_viewed', { bannerId, heading })

  const trackPageViewed = (path: string, templateId?: string) =>
    store.trackEvent('page_viewed', { path, templateId })

  const trackCheckoutStarted = (itemCount: number, subtotal: number) =>
    store.trackEvent('checkout_started', { itemCount, subtotal })

  return {
    /* raw access */
    store,
    /* domain helpers */
    trackProductViewed,
    trackCollectionViewed,
    trackAddToCart,
    trackRemoveFromCart,
    trackQuantityChanged,
    trackSearch,
    trackCtaClicked,
    trackBannerViewed,
    trackPageViewed,
    trackCheckoutStarted,
  }
}
