<script setup lang="ts">
import { useOnlineStoreStore, type ThemeSection, type ThemeBlock, type ThemeSetting } from '~/stores/useOnlineStoreStore'
import { useSectionRegistry } from '~/composables/useSectionRegistry'
import { useThemeSettings, type ComponentStyleTokens, type ColorScheme, SETTINGS_GROUPS, COMPONENT_SUBGROUPS, FONT_OPTIONS, HOVER_EFFECT_OPTIONS, CART_TYPE_OPTIONS, PRODUCT_CARD_STYLE_OPTIONS, TEXT_ALIGN_OPTIONS, tokenToBoxShadow, tokenToBorder, resolveScheme, deepEqual } from '~/composables/useThemeSettings'
import { useCartStore, MOCK_PRODUCTS, type CartPreviewMode } from '~/composables/useCartStore'
import { useCatalogStore } from '~/stores/useCatalogStore'
import { useCollectionsStore } from '~/stores/useCollectionsStore'
import type { Product } from '~/types/commerce'
import { getProductPrice, getProductCompareAtPrice, getProductCoverImage } from '~/types/commerce'
import { useAnalyticsTracker } from '~/composables/useAnalyticsTracker'
import { useShopIdentity } from '~/composables/useShopIdentity'
import { onBeforeRouteLeave } from 'vue-router'
import SectionRenderer from '~/components/theme/SectionRenderer.vue'

definePageMeta({ layout: 'theme-editor' })

const store = useOnlineStoreStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { registry, categories, getByCategory, createSectionFromType, getByType } = useSectionRegistry()
const cart = useCartStore()
const catalogStore = useCatalogStore()
const collectionsStore = useCollectionsStore()
const { trackAddToCart, trackPageViewed } = useAnalyticsTracker()
const { shopName, shopInitial, shopLogo, shopPhone, shopAddress, shopEmail, shopSocials, copyrightText, resolveHeaderLogo } = useShopIdentity()

/* ── Fetch live data for preview ── */
await Promise.all([
  store.themes.length ? Promise.resolve() : store.fetchThemes(),
  catalogStore.fetchProducts(),
  catalogStore.fetchCategories(),
  collectionsStore.fetchCollections(),
])

const themeId = route.params.id as string
const theme = computed(() => store.themes.find(t => t.id === themeId))

if (!theme.value) {
  router.replace('/online-store/themes')
}

/* ── Init draft snapshot ── */
onMounted(() => {
  store.initEditorDraft(themeId)
  /* Non-destructive: only fills identity fields that are still empty */
  store.syncIdentityDefaults(themeId, { logo: shopLogo.value })

  /* ── Preview from product page: apply query params ── */
  const qTemplate = route.query.template as string | undefined
  const qProductId = route.query.productId as string | undefined
  if (qTemplate) store.editorActiveTemplateId = qTemplate
  if (qProductId) store.editorPreviewProductId = qProductId
})

/* ── Template selector ── */
const activeTemplate = computed(() => theme.value?.templates.find(t => t.id === store.editorActiveTemplateId) ?? theme.value?.templates[0])
const templateOptions = computed(() => theme.value?.templates.map(t => ({ label: t.label, value: t.id })) ?? [])

/* ── Sections for current template ── */
const sections = computed(() => {
  if (!activeTemplate.value) return []
  return [...activeTemplate.value.sections].sort((a, b) => a.order - b.order)
})

/* ── Selection ── */
const selectedSection = computed(() => sections.value.find(s => s.id === store.editorSelectedSectionId) ?? null)
const selectedBlock = computed(() => {
  if (!selectedSection.value || !store.editorSelectedBlockId) return null
  return selectedSection.value.blocks.find(b => b.id === store.editorSelectedBlockId) ?? null
})

const selectSection = (sectionId: string) => {
  store.editorSelectedSectionId = sectionId
  store.editorSelectedBlockId = null
}

const selectBlock = (sectionId: string, blockId: string) => {
  store.editorSelectedSectionId = sectionId
  store.editorSelectedBlockId = blockId
}

const clearSelection = () => {
  store.editorSelectedSectionId = null
  store.editorSelectedBlockId = null
}

/* ── Sidebar view ── */
const sidebarView = computed({
  get: () => store.editorSidebarView,
  set: (v) => { store.editorSidebarView = v },
})

const sidebarViewOptions = [
  { label: 'Secciones', value: 'sections' as const, icon: 'i-lucide-layers' },
  { label: 'Ajustes', value: 'theme_settings' as const, icon: 'i-lucide-sliders-horizontal' },
  { label: 'Apps', value: 'app_embeds' as const, icon: 'i-lucide-puzzle' },
]

/* ── Dirty state ── */
const isDirty = computed(() => store.hasDraftChanges(themeId))
const hasUnpublished = computed(() => store.hasUnpublishedChanges(themeId))

const statusText = computed(() => {
  if (store.editorSaveStatus === 'saving') return 'Guardando...'
  if (store.editorPublishStatus === 'publishing') return 'Publicando...'
  if (store.editorPublishStatus === 'published') return 'Publicado'
  if (store.editorSaveStatus === 'saved') return 'Guardado'
  if (isDirty.value) return 'Cambios sin guardar'
  return ''
})

/* ── Section CRUD ── */
const showAddSection = ref(false)
const addSectionCategory = ref<string | null>(null)

const addSection = (type: string) => {
  if (!activeTemplate.value) return
  store.pushUndo(themeId)
  const newSection = createSectionFromType(type)
  if (!newSection) return
  newSection.order = activeTemplate.value.sections.length
  activeTemplate.value.sections.push(newSection)
  selectSection(newSection.id)
  showAddSection.value = false
  addSectionCategory.value = null
}

const toggleSectionVisibility = (sectionId: string) => {
  const sec = activeTemplate.value?.sections.find(s => s.id === sectionId)
  if (sec) {
    store.pushUndo(themeId)
    sec.hidden = !sec.hidden
  }
}

const duplicateSection = (sectionId: string) => {
  if (!activeTemplate.value) return
  const sec = activeTemplate.value.sections.find(s => s.id === sectionId)
  if (!sec) return
  store.pushUndo(themeId)
  const dup: ThemeSection = JSON.parse(JSON.stringify(sec))
  dup.id = `sec-${Date.now()}`
  dup.displayName = `${sec.displayName} (copia)`
  dup.order = activeTemplate.value.sections.length
  dup.blocks = dup.blocks.map(b => ({ ...b, id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }))
  activeTemplate.value.sections.push(dup)
}

const deleteSection = (sectionId: string) => {
  if (!activeTemplate.value) return
  store.pushUndo(themeId)
  const idx = activeTemplate.value.sections.findIndex(s => s.id === sectionId)
  if (idx !== -1) {
    activeTemplate.value.sections.splice(idx, 1)
    if (store.editorSelectedSectionId === sectionId) clearSelection()
  }
}

const moveSectionUp = (sectionId: string) => {
  if (!activeTemplate.value) return
  const sorted = [...activeTemplate.value.sections].sort((a, b) => a.order - b.order)
  const idx = sorted.findIndex(s => s.id === sectionId)
  if (idx <= 0) return
  store.pushUndo(themeId)
  const tmp = sorted[idx].order
  sorted[idx].order = sorted[idx - 1].order
  sorted[idx - 1].order = tmp
}

const moveSectionDown = (sectionId: string) => {
  if (!activeTemplate.value) return
  const sorted = [...activeTemplate.value.sections].sort((a, b) => a.order - b.order)
  const idx = sorted.findIndex(s => s.id === sectionId)
  if (idx === -1 || idx >= sorted.length - 1) return
  store.pushUndo(themeId)
  const tmp = sorted[idx].order
  sorted[idx].order = sorted[idx + 1].order
  sorted[idx + 1].order = tmp
}

/* ── Block CRUD ── */
const addBlock = (section: ThemeSection) => {
  store.pushUndo(themeId)
  const newBlock: ThemeBlock = {
    id: `blk-${Date.now()}`,
    type: 'custom',
    displayName: `Bloque ${section.blocks.length + 1}`,
    order: section.blocks.length,
    hidden: false,
    settings: [
      { key: 'content', type: 'text', label: 'Contenido', value: 'Nuevo bloque', default: '' },
    ],
  }
  section.blocks.push(newBlock)
  selectBlock(section.id, newBlock.id)
}

const addAppBlock = (section: ThemeSection, appBlock: any) => {
  store.pushUndo(themeId)
  const newBlock: ThemeBlock = {
    id: `blk-app-${Date.now()}`,
    type: appBlock.blockType,
    displayName: appBlock.displayName,
    order: section.blocks.length,
    hidden: false,
    settings: JSON.parse(JSON.stringify(appBlock.settingsSchema)),
    appId: appBlock.appId,
  }
  section.blocks.push(newBlock)
  selectBlock(section.id, newBlock.id)
}

const deleteBlock = (section: ThemeSection, blockId: string) => {
  store.pushUndo(themeId)
  const idx = section.blocks.findIndex(b => b.id === blockId)
  if (idx !== -1) {
    section.blocks.splice(idx, 1)
    if (store.editorSelectedBlockId === blockId) store.editorSelectedBlockId = null
  }
}

const toggleBlockVisibility = (block: ThemeBlock) => {
  store.pushUndo(themeId)
  block.hidden = !block.hidden
}

/* ── Setting updates ── */
const updateSetting = (settings: ThemeSetting[], key: string, value: any) => {
  store.pushUndo(themeId)
  const s = settings.find(s => s.key === key)
  if (s) s.value = value
}

/* ── Save / Publish ── */
const doSave = async () => {
  await store.saveDraft(themeId)
  toast.add({ title: 'Borrador guardado', description: 'Los cambios se han guardado correctamente.', color: 'green' })
}

const doPublish = async () => {
  await store.publishDraft(themeId)
  toast.add({ title: 'Tema publicado', description: 'Los cambios son ahora visibles en tu tienda.', color: 'green' })
}

const handleSave = () => {
  guardedAction({ type: 'save' }, doSave)
}

const handlePublish = () => {
  guardedAction({ type: 'publish' }, doPublish)
}

/* ── Preview mode ── */
const previewMode = computed({
  get: () => store.editorPreviewMode,
  set: (v) => { store.editorPreviewMode = v },
})

/* ── Inspector ── */
const inspectorEnabled = computed({
  get: () => store.editorInspectorEnabled,
  set: (v) => { store.editorInspectorEnabled = v },
})

/* ── Currently editing settings ── */
const editingSettings = computed<ThemeSetting[] | null>(() => {
  if (selectedBlock.value) return selectedBlock.value.settings
  if (selectedSection.value) return selectedSection.value.settings
  return null
})

const editingTitle = computed(() => {
  if (selectedBlock.value) return selectedBlock.value.displayName
  if (selectedSection.value) return selectedSection.value.displayName
  return ''
})

const editingIcon = computed(() => {
  if (selectedSection.value) {
    const def = getByType(selectedSection.value.type)
    return def?.icon || 'i-lucide-layout'
  }
  return 'i-lucide-box'
})

/* ── Theme settings navigation ── */
const settingsActiveGroup = ref<string | null>(null)
const settingsActiveComponent = ref<string | null>(null)
const settingsEditingScheme = ref<string | null>(null)

const gs = computed(() => theme.value?.globalSettings)

/* ── Settings group local-draft system ── */
type PendingSettingsAction =
  | { type: 'group'; key: string }
  | { type: 'back' }
  | { type: 'tab'; tab: string }
  | { type: 'save' }
  | { type: 'publish' }
  | null

const settingsGroupSnapshot = ref<any>(null)
const pendingSettingsAction = ref<PendingSettingsAction>(null)
const showSettingsDiscardModal = ref(false)

const settingsGroupDirty = computed(() => {
  const key = settingsActiveGroup.value
  if (!key || !gs.value || !settingsGroupSnapshot.value) return false
  return !deepEqual((gs.value as any)[key], settingsGroupSnapshot.value)
})

const enterSettingsGroup = (key: string) => {
  settingsActiveGroup.value = key
  settingsActiveComponent.value = null
  settingsEditingScheme.value = null
  if (gs.value) settingsGroupSnapshot.value = structuredClone((gs.value as any)[key])
}

const leaveSettingsGroup = () => {
  settingsActiveGroup.value = null
  settingsActiveComponent.value = null
  settingsEditingScheme.value = null
  settingsGroupSnapshot.value = null
}

const guardedAction = (action: PendingSettingsAction, onClean: () => void) => {
  if (settingsActiveGroup.value && settingsGroupDirty.value) {
    pendingSettingsAction.value = action
    showSettingsDiscardModal.value = true
  } else {
    onClean()
  }
}

const savingGroup = ref(false)

