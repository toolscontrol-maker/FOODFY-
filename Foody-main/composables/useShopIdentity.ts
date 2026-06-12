/* ─────────────────────────────────────────────────────────
   Shop Identity — Bridges useSettingsStore to any storefront
   or theme-editor context.

   Resolution order (highest priority first):
     1. Theme-level override  (globalSettings.identity.logo)
     2. Dashboard brand data  (useSettingsStore)
     3. Neutral fallback      (empty / computed)
   ───────────────────────────────────────────────────────── */
import { computed } from 'vue'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { useOnlineStoreStore } from '~/stores/useOnlineStoreStore'

export function useShopIdentity() {
  const settings = useSettingsStore()
  const themeStore = useOnlineStoreStore()

  /* ── Name ── */
  const shopName = computed(() => settings.storeName?.trim() || 'Mi tienda')

  /* ── Initial (first letter of name, used as logo fallback) ── */
  const shopInitial = computed(() => shopName.value.charAt(0).toUpperCase())

  /* ── Logo ──
       Priority: theme identity override → brand logo → empty */
  const shopLogo = computed<string>(() => {
    const themeLogo = themeStore.currentTheme?.globalSettings?.identity?.logo
    if (themeLogo) return themeLogo
    if (settings.brandLogoDefault) return settings.brandLogoDefault
    return ''
  })

  /* ── Logo width from theme (px) ── */
  const shopLogoWidth = computed<number>(() =>
    themeStore.currentTheme?.globalSettings?.identity?.logoWidth ?? 120
  )

  /* ── Contact ── */
  const shopPhone = computed(() => settings.storePhone?.trim() || '')
  const shopAddress = computed(() => settings.storeAddress?.trim() || '')
  const shopEmail = computed<string>(() => {
    /* Derive from the first admin user email if no dedicated field exists */
    const admin = settings.users?.find(u => u.role === 'admin')
    return admin?.email?.trim() || ''
  })

  /* ── Social links (only those with a URL filled in) ── */
  const shopSocials = computed(() =>
    (settings.brandSocialLinks ?? []).filter(s => s.url?.trim())
  )

  /* ── Copyright (dynamic year + real store name) ── */
  const copyrightText = computed(
    () => `© ${new Date().getFullYear()} ${shopName.value}. Todos los derechos reservados.`
  )

  /* ── Brand colors (from settings, used as theme defaults) ── */
  const brandPrimaryColor = computed(() => settings.brandColorPrimary || '#e63946')
  const brandSecondaryColor = computed(() => settings.brandColorSecondary || '#f4a261')

  /* ── Slogan / short description ── */
  const shopSlogan = computed(() => settings.brandSlogan?.trim() || '')
  const shopDescription = computed(() => settings.brandShortDescription?.trim() || '')

  /* ── Helper: resolve effective logo for a header section ──
       Uses the section's logo_url setting as an override if set,
       otherwise falls back to the theme/brand logo. */
  const resolveHeaderLogo = (sectionSettings: { key: string; value: any }[]) => {
    const sectionLogoUrl = sectionSettings.find(s => s.key === 'logo_url')?.value
    if (sectionLogoUrl) return sectionLogoUrl
    return shopLogo.value
  }

  return {
    shopName,
    shopInitial,
    shopLogo,
    shopLogoWidth,
    shopPhone,
    shopAddress,
    shopEmail,
    shopSocials,
    copyrightText,
    brandPrimaryColor,
    brandSecondaryColor,
    shopSlogan,
    shopDescription,
    resolveHeaderLogo,
  }
}