const commitSettingsGroupDraft = async () => {
  const key = settingsActiveGroup.value
  if (!key || !gs.value) return
  savingGroup.value = true
  try {
    await store.saveDraft(themeId)
    settingsGroupSnapshot.value = structuredClone((gs.value as any)[key])
    toast.add({ title: 'Cambios guardados', color: 'green' })
  } finally {
    savingGroup.value = false
  }
}

const revertSettingsGroup = () => {
  const key = settingsActiveGroup.value
  if (!key || !gs.value || !settingsGroupSnapshot.value) return
  const restored = structuredClone(settingsGroupSnapshot.value)
  ;(gs.value as any)[key] = restored
  if (theme.value) {
    theme.value.globalSettings = { ...gs.value, [key]: restored }
  }
}

const resolvePendingAction = () => {
  const action = pendingSettingsAction.value
  if (!action) return
  switch (action.type) {
    case 'group': leaveSettingsGroup(); enterSettingsGroup(action.key); break
    case 'back':  leaveSettingsGroup(); break
    case 'tab':   leaveSettingsGroup(); sidebarView.value = action.tab; break
    case 'save':  doSave(); break
    case 'publish': doPublish(); break
  }
  pendingSettingsAction.value = null
}

const discardAndProceed = () => {
  revertSettingsGroup()
  showSettingsDiscardModal.value = false
  resolvePendingAction()
}

const commitAndProceed = async () => {
  await commitSettingsGroupDraft()
  showSettingsDiscardModal.value = false
  resolvePendingAction()
}

const cancelSettingsDiscard = () => {
  showSettingsDiscardModal.value = false
  pendingSettingsAction.value = null
}

/* ── Settings navigation (guarded) ── */
const goToSettingsGroup = (key: string) => {
  guardedAction({ type: 'group', key }, () => enterSettingsGroup(key))
}
const goBackSettings = () => {
  if (settingsEditingScheme.value) { settingsEditingScheme.value = null; return }
  if (settingsActiveComponent.value) { settingsActiveComponent.value = null; return }
  guardedAction({ type: 'back' }, () => leaveSettingsGroup())
}

const switchSidebarView = (tab: string) => {
  if (tab === sidebarView.value) return
  guardedAction({ type: 'tab', tab }, () => {
    leaveSettingsGroup()
    sidebarView.value = tab
  })
}

/* ── Dynamic Google Fonts loader ── */
const googleFontsHref = computed(() => {
  if (!gs.value) return ''
  const families = [...new Set([gs.value.typography.headingFont, gs.value.typography.bodyFont])]
  const params = families.map(f => `family=${encodeURIComponent(f)}:wght@400;500;600;700`).join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
})
useHead(computed(() => ({
  link: googleFontsHref.value ? [{ rel: 'stylesheet', href: googleFontsHref.value, key: 'theme-fonts' }] : [],
})))

/* ── Color scheme CRUD ── */
const addColorScheme = () => {
  if (!gs.value) return
  store.pushUndo(themeId)
  const idx = gs.value.colors.schemes.length + 1
  gs.value.colors.schemes.push({
    id: `scheme-${Date.now()}`,
    name: `Esquema ${idx}`,
    background: '#ffffff',
    text: '#111827',
    primary: '#e63946',
    secondary: '#457b9d',
    buttons: '#e63946',
    borders: '#e5e7eb',
  })
}

const updateSchemeField = (schemeId: string, field: keyof ColorScheme, value: string) => {
  if (!gs.value) return
  store.pushUndo(themeId)
  const s = gs.value.colors.schemes.find(sc => sc.id === schemeId)
  if (s) (s as any)[field] = value
}

/* ── Global settings value updater ── */
const updateGS = (path: string, value: any) => {
  if (!gs.value) return
  store.pushUndo(themeId)
  const parts = path.split('.')
  let obj: any = gs.value
  for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]
  obj[parts[parts.length - 1]] = value
}

/* ── Component style token updater ── */
const updateComponentToken = (comp: string, field: string, value: any) => {
  if (!gs.value) return
  store.pushUndo(themeId)
  const c = (gs.value.components as any)[comp]
  if (c) c[field] = value
}

/* ── Scheme options for selects ── */
const schemeOptions = computed(() => {
  if (!gs.value) return []
  return gs.value.colors.schemes.map(s => ({ label: s.name, value: s.id }))
})

/* ── Primary color token (first scheme) for preview ── */
const primaryColor = computed(() => gs.value?.colors.schemes[0]?.primary ?? '#e63946')
const primaryBg = computed(() => gs.value?.colors.schemes[0]?.background ?? '#ffffff')
const primaryText = computed(() => gs.value?.colors.schemes[0]?.text ?? '#111827')

/* ── CSS variables for live preview binding ── */
const themePreviewStyle = computed(() => {
  if (!gs.value) return {}
  const s1 = gs.value.colors.schemes[0]
  return {
    '--theme-primary': s1?.primary ?? '#e63946',
    '--theme-secondary': s1?.secondary ?? '#457b9d',
    '--theme-bg': s1?.background ?? '#ffffff',
    '--theme-text': s1?.text ?? '#111827',
    '--theme-buttons': s1?.buttons ?? '#e63946',
    '--theme-borders': s1?.borders ?? '#e5e7eb',
    '--theme-heading-font': gs.value.typography.headingFont,
    '--theme-body-font': gs.value.typography.bodyFont,
    '--theme-heading-scale': `${gs.value.typography.headingScale}%`,
    '--theme-body-scale': `${gs.value.typography.bodyScale}%`,
    '--theme-page-width': `${gs.value.layout.pageWidth}px`,
    '--theme-section-spacing': `${gs.value.layout.sectionSpacing}px`,
    '--theme-grid-h': `${gs.value.layout.gridHorizontal}px`,
    '--theme-grid-v': `${gs.value.layout.gridVertical}px`,
    '--theme-btn-radius': `${gs.value.components.buttons.radius}px`,
    '--theme-btn-border': `${gs.value.components.buttons.borderWidth}px`,
    '--theme-btn-shadow': tokenToBoxShadow(gs.value.components.buttons),
    '--theme-input-radius': `${gs.value.components.inputs.radius}px`,
    '--theme-card-radius': `${gs.value.components.productCards.radius}px`,
    '--theme-container-radius': `${gs.value.components.containers.radius}px`,
    '--theme-media-radius': `${gs.value.components.media.radius}px`,
    '--theme-reveal-scroll': gs.value.motion.revealOnScroll ? '1' : '0',
    '--theme-hover-effect': gs.value.motion.hoverEffect,
    '--theme-pill-radius': `${gs.value.components.variantPills.radius}px`,
    fontFamily: gs.value.typography.bodyFont + ', sans-serif',
    fontSize: `${gs.value.typography.bodyScale}%`,
  } as Record<string, string>
})

/* ── Section actions dropdown ── */
const getSectionActions = (sec: ThemeSection) => [
  [
    { label: sec.hidden ? 'Mostrar' : 'Ocultar', icon: sec.hidden ? 'i-lucide-eye' : 'i-lucide-eye-off', click: () => toggleSectionVisibility(sec.id) },
    { label: 'Duplicar', icon: 'i-lucide-copy', click: () => duplicateSection(sec.id) },
    { label: 'Mover arriba', icon: 'i-lucide-chevron-up', click: () => moveSectionUp(sec.id) },
    { label: 'Mover abajo', icon: 'i-lucide-chevron-down', click: () => moveSectionDown(sec.id) },
  ],
  [
    { label: 'Eliminar', icon: 'i-lucide-trash', class: 'text-red-500', click: () => deleteSection(sec.id) },
  ],
]

/* ── Keyboard shortcuts ── */
const handleKeyDown = (e: KeyboardEvent) => {
  const ctrl = e.ctrlKey || e.metaKey
  if (ctrl && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    store.undo(themeId)
  } else if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    store.redo(themeId)
  } else if (ctrl && e.key === 's') {
    e.preventDefault()
    handleSave()
  }
}

const onBeforeUnload = (e: BeforeUnloadEvent) => {
  if ((settingsActiveGroup.value && settingsGroupDirty.value) || isDirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('beforeunload', onBeforeUnload)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})

/* ── Leave guard ── */
const showLeaveModal = ref(false)
const pendingLeavePath = ref<string | null>(null)

onBeforeRouteLeave((to) => {
  if (isDirty.value) {
    pendingLeavePath.value = to.fullPath
    showLeaveModal.value = true
    return false
  }
})

const leaveAndSave = async () => {
  await doSave()
  showLeaveModal.value = false
  if (pendingLeavePath.value) {
    const path = pendingLeavePath.value
    pendingLeavePath.value = null
    navigateTo(path)
  }
}

const leaveAndDiscard = () => {
  store.initEditorDraft(themeId)
  showLeaveModal.value = false
  if (pendingLeavePath.value) {
    const path = pendingLeavePath.value
    pendingLeavePath.value = null
    navigateTo(path)
  }
}

const cancelLeave = () => {
  showLeaveModal.value = false
  pendingLeavePath.value = null
}


/* ── Media picker (for image uploads) ── */
const showMediaPicker = ref(false)
const mediaPickerCallback = ref<((urls: string[]) => void) | null>(null)

const openMediaPicker = (onConfirm: (urls: string[]) => void) => {
  mediaPickerCallback.value = onConfirm
  showMediaPicker.value = true
}

const onMediaPickerConfirm = (urls: string[]) => {
  if (mediaPickerCallback.value && urls.length > 0) {
    mediaPickerCallback.value(urls)
  }
  mediaPickerCallback.value = null
}

/* ── Helper: trust icon mapping ── */
const trustIconMap: Record<string, string> = {
  truck: 'i-lucide-truck',
  shield: 'i-lucide-shield-check',
  clock: 'i-lucide-clock',
  star: 'i-lucide-star',
  heart: 'i-lucide-heart',
  check: 'i-lucide-check-circle',
  leaf: 'i-lucide-leaf',
  flame: 'i-lucide-flame',
  zap: 'i-lucide-zap',
}

/* ── Cart integration ── */
const showCartPreview = ref(false)

const cartPreviewOptions = [
  { label: 'En vivo', value: 'live' as CartPreviewMode },
  { label: 'Vacío', value: 'empty' as CartPreviewMode },
  { label: '1 producto', value: 'single' as CartPreviewMode },
  { label: 'Varios', value: 'multi' as CartPreviewMode },
]

const toggleCartPreview = () => {
  if (!gs.value) return
  if (gs.value.cart.type === 'drawer') {
    showCartPreview.value = false
    cart.openDrawer()
  } else {
    cart.closeDrawer()
    showCartPreview.value = !showCartPreview.value
  }
}

/* ── Data resolvers ── */
const resolveProduct = (id: string | undefined | null): Product | null => {
  if (!id) return null
  return catalogStore.getProductById(id) ?? null
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

const getSectionSettingValue = (sec: { settings: { key: string; value: any }[] }, key: string) =>
  sec.settings.find(s => s.key === key)?.value ?? null

/* ── Live preview data ── */
const previewProduct = computed<Product | null>(() => catalogStore.publishedProducts[0] ?? null)
const previewProducts = computed<Product[]>(() => catalogStore.publishedProducts.slice(0, 8))
const previewCollections = computed(() => collectionsStore.publishedCollections.slice(0, 6))

/* ── Section-specific resolved data ── */
const resolvedSectionProducts = (sec: { settings: { key: string; value: any }[] }, maxKey = 'max_products', defaultMax = 8): Product[] => {
  const colId = getSectionSettingValue(sec, 'collectionId')
    || (store.editorActiveTemplateId === 'tmpl-collection' ? store.editorPreviewCollectionId : null)
  const max = Number(getSectionSettingValue(sec, maxKey) ?? defaultMax)
  if (colId) {
    const products = resolveCollectionProducts(colId)
    return products.slice(0, max)
  }
  return previewProducts.value.slice(0, max)
}

const resolvedProductDetail = (sec: { settings: { key: string; value: any }[] }): Product | null => {
  const pid = getSectionSettingValue(sec, 'productId')
    || (store.editorActiveTemplateId === 'tmpl-product' ? store.editorPreviewProductId : null)
  if (pid) return resolveProduct(pid)
  return previewProduct.value
}

const formatPreviewPrice = (price: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(price)

const addToCartFromPreview = () => {
  const p = previewProduct.value
  if (p) {
    cart.addItem({
      variantId: p.variants[0]?.id,
      productName: p.name,
      variantName: p.variants[0]?.name || 'Default',
      vendor: p.vendor || shopName.value,
      price: getProductPrice(p),
      compareAtPrice: getProductCompareAtPrice(p),
      image: getProductCoverImage(p),
    })
  } else {
    cart.addItem(MOCK_PRODUCTS[0])
  }
  if (gs.value?.cart.type === 'drawer') {
    cart.openDrawer()
  } else {
    showCartPreview.value = true
  }
  const pName = p?.name || 'Producto'
  if (p) trackAddToCart(p.id, p.variants[0]?.id || '', p.name, getProductPrice(p))
  toast.add({ title: 'Producto añadido', description: `${pName} añadido al carrito`, color: 'green', timeout: 2000 })
}

/* ── Collapsed sections in sidebar ── */
const collapsedSections = ref<Set<string>>(new Set())
const toggleCollapse = (sectionId: string) => {
  if (collapsedSections.value.has(sectionId)) {
    collapsedSections.value.delete(sectionId)
  } else {
    collapsedSections.value.add(sectionId)
  }
}
</script>

<template>
  <div v-if="theme" class="flex flex-col h-full">
    <!-- ═══ TOP BAR ═══ -->
    <header class="flex items-center justify-between px-3 h-[49px] border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0 gap-2">
      <!-- Left: Back + Theme name -->
      <div class="flex items-center gap-2 min-w-0">
        <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" size="xs" @click="router.push('/online-store/themes')" aria-label="Volver" />
        <div class="flex items-center gap-1.5 min-w-0">
          <div class="w-5 h-5 rounded bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
            <span class="text-white dark:text-gray-900 font-bold text-[10px]">F</span>
          </div>
          <span class="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{{ theme.name }}</span>
          <UBadge v-if="theme.role === 'main'" color="green" variant="soft" size="xs">Activo</UBadge>
        </div>
      </div>

      <!-- Center: Template selector + Status -->
      <div class="hidden md:flex items-center gap-3">
        <USelectMenu v-model="store.editorActiveTemplateId" :options="templateOptions" value-attribute="value" size="xs" class="w-44" placeholder="Plantilla" />
        <!-- Template-level preview: product selector -->
        <div v-if="store.editorActiveTemplateId === 'tmpl-product'" class="flex items-center gap-1.5">
          <UIcon name="i-lucide-eye" class="w-3 h-3 text-gray-400" />
          <USelectMenu
            :model-value="store.editorPreviewProductId || ''"
            @update:model-value="(v: any) => store.editorPreviewProductId = v || null"
            :options="[{ label: 'Primer producto', value: '' }, ...catalogStore.publishedProducts.map(p => ({ label: p.name, value: p.id }))]"
            value-attribute="value"
            size="xs"
            class="w-40"
            placeholder="Previsualizar…"
          />
        </div>
        <!-- Template-level preview: collection selector -->
        <div v-if="store.editorActiveTemplateId === 'tmpl-collection'" class="flex items-center gap-1.5">
          <UIcon name="i-lucide-eye" class="w-3 h-3 text-gray-400" />
          <USelectMenu
            :model-value="store.editorPreviewCollectionId || ''"
            @update:model-value="(v: any) => store.editorPreviewCollectionId = v || null"
            :options="[{ label: 'Primera colección', value: '' }, ...collectionsStore.collections.map(c => ({ label: c.title, value: c.id }))]"
            value-attribute="value"
            size="xs"
            class="w-40"
            placeholder="Previsualizar…"
          />
        </div>
        <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <button class="px-2 py-1 text-[11px] font-medium transition-colors" :class="previewMode === 'desktop' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'" @click="previewMode = 'desktop'"><UIcon name="i-lucide-monitor" class="w-3.5 h-3.5" /></button>
          <button class="px-2 py-1 text-[11px] font-medium transition-colors" :class="previewMode === 'mobile' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'" @click="previewMode = 'mobile'"><UIcon name="i-lucide-smartphone" class="w-3.5 h-3.5" /></button>
        </div>
        <UTooltip text="Inspector (seleccionar en preview)">
          <UButton icon="i-lucide-mouse-pointer-click" :color="inspectorEnabled ? 'primary' : 'gray'" :variant="inspectorEnabled ? 'soft' : 'ghost'" size="xs" @click="inspectorEnabled = !inspectorEnabled" />
        </UTooltip>
        <div class="w-px h-5 bg-gray-200 dark:bg-gray-700" />
        <!-- Cart controls -->
        <UTooltip :text="gs?.cart.type === 'drawer' ? 'Abrir carrito lateral' : 'Ver página de carrito'">
          <div class="relative">
            <UButton icon="i-lucide-shopping-cart" :color="(cart.isDrawerOpen.value || showCartPreview) ? 'primary' : 'gray'" :variant="(cart.isDrawerOpen.value || showCartPreview) ? 'soft' : 'ghost'" size="xs" @click="toggleCartPreview" />
            <span v-if="cart.itemCount.value > 0" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] font-bold flex items-center justify-center pointer-events-none">{{ cart.itemCount.value > 9 ? '9+' : cart.itemCount.value }}</span>
          </div>
        </UTooltip>
        <USelectMenu
          :model-value="cart.previewMode.value"
          @update:model-value="(v: any) => cart.setPreviewMode(v)"
          :options="cartPreviewOptions"
          value-attribute="value"
          size="xs"
          class="w-28"
          placeholder="Carrito"
        />
        <span v-if="statusText" class="text-[11px] font-medium" :class="isDirty ? 'text-amber-600' : store.editorPublishStatus === 'published' ? 'text-green-600' : 'text-gray-400'">{{ statusText }}</span>
      </div>

      <!-- Right: Undo/Redo + Publicar + Guardar -->
      <div class="flex items-center gap-1.5">
        <UTooltip text="Deshacer (Ctrl+Z)">
          <UButton icon="i-lucide-undo-2" color="gray" variant="ghost" size="xs" :disabled="!store.canUndo" @click="store.undo(themeId)" />
        </UTooltip>
        <UTooltip text="Rehacer (Ctrl+Y)">
          <UButton icon="i-lucide-redo-2" color="gray" variant="ghost" size="xs" :disabled="!store.canRedo" @click="store.redo(themeId)" />
        </UTooltip>
        <div class="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        <UButton
          :color="!hasUnpublished && !isDirty ? 'gray' : 'white'"
          variant="solid"
          size="xs"
          class="font-medium border"
          :class="!hasUnpublished && !isDirty ? 'border-gray-200 dark:border-gray-700 opacity-60' : 'border-gray-300 dark:border-gray-700'"
          :disabled="store.editorPublishStatus === 'publishing' || (!hasUnpublished && !isDirty)"
          :loading="store.editorPublishStatus === 'publishing'"
          @click="handlePublish"
        >{{ !hasUnpublished && !isDirty ? 'Publicado' : 'Publicar' }}</UButton>
        <UButton color="black" size="xs" class="font-semibold px-4 relative" :disabled="store.editorSaveStatus === 'saving'" :loading="store.editorSaveStatus === 'saving'" @click="handleSave">
          Guardar
          <span v-if="isDirty" class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
        </UButton>
      </div>
    </header>

    <!-- ═══ BODY: Sidebar + Preview ═══ -->
    <div class="flex flex-1 min-h-0">
      <!-- ═══ LEFT SIDEBAR ═══ -->
      <aside class="w-[300px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col min-h-0">
        <!-- Sidebar view toggle -->
        <div class="flex border-b border-gray-200 dark:border-gray-800">
          <button
            v-for="view in sidebarViewOptions"
            :key="view.value"
            class="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors border-b-2"
            :class="sidebarView === view.value
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
            @click="switchSidebarView(view.value)"
          >
            <UIcon :name="view.icon" class="w-3.5 h-3.5" />
            {{ view.label }}
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto">

          <!-- ── SECTIONS VIEW ── -->
          <div v-if="sidebarView === 'sections'" class="p-3 space-y-0.5">
            <!-- Empty state -->
            <div v-if="sections.length === 0" class="text-center py-8">
              <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <UIcon name="i-lucide-layers" class="w-6 h-6 text-gray-300" />
              </div>
              <p class="text-[13px] font-medium text-gray-500 mb-1">Sin secciones</p>
              <p class="text-[11px] text-gray-400 mb-3">Añade secciones para construir tu página</p>
            </div>

            <div v-for="sec in sections" :key="sec.id" class="group">
              <!-- Section row -->
              <div
                class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 text-[13px]"
                :class="[
                  store.editorSelectedSectionId === sec.id && !store.editorSelectedBlockId
                    ? 'bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 text-gray-900 dark:text-white'
                    : 'hover:bg-white/60 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300',
                  sec.hidden ? 'opacity-50' : ''
                ]"
                @click="selectSection(sec.id)"
              >
                <!-- Drag handle / Reorder -->
                <div class="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="p-0 text-gray-400 hover:text-gray-700 dark:hover:text-white" @click.stop="moveSectionUp(sec.id)">
                    <UIcon name="i-lucide-chevron-up" class="w-3 h-3" />
                  </button>
                  <button class="p-0 text-gray-400 hover:text-gray-700 dark:hover:text-white" @click.stop="moveSectionDown(sec.id)">
                    <UIcon name="i-lucide-chevron-down" class="w-3 h-3" />
                  </button>
                </div>

                <UIcon :name="getByType(sec.type)?.icon || 'i-lucide-layout'" class="w-3.5 h-3.5 flex-shrink-0" :class="sec.hidden ? 'text-gray-400' : 'text-gray-500'" />
                <span class="flex-1 truncate font-medium text-[12px]">{{ sec.displayName }}</span>
                <UIcon v-if="sec.hidden" name="i-lucide-eye-off" class="w-3 h-3 text-gray-400 flex-shrink-0" />

                <!-- Collapse toggle -->
                <button v-if="sec.blocks.length > 0" class="p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" @click.stop="toggleCollapse(sec.id)">
                  <UIcon :name="collapsedSections.has(sec.id) ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'" class="w-3 h-3" />
                </button>

                <!-- Actions -->
                <UDropdown :items="getSectionActions(sec)" :popper="{ placement: 'bottom-end' }">
                  <UButton icon="i-lucide-more-horizontal" color="gray" variant="ghost" size="xs" class="opacity-0 group-hover:opacity-100" @click.stop />
                </UDropdown>
              </div>

              <!-- Blocks inside section (collapsible) -->
              <div v-if="sec.blocks.length > 0 && !collapsedSections.has(sec.id)" class="ml-7 pl-2 border-l border-gray-200 dark:border-gray-800 space-y-0.5 mt-0.5 mb-1">
                <div
                  v-for="blk in [...sec.blocks].sort((a, b) => a.order - b.order)"
                  :key="blk.id"
                  class="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-all duration-150 text-[11px] group/block"
                  :class="[
                    store.editorSelectedBlockId === blk.id
                      ? 'bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 text-gray-900 dark:text-white'
                      : 'hover:bg-white/60 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-400',
                    blk.hidden ? 'opacity-50' : ''
                  ]"
                  @click.stop="selectBlock(sec.id, blk.id)"
                >
                  <UIcon v-if="blk.appId" name="i-lucide-puzzle" class="w-3 h-3 text-primary-500 flex-shrink-0" />
                  <span class="flex-1 truncate">{{ blk.displayName }}</span>
                  <button class="opacity-0 group-hover/block:opacity-100 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-opacity" @click.stop="toggleBlockVisibility(blk)">
                    <UIcon :name="blk.hidden ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="w-3 h-3" />
                  </button>
                  <button class="opacity-0 group-hover/block:opacity-100 text-gray-400 hover:text-red-500 transition-opacity" @click.stop="deleteBlock(sec, blk.id)">
                    <UIcon name="i-lucide-x" class="w-3 h-3" />
                  </button>
                </div>
                <!-- Add block button -->
                <button
                  class="flex items-center gap-1 px-2 py-1 text-[11px] text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium transition-colors w-full"
                  @click.stop="addBlock(sec)"
                >
                  <UIcon name="i-lucide-plus" class="w-3 h-3" />
                  Añadir bloque
                </button>
                <!-- App block buttons -->
                <button
                  v-for="ab in store.appBlocks"
                  :key="ab.blockType"
                  class="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 hover:text-primary-600 font-medium transition-colors w-full"
                  @click.stop="addAppBlock(sec, ab)"
                >
                  <UIcon :name="ab.icon" class="w-3 h-3" />
                  {{ ab.displayName }}
                </button>
              </div>
            </div>

            <!-- Add section button -->
            <button
              class="flex items-center justify-center gap-1.5 w-full py-2.5 mt-3 text-[12px] font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg border border-dashed border-primary-300 dark:border-primary-800 transition-colors"
              @click="showAddSection = true"
            >
              <UIcon name="i-lucide-plus" class="w-4 h-4" />
              Añadir sección
            </button>
          </div>

          <!-- ── THEME SETTINGS VIEW ── -->
          <div v-else-if="sidebarView === 'theme_settings' && gs" class="p-0">
            <!-- Back button when inside a group -->
            <button v-if="settingsActiveGroup" class="flex items-center gap-1.5 w-full px-3 py-2 text-[12px] font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white border-b border-gray-200 dark:border-gray-800 transition-colors" @click="goBackSettings">
              <UIcon name="i-lucide-chevron-left" class="w-3.5 h-3.5" />
              {{ settingsEditingScheme ? 'Esquemas' : settingsActiveComponent ? 'Componentes' : 'Ajustes del tema' }}
            </button>

            <!-- ═══ GROUP LIST (root menu) ═══ -->
            <div v-if="!settingsActiveGroup" class="p-2 space-y-0.5">
              <button v-for="g in SETTINGS_GROUPS" :key="g.key" class="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left hover:bg-white dark:hover:bg-gray-800 transition-all group/sg" @click="goToSettingsGroup(g.key)">
                <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover/sg:bg-primary-50 dark:group-hover/sg:bg-primary-900/20 transition-colors">
                  <UIcon :name="g.icon" class="w-4 h-4 text-gray-500 group-hover/sg:text-primary-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-medium text-gray-900 dark:text-white truncate">{{ g.label }}</p>
                  <p class="text-[11px] text-gray-400 truncate">{{ g.description }}</p>
                </div>
                <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            </div>

            <!-- ═══ IDENTITY ═══ -->
            <div v-else-if="settingsActiveGroup === 'identity'" class="p-3 space-y-4">
              <p class="text-[13px] font-semibold text-gray-900 dark:text-white">Identidad</p>
              <!-- Logo -->
              <div class="space-y-1.5">
                <p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Logo</p>
                <div v-if="gs.identity.logo" class="relative group/logo">
                  <div class="h-16 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2 cursor-pointer" @click="openMediaPicker((urls) => updateGS('identity.logo', urls[0]))">
                    <img :src="gs.identity.logo" class="max-h-full max-w-full object-contain" />
                  </div>
                  <button class="absolute top-1 right-1 w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity" @click="updateGS('identity.logo', '')"><UIcon name="i-lucide-x" class="w-3 h-3" /></button>
                </div>
                <button v-else class="w-full h-16 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" @click="openMediaPicker((urls) => updateGS('identity.logo', urls[0]))">
                  <UIcon name="i-lucide-image-plus" class="w-4 h-4 text-gray-400" />
                  <span class="text-[11px] text-gray-400">Subir</span>
                </button>
              </div>
              <!-- Logo width -->
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Ancho del logo (escritorio)</p>
                  <span class="text-[11px] text-gray-500 tabular-nums">{{ gs.identity.logoWidth }}px</span>
                </div>
                <input type="range" :value="gs.identity.logoWidth" min="20" max="200" class="w-full accent-primary-500" @input="(e: any) => updateGS('identity.logoWidth', Number(e.target.value))" />
              </div>
              <!-- Favicon -->
              <div class="space-y-1.5">
                <p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Favicon</p>
                <div v-if="gs.identity.favicon" class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center p-1 cursor-pointer" @click="openMediaPicker((urls) => updateGS('identity.favicon', urls[0]))">
                    <img :src="gs.identity.favicon" class="max-h-full max-w-full" />
                  </div>
                  <button class="text-[11px] text-red-500 hover:text-red-600" @click="updateGS('identity.favicon', '')">Eliminar</button>
                </div>
                <button v-else class="w-full h-10 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" @click="openMediaPicker((urls) => updateGS('identity.favicon', urls[0]))">
                  <UIcon name="i-lucide-image-plus" class="w-3.5 h-3.5 text-gray-400" />
                  <span class="text-[11px] text-gray-400">Subir</span>
                </button>
                <p class="text-[10px] text-gray-400">Se reducirá a 32 × 32 px</p>
              </div>
            </div>

            <!-- ═══ COLORS ═══ -->
            <div v-else-if="settingsActiveGroup === 'colors'" class="p-3 space-y-3">
              <!-- Editing a single scheme -->
              <template v-if="settingsEditingScheme">
                <template v-for="sc in [gs.colors.schemes.find(s => s.id === settingsEditingScheme)]" :key="sc?.id">
                  <div v-if="sc" class="space-y-3">
                    <UFormGroup label="Nombre" :ui="{ label: { text: 'text-[12px] font-medium text-gray-600 dark:text-gray-400' } }">
                      <UInput :model-value="sc.name" size="sm" @update:model-value="(v: any) => updateSchemeField(sc.id, 'name', v)" />
                    </UFormGroup>
                    <div v-for="field in (['background','text','primary','secondary','buttons','borders'] as const)" :key="field" class="space-y-1">
                      <p class="text-[12px] font-medium text-gray-600 dark:text-gray-400 capitalize">{{ field === 'background' ? 'Fondo' : field === 'text' ? 'Texto' : field === 'primary' ? 'Principal' : field === 'secondary' ? 'Secundario' : field === 'buttons' ? 'Botones' : 'Bordes' }}</p>
                      <div class="flex items-center gap-2">
                        <label class="cursor-pointer"><input type="color" :value="(sc as any)[field]" class="sr-only" @input="(e: any) => updateSchemeField(sc.id, field, e.target.value)" /><div class="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700 shadow-sm" :style="{ backgroundColor: (sc as any)[field] }" /></label>
                        <UInput :model-value="(sc as any)[field]" size="xs" class="w-24 font-mono text-[11px]" @update:model-value="(v: any) => updateSchemeField(sc.id, field, v)" />
                      </div>
                    </div>
                  </div>
                </template>
              </template>
              <!-- Scheme list -->
              <template v-else>
                <p class="text-[13px] font-semibold text-gray-900 dark:text-white">Esquemas de color</p>
                <div v-for="sc in gs.colors.schemes" :key="sc.id" class="flex items-center gap-2 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer transition-colors" @click="settingsEditingScheme = sc.id">
                  <div class="flex gap-1">
                    <div class="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700" :style="{ backgroundColor: sc.background }" />
                    <div class="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700" :style="{ backgroundColor: sc.primary }" />
                    <div class="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700" :style="{ backgroundColor: sc.text }" />
                  </div>
                  <span class="flex-1 text-[12px] font-medium text-gray-900 dark:text-white truncate">{{ sc.name }}</span>
                  <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5 text-gray-400" />
                </div>
                <button class="flex items-center justify-center gap-1.5 w-full py-2 text-[12px] font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg border border-dashed border-primary-300 dark:border-primary-800 transition-colors" @click="addColorScheme">
                  <UIcon name="i-lucide-plus" class="w-3.5 h-3.5" /> Agregar esquema
                </button>
              </template>
            </div>

            <!-- ═══ TYPOGRAPHY ═══ -->
            <div v-else-if="settingsActiveGroup === 'typography'" class="p-3 space-y-4">
              <p class="text-[13px] font-semibold text-gray-900 dark:text-white">Tipografía</p>
              <!-- Headings -->
              <div class="space-y-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Títulos</p>
                <UFormGroup label="Fuente" :ui="{ label: { text: 'text-[12px] font-medium text-gray-600 dark:text-gray-400' } }">
                  <USelectMenu :model-value="gs.typography.headingFont" :options="FONT_OPTIONS" value-attribute="value" size="sm" @update:model-value="(v: any) => updateGS('typography.headingFont', v)" />
                </UFormGroup>
                <div class="space-y-1">
                  <div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Escala de tamaño</p><span class="text-[11px] text-gray-500 tabular-nums">{{ gs.typography.headingScale }}%</span></div>
                  <input type="range" :value="gs.typography.headingScale" min="75" max="150" class="w-full accent-primary-500" @input="(e: any) => updateGS('typography.headingScale', Number(e.target.value))" />
                </div>
              </div>
              <!-- Body -->
              <div class="space-y-2">
                <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cuerpo</p>
                <UFormGroup label="Fuente" :ui="{ label: { text: 'text-[12px] font-medium text-gray-600 dark:text-gray-400' } }">
                  <USelectMenu :model-value="gs.typography.bodyFont" :options="FONT_OPTIONS" value-attribute="value" size="sm" @update:model-value="(v: any) => updateGS('typography.bodyFont', v)" />
                </UFormGroup>
                <div class="space-y-1">
                  <div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Escala de tamaño</p><span class="text-[11px] text-gray-500 tabular-nums">{{ gs.typography.bodyScale }}%</span></div>
                  <input type="range" :value="gs.typography.bodyScale" min="75" max="150" class="w-full accent-primary-500" @input="(e: any) => updateGS('typography.bodyScale', Number(e.target.value))" />
                </div>
              </div>
              <p class="text-[10px] text-gray-400">Cambiar la fuente puede afectar al rendimiento de carga.</p>
            </div>

            <!-- ═══ LAYOUT ═══ -->
            <div v-else-if="settingsActiveGroup === 'layout'" class="p-3 space-y-4">
              <p class="text-[13px] font-semibold text-gray-900 dark:text-white">Layout</p>
              <div class="space-y-1"><div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Ancho de página</p><span class="text-[11px] text-gray-500 tabular-nums">{{ gs.layout.pageWidth }}px</span></div><input type="range" :value="gs.layout.pageWidth" min="960" max="1600" step="10" class="w-full accent-primary-500" @input="(e: any) => updateGS('layout.pageWidth', Number(e.target.value))" /></div>
              <div class="space-y-1"><div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Espacio entre secciones</p><span class="text-[11px] text-gray-500 tabular-nums">{{ gs.layout.sectionSpacing }}px</span></div><input type="range" :value="gs.layout.sectionSpacing" min="0" max="120" class="w-full accent-primary-500" @input="(e: any) => updateGS('layout.sectionSpacing', Number(e.target.value))" /></div>
              <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cuadrícula</p>
                <div class="space-y-1"><div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Espacio horizontal</p><span class="text-[11px] text-gray-500 tabular-nums">{{ gs.layout.gridHorizontal }}px</span></div><input type="range" :value="gs.layout.gridHorizontal" min="0" max="60" class="w-full accent-primary-500" @input="(e: any) => updateGS('layout.gridHorizontal', Number(e.target.value))" /></div>
                <div class="space-y-1"><div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Espacio vertical</p><span class="text-[11px] text-gray-500 tabular-nums">{{ gs.layout.gridVertical }}px</span></div><input type="range" :value="gs.layout.gridVertical" min="0" max="60" class="w-full accent-primary-500" @input="(e: any) => updateGS('layout.gridVertical', Number(e.target.value))" /></div>
              </div>
            </div>

            <!-- ═══ MOTION ═══ -->
            <div v-else-if="settingsActiveGroup === 'motion'" class="p-3 space-y-4">
              <p class="text-[13px] font-semibold text-gray-900 dark:text-white">Movimiento</p>
              <div class="flex items-center justify-between">
                <div><p class="text-[12px] font-medium text-gray-700 dark:text-gray-300">Revelar secciones al desplazarse</p></div>
                <UToggle :model-value="gs.motion.revealOnScroll" color="primary" size="sm" @update:model-value="(v: any) => updateGS('motion.revealOnScroll', v)" />
              </div>
              <UFormGroup label="Efecto hover" :ui="{ label: { text: 'text-[12px] font-medium text-gray-600 dark:text-gray-400' } }" help="Afecta a tarjetas y botones">
                <USelectMenu :model-value="gs.motion.hoverEffect" :options="HOVER_EFFECT_OPTIONS" value-attribute="value" size="sm" @update:model-value="(v: any) => updateGS('motion.hoverEffect', v)" />
              </UFormGroup>
            </div>

            <!-- ═══ COMPONENTS ═══ -->
            <div v-else-if="settingsActiveGroup === 'components'" class="p-3 space-y-3">
              <!-- Component subgroup detail -->
              <template v-if="settingsActiveComponent">
                <p class="text-[13px] font-semibold text-gray-900 dark:text-white">{{ COMPONENT_SUBGROUPS.find(c => c.key === settingsActiveComponent)?.label }}</p>
                <!-- Extra fields for productCards -->
                <template v-if="settingsActiveComponent === 'productCards'">
                  <UFormGroup label="Estilo" :ui="{ label: { text: 'text-[12px] font-medium text-gray-600 dark:text-gray-400' } }"><USelectMenu :model-value="gs.components.productCards.style" :options="PRODUCT_CARD_STYLE_OPTIONS" value-attribute="value" size="sm" @update:model-value="(v: any) => updateComponentToken('productCards', 'style', v)" /></UFormGroup>
                  <div class="space-y-1"><div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Relleno de imagen</p><span class="text-[11px] text-gray-500 tabular-nums">{{ gs.components.productCards.imagePadding }}px</span></div><input type="range" :value="gs.components.productCards.imagePadding" min="0" max="20" class="w-full accent-primary-500" @input="(e: any) => updateComponentToken('productCards', 'imagePadding', Number(e.target.value))" /></div>
                  <UFormGroup label="Alineación de texto" :ui="{ label: { text: 'text-[12px] font-medium text-gray-600 dark:text-gray-400' } }"><USelectMenu :model-value="gs.components.productCards.textAlign" :options="TEXT_ALIGN_OPTIONS" value-attribute="value" size="sm" @update:model-value="(v: any) => updateComponentToken('productCards', 'textAlign', v)" /></UFormGroup>
                  <UFormGroup label="Esquema de color" :ui="{ label: { text: 'text-[12px] font-medium text-gray-600 dark:text-gray-400' } }"><USelectMenu :model-value="gs.components.productCards.colorScheme" :options="schemeOptions" value-attribute="value" size="sm" @update:model-value="(v: any) => updateComponentToken('productCards', 'colorScheme', v)" /></UFormGroup>
                </template>
                <!-- Shared style tokens -->
                <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Borde</p>
                  <div class="space-y-1"><div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Grosor</p><span class="text-[11px] text-gray-500 tabular-nums">{{ (gs.components as any)[settingsActiveComponent].borderWidth }}px</span></div><input type="range" :value="(gs.components as any)[settingsActiveComponent].borderWidth" min="0" max="5" class="w-full accent-primary-500" @input="(e: any) => updateComponentToken(settingsActiveComponent!, 'borderWidth', Number(e.target.value))" /></div>
                  <div class="space-y-1"><div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Opacidad</p><span class="text-[11px] text-gray-500 tabular-nums">{{ (gs.components as any)[settingsActiveComponent].borderOpacity }}%</span></div><input type="range" :value="(gs.components as any)[settingsActiveComponent].borderOpacity" min="0" max="100" class="w-full accent-primary-500" @input="(e: any) => updateComponentToken(settingsActiveComponent!, 'borderOpacity', Number(e.target.value))" /></div>
                </div>
                <div class="space-y-1"><div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Radio de esquina</p><span class="text-[11px] text-gray-500 tabular-nums">{{ (gs.components as any)[settingsActiveComponent].radius }}px</span></div><input type="range" :value="(gs.components as any)[settingsActiveComponent].radius" min="0" max="40" class="w-full accent-primary-500" @input="(e: any) => updateComponentToken(settingsActiveComponent!, 'radius', Number(e.target.value))" /></div>
                <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sombra</p>
                  <div class="space-y-1"><div class="flex justify-between"><p class="text-[12px] font-medium text-gray-600 dark:text-gray-400">Opacidad</p><span class="text-[11px] text-gray-500 tabular-nums">{{ (gs.components as any)[settingsActiveComponent].shadowOpacity }}%</span></div><input type="range" :value="(gs.components as any)[settingsActiveComponent].shadowOpacity" min="0" max="100" class="w-full accent-primary-500" @input="(e: any) => updateComponentToken(settingsActiveComponent!, 'shadowOpacity', Number(e.target.value))" /></div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="space-y-1"><p class="text-[11px] text-gray-500">X</p><UInput :model-value="(gs.components as any)[settingsActiveComponent].shadowX" size="xs" type="number" @update:model-value="(v: any) => updateComponentToken(settingsActiveComponent!, 'shadowX', Number(v))" /></div>
                    <div class="space-y-1"><p class="text-[11px] text-gray-500">Y</p><UInput :model-value="(gs.components as any)[settingsActiveComponent].shadowY" size="xs" type="number" @update:model-value="(v: any) => updateComponentToken(settingsActiveComponent!, 'shadowY', Number(v))" /></div>
                    <div class="space-y-1"><p class="text-[11px] text-gray-500">Blur</p><UInput :model-value="(gs.components as any)[settingsActiveComponent].shadowBlur" size="xs" type="number" @update:model-value="(v: any) => updateComponentToken(settingsActiveComponent!, 'shadowBlur', Number(v))" /></div>
                  </div>
                </div>
              </template>
              <!-- Component subgroup list -->
              <template v-else>
                <p class="text-[13px] font-semibold text-gray-900 dark:text-white">Componentes</p>
                <button v-for="cg in COMPONENT_SUBGROUPS" :key="cg.key" class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors" @click="settingsActiveComponent = cg.key">
                  <UIcon :name="cg.icon" class="w-4 h-4 text-gray-500" />
                  <span class="flex-1 text-[12px] font-medium text-gray-700 dark:text-gray-300 text-left">{{ cg.label }}</span>
                  <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5 text-gray-300" />
                </button>
              </template>
            </div>

            <!-- ═══ CART ═══ -->
            <div v-else-if="settingsActiveGroup === 'cart'" class="p-3 space-y-4">
              <div class="flex items-center justify-between">
                <p class="text-[13px] font-semibold text-gray-900 dark:text-white">Carrito</p>
                <UButton icon="i-lucide-eye" color="primary" variant="soft" size="xs" @click="toggleCartPreview">Vista previa</UButton>
              </div>
              <UFormGroup label="Tipo de carrito" :ui="{ label: { text: 'text-[12px] font-medium text-gray-600 dark:text-gray-400' } }">
                <USelectMenu :model-value="gs.cart.type" :options="CART_TYPE_OPTIONS" value-attribute="value" size="sm" @update:model-value="(v: any) => updateGS('cart.type', v)" />
              </UFormGroup>
              <div class="flex items-center justify-between"><p class="text-[12px] font-medium text-gray-700 dark:text-gray-300">Mostrar proveedor</p><UToggle :model-value="gs.cart.showVendor" color="primary" size="sm" @update:model-value="(v: any) => updateGS('cart.showVendor', v)" /></div>
              <div class="flex items-center justify-between"><p class="text-[12px] font-medium text-gray-700 dark:text-gray-300">Habilitar nota del carrito</p><UToggle :model-value="gs.cart.enableNote" color="primary" size="sm" @update:model-value="(v: any) => updateGS('cart.enableNote', v)" /></div>
              <div v-if="gs.cart.type === 'drawer'" class="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Carrito lateral</p>
                <UFormGroup label="Colección (carrito vacío)" :ui="{ label: { text: 'text-[12px] font-medium text-gray-600 dark:text-gray-400' } }">
                  <UInput :model-value="gs.cart.drawerCollection" size="sm" placeholder="slug de colección" @update:model-value="(v: any) => updateGS('cart.drawerCollection', v)" />
                </UFormGroup>
                <UFormGroup label="Esquema de colores" :ui="{ label: { text: 'text-[12px] font-medium text-gray-600 dark:text-gray-400' } }">
                  <USelectMenu :model-value="gs.cart.drawerColorScheme" :options="schemeOptions" value-attribute="value" size="sm" @update:model-value="(v: any) => updateGS('cart.drawerColorScheme', v)" />
                </UFormGroup>
              </div>
            </div>

            <!-- ── Settings group sticky save bar ── -->
            <div
              v-if="settingsActiveGroup && settingsGroupDirty"
              class="sticky bottom-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 flex items-center justify-between gap-2 z-10"
            >
              <span class="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5" />
                Cambios sin guardar
              </span>
              <UButton color="black" size="xs" class="font-semibold" :loading="savingGroup" :disabled="savingGroup" @click="commitSettingsGroupDraft">Guardar</UButton>
            </div>
          </div>

          <!-- ── APP EMBEDS VIEW ── -->
          <div v-else-if="sidebarView === 'app_embeds'" class="p-3 space-y-3">
            <p class="text-[12px] text-gray-500">Activa o desactiva extensiones de apps que se inyectan en tu tienda.</p>
            <div v-for="embed in store.appEmbeds" :key="embed.embedId" class="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div class="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-gray-900">
                <div class="flex items-center gap-2">
                  <UIcon :name="embed.icon" class="w-4 h-4 text-gray-500" />
                  <span class="text-[13px] font-medium text-gray-900 dark:text-white">{{ embed.displayName }}</span>
                </div>
                <UToggle v-model="embed.enabled" color="primary" size="sm" />
              </div>
              <div v-if="embed.enabled" class="px-3 py-2 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
                <div v-for="setting in embed.settings" :key="setting.key">
                  <UFormGroup v-if="setting.type === 'text'" :label="setting.label" :ui="{ label: { text: 'text-[11px] font-medium text-gray-500' } }">
                    <UInput v-model="setting.value" size="xs" />
                  </UFormGroup>
                  <UFormGroup v-else-if="setting.type === 'select'" :label="setting.label" :ui="{ label: { text: 'text-[11px] font-medium text-gray-500' } }">
                    <USelectMenu v-model="setting.value" :options="setting.options ?? []" value-attribute="value" size="xs" />
                  </UFormGroup>
                  <div v-else-if="setting.type === 'color'" class="space-y-1">
                    <p class="text-[11px] font-medium text-gray-500">{{ setting.label }}</p>
                    <div class="flex items-center gap-2">
                      <label class="cursor-pointer">
                        <input type="color" v-model="setting.value" class="sr-only" />
                        <div class="w-6 h-6 rounded border border-gray-300 dark:border-gray-700" :style="{ backgroundColor: setting.value }" />
                      </label>
                      <UInput v-model="setting.value" size="xs" class="w-20 font-mono text-[10px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="store.appEmbeds.length === 0" class="text-center py-6 text-[12px] text-gray-400">
              No hay extensiones de apps instaladas.
            </div>
          </div>
        </div>
      </aside>

      <!-- ═══ CENTER: Preview + Settings Panel ═══ -->
      <div class="flex-1 flex min-h-0">
        <!-- PREVIEW -->
        <div class="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto flex flex-col items-center p-6 relative">
          <!-- Inspector mode hint -->
          <div v-if="inspectorEnabled" class="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <UIcon name="i-lucide-mouse-pointer-click" class="w-3.5 h-3.5 text-primary-600" />
            <span class="text-[11px] font-medium text-primary-700 dark:text-primary-300">Modo inspector activo — Haz clic en secciones o bloques para seleccionarlos</span>
            <button class="ml-1 text-primary-400 hover:text-primary-600" @click="inspectorEnabled = false"><UIcon name="i-lucide-x" class="w-3 h-3" /></button>
          </div>
          <div
            class="bg-white dark:bg-gray-950 shadow-xl rounded-lg overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-800 flex-shrink-0"
            :class="previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-[1200px]'"
            :style="themePreviewStyle"
          >
            <!-- Browser chrome -->
            <div class="h-8 bg-gray-100 dark:bg-gray-800 flex items-center px-3 gap-2 border-b border-gray-200 dark:border-gray-700">
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div class="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div class="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div class="flex-1 flex justify-center">
                <div class="bg-white dark:bg-gray-900 rounded px-3 py-0.5 text-[10px] text-gray-400 w-48 text-center truncate">{{ shopName.toLowerCase().replace(/\s+/g, '') }}.com</div>
              </div>
            </div>

            <!-- Cart full-page preview (replaces sections) -->
            <CartPage
              v-if="showCartPreview && gs && gs.cart.type === 'page'"
              :settings="gs"
            />

            <!-- Rendered sections preview -->
            <div v-if="!(showCartPreview && gs && gs.cart.type === 'page')" class="min-h-[500px]">
              <SectionRenderer
                :sections="sections"
                :theme-id="themeId"
                :primary-color="primaryColor"
                :is-mobile="previewMode === 'mobile'"
                :logo-width="gs?.identity?.logoWidth ?? 50"
                :hover-effect="gs?.motion?.hoverEffect ?? 'none'"
              />
              <!-- App embeds overlay (e.g., chat bubble widget) -->
              <div v-for="embed in store.appEmbeds.filter(e => e.enabled)" :key="embed.embedId">
                <div v-if="embed.embedId === 'chat-bubble'" class="fixed bottom-6 z-20" :class="embed.settings.find(s => s.key === 'position')?.value === 'bottom-left' ? 'left-[316px]' : 'right-6'">
                  <div class="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" :style="{ backgroundColor: embed.settings.find(s => s.key === 'color')?.value || '#e63946' }">
                    <UIcon name="i-lucide-message-circle" class="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <!-- Legacy inline renders (disabled — replaced by SectionRenderer above) -->
              <template v-if="false" v-for="sec in sections" :key="sec.id">
                <div
                  v-if="!sec.hidden"
                  class="relative group/preview transition-all"
                  :class="[
                    inspectorEnabled ? 'cursor-pointer' : '',
                    store.editorSelectedSectionId === sec.id && !store.editorSelectedBlockId ? 'ring-2 ring-primary-500 ring-inset' : inspectorEnabled ? 'hover:ring-2 hover:ring-primary-300 hover:ring-inset' : ''
                  ]"
                  @click="inspectorEnabled ? selectSection(sec.id) : undefined"
                >
                  <!-- Inspector overlay label -->
                  <div
                    v-if="inspectorEnabled"
                    class="absolute top-0 left-0 bg-primary-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-br z-10 opacity-0 group-hover/preview:opacity-100 transition-opacity pointer-events-none"
                  >
                    {{ sec.displayName }}
                  </div>
                  <!-- Inspector context actions -->
                  <div
                    v-if="inspectorEnabled && store.editorSelectedSectionId === sec.id && !store.editorSelectedBlockId"
                    class="absolute top-0 right-0 z-20 flex gap-0.5 p-1"
                  >
                    <button class="w-6 h-6 rounded bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" @click.stop="toggleSectionVisibility(sec.id)" :title="sec.hidden ? 'Mostrar' : 'Ocultar'">
                      <UIcon :name="sec.hidden ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="w-3 h-3 text-gray-500" />
                    </button>
                    <button class="w-6 h-6 rounded bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" @click.stop="duplicateSection(sec.id)" title="Duplicar">
                      <UIcon name="i-lucide-copy" class="w-3 h-3 text-gray-500" />
                    </button>
                    <button class="w-6 h-6 rounded bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" @click.stop="deleteSection(sec.id)" title="Eliminar">
                      <UIcon name="i-lucide-trash" class="w-3 h-3 text-red-500" />
                    </button>
                  </div>

                  <!-- HEADER section preview -->
                  <div v-if="sec.type === 'header'" class="px-6 py-3 flex items-center justify-between" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#fff' }">
                    <div class="flex items-center gap-3">
                      <img
                        v-if="resolveHeaderLogo(sec.settings)"
                        :src="resolveHeaderLogo(sec.settings)"
                        class="h-8 object-contain max-w-[120px]"
                      />
                      <div v-else class="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                        <span class="text-white font-bold text-sm">{{ shopInitial }}</span>
                      </div>
                      <span class="font-bold text-sm" :style="{ color: sec.settings.find(s => s.key === 'text_color')?.value || '#111827' }">{{ shopName }}</span>
                    </div>
                    <div class="flex gap-4">
                      <span
                        v-for="blk in sec.blocks.filter(b => !b.hidden)" :key="blk.id"
                        class="text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer font-medium relative"
                        :class="inspectorEnabled && store.editorSelectedBlockId === blk.id ? 'ring-2 ring-primary-400 rounded px-1 -mx-1' : ''"
                        @click.stop="inspectorEnabled ? selectBlock(sec.id, blk.id) : undefined"
                      >
                        {{ blk.settings.find(s => s.key === 'text')?.value || 'Enlace' }}
                      </span>
                    </div>
                  </div>

                  <!-- HERO section preview -->
                  <div v-else-if="sec.type === 'hero_banner'" class="flex items-center justify-center text-center px-8" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#1a1a2e', minHeight: (sec.settings.find(s => s.key === 'height')?.value || 500) + 'px', color: sec.settings.find(s => s.key === 'text_color')?.value || '#fff' }">
                    <div class="space-y-4">
                      <h1 class="text-3xl font-bold">{{ sec.settings.find(s => s.key === 'heading')?.value || 'Título' }}</h1>
                      <p class="text-lg opacity-80">{{ sec.settings.find(s => s.key === 'subheading')?.value }}</p>
                      <button v-if="sec.settings.find(s => s.key === 'cta_text')?.value" class="px-6 py-2.5 rounded-lg font-semibold text-sm" :style="{ backgroundColor: primaryColor, color: '#fff' }">
                        {{ sec.settings.find(s => s.key === 'cta_text')?.value }}
                      </button>
                    </div>
                  </div>

                  <!-- HERO SPLIT preview -->
                  <div v-else-if="sec.type === 'hero_split'" class="grid grid-cols-2 min-h-[360px]" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#f9fafb' }">
                    <div :class="sec.settings.find(s => s.key === 'image_position')?.value === 'left' ? 'order-2' : 'order-1'" class="flex flex-col justify-center px-10 py-8">
                      <h1 class="text-2xl font-bold mb-3" :style="{ color: sec.settings.find(s => s.key === 'text_color')?.value || '#111827' }">{{ sec.settings.find(s => s.key === 'heading')?.value || 'Título' }}</h1>
                      <p class="text-sm opacity-70 mb-6" :style="{ color: sec.settings.find(s => s.key === 'text_color')?.value || '#111827' }">{{ sec.settings.find(s => s.key === 'subheading')?.value }}</p>
                      <button v-if="sec.settings.find(s => s.key === 'cta_text')?.value" class="self-start px-5 py-2 rounded-lg font-semibold text-sm text-white" :style="{ backgroundColor: primaryColor }">{{ sec.settings.find(s => s.key === 'cta_text')?.value }}</button>
                    </div>
                    <div :class="sec.settings.find(s => s.key === 'image_position')?.value === 'left' ? 'order-1' : 'order-2'" class="bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <UIcon name="i-lucide-image" class="w-12 h-12 text-gray-300" />
                    </div>
                  </div>

                  <!-- MARQUEE preview -->
                  <div v-else-if="sec.type === 'marquee'" class="px-4 py-2 text-center text-[12px] font-medium" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#111827', color: sec.settings.find(s => s.key === 'text_color')?.value || '#fff' }">
                    {{ sec.settings.find(s => s.key === 'text')?.value || 'Anuncio' }}
                  </div>

                  <!-- PROMO BANNER preview -->
                  <div v-else-if="sec.type === 'promo_banner'" class="px-8 py-8 text-center" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#fef3c7', color: sec.settings.find(s => s.key === 'text_color')?.value || '#92400e' }">
                    <h2 class="text-xl font-bold mb-2">{{ sec.settings.find(s => s.key === 'heading')?.value || 'Oferta' }}</h2>
                    <p class="text-sm opacity-80 mb-3">{{ sec.settings.find(s => s.key === 'subheading')?.value }}</p>
                    <span v-if="sec.settings.find(s => s.key === 'cta_text')?.value" class="inline-block px-4 py-1.5 rounded-full text-[12px] font-semibold border border-current opacity-80">{{ sec.settings.find(s => s.key === 'cta_text')?.value }}</span>
                  </div>

                  <!-- COUNTDOWN preview -->
                  <div v-else-if="sec.type === 'countdown_timer'" class="px-8 py-10 text-center" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#1e293b', color: sec.settings.find(s => s.key === 'text_color')?.value || '#fff' }">
                    <p class="text-sm font-medium mb-4 opacity-80">{{ sec.settings.find(s => s.key === 'heading')?.value || '' }}</p>
                    <div class="flex justify-center gap-4">
                      <div v-for="u in ['Días', 'Horas', 'Min', 'Seg']" :key="u" class="text-center">
                        <div class="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold" :style="{ backgroundColor: sec.settings.find(s => s.key === 'accent_color')?.value || '#e63946' }">00</div>
                        <p class="text-[10px] mt-1 opacity-60">{{ u }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- FEATURED COLLECTION preview -->
                  <div v-else-if="sec.type === 'featured_collection'" class="px-8 py-10" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#fff' }">
                    <div class="flex items-center gap-2 mb-1">
                      <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ sec.settings.find(s => s.key === 'title')?.value || 'Destacados' }}</h2>
                      <UBadge v-if="resolveCollection(getSectionSettingValue(sec, 'collectionId'))" color="primary" variant="soft" size="xs">{{ resolveCollection(getSectionSettingValue(sec, 'collectionId'))!.title }}</UBadge>
                    </div>
                    <p v-if="sec.settings.find(s => s.key === 'subtitle')?.value" class="text-sm text-gray-500 mb-6">{{ sec.settings.find(s => s.key === 'subtitle')?.value }}</p>
                    <div v-else class="mb-6" />
                    <!-- No collection selected hint -->
                    <div v-if="!getSectionSettingValue(sec, 'collectionId') && resolvedSectionProducts(sec).length === 0" class="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                      <UIcon name="i-lucide-folder-open" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p class="text-[12px] text-gray-400">Selecciona una colección en los ajustes de esta sección</p>
                    </div>
                    <div v-else class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${sec.settings.find(s => s.key === 'columns')?.value || 4}, 1fr)` }">
                      <div
                        v-for="(prod, idx) in resolvedSectionProducts(sec)" :key="prod.id"
                        class="rounded-lg border overflow-hidden group/card hover:shadow-md transition-all"
                        :class="'border-gray-200 dark:border-gray-800'"
                      >
                        <div class="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                          <img v-if="getProductCoverImage(prod)" :src="getProductCoverImage(prod)" class="w-full h-full object-cover" />
                          <UIcon v-else name="i-lucide-utensils" class="w-8 h-8 text-gray-300" />
                        </div>
                        <div class="p-3">
                          <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ prod.name }}</p>
                          <p v-if="sec.settings.find(s => s.key === 'show_price')?.value" class="text-[12px] font-semibold text-primary-600 mt-0.5">{{ formatPreviewPrice(getProductPrice(prod)) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- COLLECTION GRID preview -->
                  <div v-else-if="sec.type === 'collection_grid'" class="px-8 py-10">
                    <h2 v-if="sec.settings.find(s => s.key === 'title')?.value" class="text-xl font-bold text-gray-900 dark:text-white mb-6">{{ sec.settings.find(s => s.key === 'title')?.value }}</h2>
                    <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${sec.settings.find(s => s.key === 'columns')?.value || 3}, 1fr)` }">
                      <div
                        v-for="blk in sec.blocks.filter(b => !b.hidden)" :key="blk.id"
                        class="rounded-xl overflow-hidden relative group/col h-40 flex items-end"
                        :class="inspectorEnabled && store.editorSelectedBlockId === blk.id ? 'ring-2 ring-primary-500' : ''"
                        @click.stop="inspectorEnabled ? selectBlock(sec.id, blk.id) : undefined"
                      >
                        <img v-if="resolveCollection(blk.settings.find(s => s.key === 'collectionId')?.value)?.image" :src="resolveCollection(blk.settings.find(s => s.key === 'collectionId')?.value)!.image" class="absolute inset-0 w-full h-full object-cover" />
                        <div v-else class="absolute inset-0 bg-gray-200 dark:bg-gray-800" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div class="relative z-10 p-4">
                          <p class="text-white font-semibold text-sm">{{ resolveCollection(blk.settings.find(s => s.key === 'collectionId')?.value)?.title || blk.settings.find(s => s.key === 'title')?.value || 'Categoría' }}</p>
                          <p v-if="resolveCollection(blk.settings.find(s => s.key === 'collectionId')?.value)" class="text-white/70 text-[11px]">{{ resolveCollection(blk.settings.find(s => s.key === 'collectionId')?.value)!.productIds.length }} productos</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- BEST SELLERS preview -->
                  <div v-else-if="sec.type === 'best_sellers'" class="px-8 py-10" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#f9fafb' }">
                    <div class="flex items-center gap-2 mb-6">
                      <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ sec.settings.find(s => s.key === 'title')?.value || 'Más vendidos' }}</h2>
                      <UBadge v-if="resolveCollection(getSectionSettingValue(sec, 'collectionId'))" color="primary" variant="soft" size="xs">{{ resolveCollection(getSectionSettingValue(sec, 'collectionId'))!.title }}</UBadge>
                    </div>
                    <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${sec.settings.find(s => s.key === 'columns')?.value || 4}, 1fr)` }">
                      <div v-for="(prod, idx) in resolvedSectionProducts(sec, 'max_products', 4)" :key="prod.id" class="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div class="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                          <img v-if="getProductCoverImage(prod)" :src="getProductCoverImage(prod)" class="w-full h-full object-cover" />
                          <UIcon v-else name="i-lucide-utensils" class="w-8 h-8 text-gray-300" />
                          <span v-if="sec.settings.find(s => s.key === 'show_ranking')?.value" class="absolute top-2 left-2 bg-gray-900 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center">{{ idx + 1 }}</span>
                        </div>
                        <div class="p-3">
                          <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ prod.name }}</p>
                          <p class="text-[12px] font-semibold text-primary-600 mt-0.5">{{ formatPreviewPrice(getProductPrice(prod)) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- RELATED PRODUCTS preview -->
                  <div v-else-if="sec.type === 'related_products'" class="px-8 py-10">
                    <div class="flex items-center gap-2 mb-6">
                      <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ sec.settings.find(s => s.key === 'title')?.value || 'Relacionados' }}</h2>
                      <UBadge v-if="resolveCollection(getSectionSettingValue(sec, 'collectionId'))" color="primary" variant="soft" size="xs">{{ resolveCollection(getSectionSettingValue(sec, 'collectionId'))!.title }}</UBadge>
                    </div>
                    <div v-if="resolvedSectionProducts(sec, 'max_products', 4).length === 0" class="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                      <UIcon name="i-lucide-folder-open" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p class="text-[12px] text-gray-400">Selecciona una colección fuente en los ajustes</p>
                    </div>
                    <div v-else class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${sec.settings.find(s => s.key === 'columns')?.value || 4}, 1fr)` }">
                      <div v-for="prod in resolvedSectionProducts(sec, 'max_products', 4)" :key="prod.id" class="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div class="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                          <img v-if="getProductCoverImage(prod)" :src="getProductCoverImage(prod)" class="w-full h-full object-cover" />
                          <UIcon v-else name="i-lucide-utensils" class="w-6 h-6 text-gray-300" />
                        </div>
                        <div class="p-3">
                          <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ prod.name }}</p>
                          <p class="text-[12px] font-semibold text-primary-600 mt-0.5">{{ formatPreviewPrice(getProductPrice(prod)) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- PRODUCT DETAIL preview -->
                  <div v-else-if="sec.type === 'product_detail'" class="px-8 py-10" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#fff' }">
                    <!-- No product selected state -->
                    <div v-if="!resolvedProductDetail(sec)" class="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                      <UIcon name="i-lucide-package" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p class="text-[13px] font-medium text-gray-500 mb-1">Sin producto seleccionado</p>
                      <p class="text-[11px] text-gray-400">Selecciona un producto en los ajustes de esta sección</p>
                    </div>
                    <div v-else class="grid grid-cols-2 gap-8">
                      <div class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
                        <img v-if="getProductCoverImage(resolvedProductDetail(sec)!)" :src="getProductCoverImage(resolvedProductDetail(sec)!)" class="w-full h-full object-cover" />
                        <UIcon v-else name="i-lucide-image" class="w-16 h-16 text-gray-300" />
                      </div>
                      <div class="space-y-4">
                        <div><p class="text-[11px] text-gray-400 font-medium">{{ resolvedProductDetail(sec)!.vendor || shopName }}</p><h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ resolvedProductDetail(sec)!.name }}</h2></div>
                        <div class="flex items-baseline gap-2"><span class="text-2xl font-bold text-primary-600">{{ formatPreviewPrice(getProductPrice(resolvedProductDetail(sec)!)) }}</span><span v-if="getProductCompareAtPrice(resolvedProductDetail(sec)!)" class="text-sm text-gray-400 line-through">{{ formatPreviewPrice(getProductCompareAtPrice(resolvedProductDetail(sec)!)!) }}</span></div>
                        <div class="flex gap-2"><span v-for="v in (resolvedProductDetail(sec)!.variants || []).slice(0, 3)" :key="v.id" class="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-[12px] font-medium cursor-pointer hover:border-primary-500">{{ v.name }}</span></div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ resolvedProductDetail(sec)!.description || 'Descripción del producto.' }}</p>
                        <button class="w-full py-3 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]" :style="{ backgroundColor: primaryColor }" @click.stop="addToCartFromPreview">Añadir al carrito</button>
                        <div class="flex flex-wrap gap-2">
                          <span v-for="b in (sec.blocks.find(bl => bl.type === 'product_badges')?.settings.find(s => s.key === 'badges')?.value || '').split(',')" :key="b" class="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full"><UIcon name="i-lucide-check-circle" class="w-3 h-3" />{{ b.trim() }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- RICH TEXT preview -->
                  <div v-else-if="sec.type === 'rich_text'" class="px-8 py-10" :style="{ textAlign: sec.settings.find(s => s.key === 'alignment')?.value || 'center', backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#fff' }">
                    <h3 v-if="sec.settings.find(s => s.key === 'heading')?.value" class="text-lg font-bold mb-3" :style="{ color: sec.settings.find(s => s.key === 'text_color')?.value || '#374151' }">{{ sec.settings.find(s => s.key === 'heading')?.value }}</h3>
                    <p class="text-[14px] leading-relaxed max-w-2xl mx-auto" :style="{ color: sec.settings.find(s => s.key === 'text_color')?.value || '#374151' }">{{ sec.settings.find(s => s.key === 'content')?.value || 'Texto' }}</p>
                  </div>

                  <!-- IMAGE WITH TEXT preview -->
                  <div v-else-if="sec.type === 'image_with_text'" class="grid grid-cols-2 min-h-[280px]" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#fff' }">
                    <div :class="sec.settings.find(s => s.key === 'image_position')?.value === 'right' ? 'order-1' : 'order-2'" class="flex flex-col justify-center px-10 py-8">
                      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-3">{{ sec.settings.find(s => s.key === 'heading')?.value || 'Título' }}</h2>
                      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{{ sec.settings.find(s => s.key === 'content')?.value }}</p>
                      <button v-if="sec.settings.find(s => s.key === 'cta_text')?.value" class="self-start px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">{{ sec.settings.find(s => s.key === 'cta_text')?.value }}</button>
                    </div>
                    <div :class="sec.settings.find(s => s.key === 'image_position')?.value === 'right' ? 'order-2' : 'order-1'" class="bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <UIcon name="i-lucide-image" class="w-12 h-12 text-gray-300" />
                    </div>
                  </div>

                  <!-- VIDEO SECTION preview -->
                  <div v-else-if="sec.type === 'video_section'" class="px-8 py-10" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#000' }">
                    <h2 v-if="sec.settings.find(s => s.key === 'heading')?.value" class="text-lg font-bold text-white mb-4 text-center">{{ sec.settings.find(s => s.key === 'heading')?.value }}</h2>
                    <div class="aspect-video bg-gray-900 rounded-xl flex items-center justify-center max-w-3xl mx-auto">
                      <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"><UIcon name="i-lucide-play" class="w-8 h-8 text-white" /></div>
                    </div>
                  </div>

                  <!-- TESTIMONIALS preview -->
                  <div v-else-if="sec.type === 'testimonials'" class="px-8 py-10" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#f9fafb' }">
                    <h2 v-if="sec.settings.find(s => s.key === 'title')?.value" class="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">{{ sec.settings.find(s => s.key === 'title')?.value }}</h2>
                    <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${sec.settings.find(s => s.key === 'columns')?.value || 3}, 1fr)` }">
                      <div
                        v-for="blk in sec.blocks.filter(b => !b.hidden)" :key="blk.id"
                        class="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border transition-all"
                        :class="inspectorEnabled && store.editorSelectedBlockId === blk.id ? 'ring-2 ring-primary-500 border-primary-300' : 'border-gray-100 dark:border-gray-800'"
                        @click.stop="inspectorEnabled ? selectBlock(sec.id, blk.id) : undefined"
                      >
                        <div v-if="sec.settings.find(s => s.key === 'show_stars')?.value" class="flex gap-0.5 mb-3">
                          <UIcon v-for="i in (blk.settings.find(s => s.key === 'rating')?.value || 5)" :key="i" name="i-lucide-star" class="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <p class="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{{ blk.settings.find(s => s.key === 'text')?.value || '' }}</p>
                        <p class="text-[12px] font-semibold text-gray-900 dark:text-white">{{ blk.settings.find(s => s.key === 'author')?.value || 'Anónimo' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- TRUST ICONS preview -->
                  <div v-else-if="sec.type === 'trust_icons'" class="px-8 py-8" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#fff' }">
                    <h2 v-if="sec.settings.find(s => s.key === 'title')?.value" class="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">{{ sec.settings.find(s => s.key === 'title')?.value }}</h2>
                    <div class="grid gap-6" :style="{ gridTemplateColumns: `repeat(${sec.settings.find(s => s.key === 'columns')?.value || 4}, 1fr)` }">
                      <div
                        v-for="blk in sec.blocks.filter(b => !b.hidden)" :key="blk.id"
                        class="text-center rounded-lg p-3 transition-all"
                        :class="inspectorEnabled && store.editorSelectedBlockId === blk.id ? 'ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : ''"
                        @click.stop="inspectorEnabled ? selectBlock(sec.id, blk.id) : undefined"
                      >
                        <div class="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" :style="{ backgroundColor: sec.settings.find(s => s.key === 'icon_color')?.value + '20' }">
                          <UIcon :name="trustIconMap[blk.settings.find(s => s.key === 'icon')?.value || 'check'] || 'i-lucide-check-circle'" class="w-5 h-5" :style="{ color: sec.settings.find(s => s.key === 'icon_color')?.value || '#059669' }" />
                        </div>
                        <p class="text-[13px] font-semibold text-gray-900 dark:text-white">{{ blk.settings.find(s => s.key === 'title')?.value || '' }}</p>
                        <p class="text-[11px] text-gray-500 mt-0.5">{{ blk.settings.find(s => s.key === 'description')?.value || '' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- FEATURES GRID preview -->
                  <div v-else-if="sec.type === 'features_grid'" class="px-8 py-10" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#fff' }">
                    <h2 v-if="sec.settings.find(s => s.key === 'title')?.value" class="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">{{ sec.settings.find(s => s.key === 'title')?.value }}</h2>
                    <div class="grid gap-6" :style="{ gridTemplateColumns: `repeat(${sec.settings.find(s => s.key === 'columns')?.value || 3}, 1fr)` }">
                      <div v-for="blk in sec.blocks.filter(b => !b.hidden)" :key="blk.id" class="text-center p-4">
                        <div class="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" :style="{ backgroundColor: sec.settings.find(s => s.key === 'icon_color')?.value + '15' }">
                          <UIcon :name="trustIconMap[blk.settings.find(s => s.key === 'icon')?.value || 'star'] || 'i-lucide-star'" class="w-6 h-6" :style="{ color: sec.settings.find(s => s.key === 'icon_color')?.value || '#e63946' }" />
                        </div>
                        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white mb-1">{{ blk.settings.find(s => s.key === 'title')?.value || '' }}</h3>
                        <p class="text-[12px] text-gray-500 leading-relaxed">{{ blk.settings.find(s => s.key === 'description')?.value || '' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- LOGO LIST preview -->
                  <div v-else-if="sec.type === 'logo_list'" class="px-8 py-8" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#fff' }">
                    <h2 v-if="sec.settings.find(s => s.key === 'title')?.value" class="text-sm font-medium text-gray-400 mb-4 text-center uppercase tracking-wider">{{ sec.settings.find(s => s.key === 'title')?.value }}</h2>
                    <div class="flex items-center justify-center gap-10">
                      <div v-for="blk in sec.blocks.filter(b => !b.hidden)" :key="blk.id" class="w-24 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center" :class="sec.settings.find(s => s.key === 'grayscale')?.value ? 'grayscale opacity-50' : ''">
                        <span class="text-[11px] text-gray-400 font-medium">{{ blk.settings.find(s => s.key === 'name')?.value || 'Logo' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- FAQ ACCORDION preview -->
                  <div v-else-if="sec.type === 'faq_accordion'" class="px-8 py-10" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#fff' }">
                    <h2 v-if="sec.settings.find(s => s.key === 'title')?.value" class="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">{{ sec.settings.find(s => s.key === 'title')?.value }}</h2>
                    <div class="max-w-2xl mx-auto space-y-2">
                      <div
                        v-for="blk in sec.blocks.filter(b => !b.hidden)" :key="blk.id"
                        class="border rounded-lg overflow-hidden transition-all"
                        :class="inspectorEnabled && store.editorSelectedBlockId === blk.id ? 'ring-2 ring-primary-500 border-primary-300' : 'border-gray-200 dark:border-gray-800'"
                        @click.stop="inspectorEnabled ? selectBlock(sec.id, blk.id) : undefined"
                      >
                        <div class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
                          <span class="text-[13px] font-medium text-gray-900 dark:text-white">{{ blk.settings.find(s => s.key === 'question')?.value || 'Pregunta' }}</span>
                          <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-gray-400" />
                        </div>
                        <div class="px-4 py-3 text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">{{ blk.settings.find(s => s.key === 'answer')?.value || 'Respuesta' }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- NEWSLETTER preview -->
                  <div v-else-if="sec.type === 'newsletter'" class="px-8 py-12 text-center" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#f3f4f6', color: sec.settings.find(s => s.key === 'text_color')?.value || '#111827' }">
                    <h2 class="text-xl font-bold mb-2">{{ sec.settings.find(s => s.key === 'heading')?.value || 'Newsletter' }}</h2>
                    <p class="text-sm opacity-70 mb-6">{{ sec.settings.find(s => s.key === 'subheading')?.value }}</p>
                    <div class="flex max-w-md mx-auto gap-2">
                      <div class="flex-1 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center px-3"><span class="text-[12px] text-gray-400">{{ sec.settings.find(s => s.key === 'placeholder')?.value || 'Tu email' }}</span></div>
                      <button class="px-5 h-10 rounded-lg font-semibold text-sm text-white" :style="{ backgroundColor: primaryColor }">{{ sec.settings.find(s => s.key === 'button_text')?.value || 'Suscribirme' }}</button>
                    </div>
                  </div>

                  <!-- FOOTER preview -->
                  <div v-else-if="sec.type === 'footer'" class="px-8 py-8" :style="{ backgroundColor: sec.settings.find(s => s.key === 'bg_color')?.value || '#111827' }">
                    <div class="grid gap-8" :style="{ gridTemplateColumns: `repeat(${sec.settings.find(s => s.key === 'columns_count')?.value || 4}, 1fr)` }">
                      <div v-for="blk in sec.blocks.filter(b => !b.hidden)" :key="blk.id">
                        <p class="text-[12px] font-semibold mb-2" :style="{ color: sec.settings.find(s => s.key === 'text_color')?.value || '#d1d5db' }">{{ blk.settings.find(s => s.key === 'heading')?.value || '' }}</p>
                        <!-- Render content: if the block is the contact column and value is empty, show real store data -->
                        <div class="text-[11px] whitespace-pre-line space-y-0.5" style="color: #9ca3af">
                          <template v-if="blk.settings.find(s => s.key === 'content')?.value">
                            {{ blk.settings.find(s => s.key === 'content')?.value }}
                          </template>
                          <template v-else-if="blk.type === 'footer_column' && (blk.settings.find(s => s.key === 'heading')?.value || '').toLowerCase().includes('contacto')">
                            <p v-if="shopEmail">{{ shopEmail }}</p>
                            <p v-if="shopPhone">{{ shopPhone }}</p>
                            <p v-if="shopAddress">{{ shopAddress }}</p>
                            <p v-if="!shopEmail && !shopPhone && !shopAddress" class="italic opacity-60">Sin datos de contacto configurados</p>
                          </template>
                        </div>
                      </div>
                    </div>
                    <div class="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                      <!-- Copyright: setting value → computed from store name → empty -->
                      <p class="text-[11px]" style="color: #6b7280">
                        {{ sec.settings.find(s => s.key === 'copyright')?.value || copyrightText }}
                      </p>
                      <!-- Social icons: real links from settings if show_social is on -->
                      <div v-if="sec.settings.find(s => s.key === 'show_social')?.value" class="flex gap-2">
                        <template v-if="shopSocials.length">
                          <a
                            v-for="social in shopSocials" :key="social.platform"
                            :href="social.url" target="_blank"
                            class="w-7 h-7 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/50 transition-colors"
                            :title="social.platform"
                          >
                            <UIcon
                              :name="social.platform === 'Instagram' ? 'i-lucide-instagram' : social.platform === 'Facebook' ? 'i-lucide-facebook' : social.platform.includes('Twitter') || social.platform === 'X (Twitter)' ? 'i-lucide-twitter' : 'i-lucide-link'"
                              class="w-3.5 h-3.5 text-gray-400"
                            />
                          </a>
                        </template>
                        <template v-else>
                          <div v-for="icon in ['i-lucide-instagram', 'i-lucide-twitter', 'i-lucide-facebook']" :key="icon" class="w-7 h-7 rounded-full bg-gray-700/50 flex items-center justify-center opacity-40"><UIcon :name="icon" class="w-3.5 h-3.5 text-gray-400" /></div>
                        </template>
                      </div>
                    </div>
                  </div>

                  <!-- Generic section preview -->
                  <div v-else class="px-8 py-10 text-center">
                    <div class="inline-block p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-2">
                      <UIcon :name="getByType(sec.type)?.icon || 'i-lucide-layout'" class="w-5 h-5 text-gray-400" />
                    </div>
                    <p class="text-[13px] font-medium text-gray-500">{{ sec.displayName }}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">{{ getByType(sec.type)?.description || 'Sección personalizada' }}</p>
                  </div>

                  <!-- App embed previews -->
                  <template v-if="sec.type === 'footer'">
                    <div v-for="embed in store.appEmbeds.filter(e => e.enabled)" :key="embed.embedId">
                      <div v-if="embed.embedId === 'chat-bubble'" class="fixed bottom-6 z-20" :class="embed.settings.find(s => s.key === 'position')?.value === 'bottom-left' ? 'left-[316px]' : 'right-6'">
                        <div class="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" :style="{ backgroundColor: embed.settings.find(s => s.key === 'color')?.value || '#e63946' }">
                          <UIcon name="i-lucide-message-circle" class="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </template>
            </div>

          </div>
        </div>

        <!-- Cart drawer (rendered outside preview frame) -->
        <ClientOnly>
          <CartDrawer v-if="gs" :settings="gs" />
        </ClientOnly>

        <!-- ═══ RIGHT: Settings Panel ═══ -->
        <aside
          v-if="editingSettings || (sidebarView === 'sections' && selectedSection)"
          class="w-[280px] flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col min-h-0"
        >
          <div class="px-3 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <UIcon :name="editingIcon" class="w-4 h-4 text-gray-400 flex-shrink-0" />
              <h4 class="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{{ editingTitle }}</h4>
            </div>
            <UButton icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="clearSelection" />
          </div>
          <div v-if="editingSettings" class="flex-1 overflow-y-auto p-3 space-y-3">
            <div v-for="setting in editingSettings" :key="setting.key">
              <!-- Text input -->
              <UFormGroup v-if="setting.type === 'text'" :label="setting.label" :ui="{ label: { text: 'text-[11px] font-medium text-gray-500' } }">
                <UInput v-model="setting.value" size="sm" />
              </UFormGroup>
              <!-- Textarea -->
              <UFormGroup v-else-if="setting.type === 'textarea'" :label="setting.label" :ui="{ label: { text: 'text-[11px] font-medium text-gray-500' } }">
                <UTextarea v-model="setting.value" :rows="3" size="sm" />
              </UFormGroup>
              <!-- Number -->
              <UFormGroup v-else-if="setting.type === 'number'" :label="setting.label" :ui="{ label: { text: 'text-[11px] font-medium text-gray-500' } }">
                <UInput v-model.number="setting.value" type="number" size="sm" />
              </UFormGroup>
              <!-- Select -->
              <UFormGroup v-else-if="setting.type === 'select'" :label="setting.label" :ui="{ label: { text: 'text-[11px] font-medium text-gray-500' } }">
                <USelectMenu v-model="setting.value" :options="setting.options ?? []" value-attribute="value" size="sm" />
              </UFormGroup>
              <!-- Color -->
              <div v-else-if="setting.type === 'color'" class="space-y-1">
                <p class="text-[11px] font-medium text-gray-500">{{ setting.label }}</p>
                <div class="flex items-center gap-2">
                  <label class="cursor-pointer">
                    <input type="color" v-model="setting.value" class="sr-only" />
                    <div class="w-7 h-7 rounded border border-gray-300 dark:border-gray-700 shadow-sm" :style="{ backgroundColor: setting.value }" />
                  </label>
                  <UInput v-model="setting.value" size="xs" class="w-24 font-mono text-[10px]" />
                </div>
              </div>
              <!-- Checkbox -->
              <div v-else-if="setting.type === 'checkbox'" class="flex items-center justify-between py-1">
                <span class="text-[11px] font-medium text-gray-500">{{ setting.label }}</span>
                <UToggle v-model="setting.value" size="sm" />
              </div>
              <!-- Range -->
              <div v-else-if="setting.type === 'range'" class="space-y-1">
                <div class="flex items-center justify-between">
                  <p class="text-[11px] font-medium text-gray-500">{{ setting.label }}</p>
                  <span class="text-[10px] text-gray-400">{{ setting.value }}</span>
                </div>
                <input type="range" :min="setting.min" :max="setting.max" v-model.number="setting.value" class="w-full accent-primary-500" />
              </div>
              <!-- Image -->
              <div v-else-if="setting.type === 'image'" class="space-y-1">
                <p class="text-[11px] font-medium text-gray-500">{{ setting.label }}</p>
                <div v-if="setting.value" class="relative group w-full h-20 rounded border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900 cursor-pointer" @click="openMediaPicker((urls) => { setting.value = urls[0] })">
                  <img :src="setting.value" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                    <UIcon name="i-lucide-pencil" class="w-4 h-4 text-white" />
                  </div>
                  <button class="absolute top-1 right-1 w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10" @click.stop="setting.value = ''">
                    <UIcon name="i-lucide-x" class="w-3 h-3" />
                  </button>
                </div>
                <button v-else class="w-full h-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded flex items-center justify-center gap-1 text-[11px] text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" @click="openMediaPicker((urls) => { setting.value = urls[0] })">
                  <UIcon name="i-lucide-image-plus" class="w-4 h-4" />
                  Subir
                </button>
              </div>
              <!-- Product picker -->
              <ThemeEditorProductPickerModal
                v-else-if="setting.type === 'product-picker'"
                :model-value="setting.value || ''"
                :label="setting.label"
                @update:model-value="(v: string) => updateSetting(editingSettings!, setting.key, v)"
              />
              <!-- Collection picker -->
              <ThemeEditorCollectionPickerModal
                v-else-if="setting.type === 'collection-picker'"
                :model-value="setting.value || ''"
                :label="setting.label"
                @update:model-value="(v: string) => updateSetting(editingSettings!, setting.key, v)"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- ═══ ADD SECTION MODAL ═══ -->
    <UModal v-model="showAddSection" :ui="{ width: 'sm:max-w-lg' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', body: { padding: 'p-0' } }">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Añadir sección</h3>
              <p class="text-[12px] text-gray-500 mt-0.5">Elige una sección para añadir a tu plantilla</p>
            </div>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="showAddSection = false; addSectionCategory = null" />
          </div>
        </template>
        <div class="max-h-[420px] overflow-y-auto">
          <!-- Category tabs -->
          <div class="flex flex-wrap gap-1.5 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
            <button
              class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
              :class="!addSectionCategory ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-600 hover:bg-gray-200/60 dark:hover:bg-gray-800'"
              @click="addSectionCategory = null"
            >Todas</button>
            <button
              v-for="cat in categories"
              :key="cat.key"
              class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1"
              :class="addSectionCategory === cat.key ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-600 hover:bg-gray-200/60 dark:hover:bg-gray-800'"
              @click="addSectionCategory = cat.key"
            >
              <UIcon :name="cat.icon" class="w-3 h-3" />
              {{ cat.label }}
            </button>
          </div>
          <!-- Section list -->
          <div class="p-2 space-y-0.5">
            <template v-for="item in (addSectionCategory ? registry.filter(s => s.category === addSectionCategory) : registry)" :key="item.type">
              <button
                class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left group/add"
                @click="addSection(item.type)"
              >
                <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover/add:bg-primary-50 dark:group-hover/add:bg-primary-900/20 transition-colors">
                  <UIcon :name="item.icon" class="w-4 h-4 text-gray-500 group-hover/add:text-primary-600 transition-colors" />
                </div>
                <div class="min-w-0">
                  <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ item.label }}</p>
                  <p class="text-[11px] text-gray-400 truncate">{{ item.description }}</p>
                </div>
              </button>
            </template>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- ═══ SETTINGS GROUP DISCARD MODAL ═══ -->
    <UModal v-model="showSettingsDiscardModal" :ui="{ width: 'sm:max-w-sm' }" :prevent-close="true">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-amber-600" />
            </div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Cambios sin guardar</h3>
          </div>
        </template>
        <p class="text-[13px] text-gray-600 dark:text-gray-400">Tienes cambios sin guardar en este ajuste. Si sales ahora, se perderán.</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" @click="cancelSettingsDiscard">Cancelar</UButton>
            <UButton color="red" variant="soft" size="sm" @click="discardAndProceed">Seguir sin guardar</UButton>
            <UButton color="black" size="sm" class="font-semibold" @click="commitAndProceed">Guardar y continuar</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- ═══ LEAVE GUARD MODAL ═══ -->
    <UModal v-model="showLeaveModal" :ui="{ width: 'sm:max-w-sm' }" :prevent-close="true">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-amber-600" />
            </div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Cambios sin guardar</h3>
          </div>
        </template>
        <p class="text-[13px] text-gray-600 dark:text-gray-400">Tienes cambios sin guardar. ¿Qué deseas hacer?</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" @click="cancelLeave">Cancelar</UButton>
            <UButton color="red" variant="soft" size="sm" @click="leaveAndDiscard">Descartar</UButton>
            <UButton color="black" size="sm" class="font-semibold" @click="leaveAndSave">Guardar y salir</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- ═══ MEDIA PICKER MODAL ═══ -->
    <AppMediaModal v-model="showMediaPicker" @confirm="onMediaPickerConfirm" />
  </div>
</template>
