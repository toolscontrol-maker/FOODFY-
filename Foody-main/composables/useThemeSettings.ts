/* ─────────────────────────────────────────────────────────
   Theme Settings — Schema, types, defaults & helpers
   Centralised composable for the 7-group settings system.
   ───────────────────────────────────────────────────────── */

/* ── Component-style token base ── */
export interface ComponentStyleTokens {
  borderWidth: number
  borderOpacity: number
  radius: number
  shadowOpacity: number
  shadowX: number
  shadowY: number
  shadowBlur: number
}

/* ── Color scheme ── */
export interface ColorScheme {
  id: string
  name: string
  background: string
  text: string
  primary: string
  secondary: string
  buttons: string
  borders: string
}

/* ── Full global settings shape ── */
export interface ThemeGlobalSettings {
  identity: {
    logo: string
    logoWidth: number
    favicon: string
  }
  colors: {
    schemes: ColorScheme[]
  }
  typography: {
    headingFont: string
    headingScale: number
    bodyFont: string
    bodyScale: number
  }
  layout: {
    pageWidth: number
    sectionSpacing: number
    gridHorizontal: number
    gridVertical: number
  }
  motion: {
    revealOnScroll: boolean
    hoverEffect: 'none' | 'lift' | 'scale' | 'highlight'
  }
  components: {
    buttons: ComponentStyleTokens
    variantPills: ComponentStyleTokens
    inputs: ComponentStyleTokens
    productCards: ComponentStyleTokens & {
      style: 'standard' | 'card' | 'minimal'
      imagePadding: number
      textAlign: 'left' | 'center' | 'right'
      colorScheme: string
    }
    containers: ComponentStyleTokens
    media: ComponentStyleTokens
  }
  cart: {
    type: 'drawer' | 'page'
    showVendor: boolean
    enableNote: boolean
    drawerCollection: string
    drawerColorScheme: string
  }
}

/* ── Font catalog ── */
export const FONT_OPTIONS = [
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Arimo', value: 'Arimo' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'DM Sans', value: 'DM Sans' },
  { label: 'Nunito', value: 'Nunito' },
]

/* ── Hover effect options ── */
export const HOVER_EFFECT_OPTIONS = [
  { label: 'Ninguna', value: 'none' },
  { label: 'Elevación suave', value: 'lift' },
  { label: 'Escala suave', value: 'scale' },
  { label: 'Resaltado', value: 'highlight' },
]

/* ── Cart type options ── */
export const CART_TYPE_OPTIONS = [
  { label: 'Lateral', value: 'drawer' },
  { label: 'Página completa', value: 'page' },
]

/* ── Product card style options ── */
export const PRODUCT_CARD_STYLE_OPTIONS = [
  { label: 'Estándar', value: 'standard' },
  { label: 'Tarjeta', value: 'card' },
  { label: 'Mínimo', value: 'minimal' },
]

/* ── Text align options ── */
export const TEXT_ALIGN_OPTIONS = [
  { label: 'Izquierda', value: 'left' },
  { label: 'Centro', value: 'center' },
  { label: 'Derecha', value: 'right' },
]

/* ── Default component-style base factory ── */
function baseStyle(overrides: Partial<ComponentStyleTokens> = {}): ComponentStyleTokens {
  return {
    borderWidth: 0,
    borderOpacity: 100,
    radius: 0,
    shadowOpacity: 0,
    shadowX: 0,
    shadowY: 4,
    shadowBlur: 5,
    ...overrides,
  }
}

/* ── Default color schemes ── */
function defaultSchemes(): ColorScheme[] {
  return [
    { id: 'scheme-1', name: 'Esquema 1', background: '#ffffff', text: '#111827', primary: '#e63946', secondary: '#457b9d', buttons: '#e63946', borders: '#e5e7eb' },
    { id: 'scheme-2', name: 'Esquema 2', background: '#f9fafb', text: '#1f2937', primary: '#2563eb', secondary: '#3b82f6', buttons: '#2563eb', borders: '#d1d5db' },
    { id: 'scheme-3', name: 'Esquema 3', background: '#111827', text: '#f9fafb', primary: '#f59e0b', secondary: '#fbbf24', buttons: '#f59e0b', borders: '#374151' },
    { id: 'scheme-4', name: 'Esquema 4', background: '#fef3c7', text: '#78350f', primary: '#d97706', secondary: '#b45309', buttons: '#d97706', borders: '#fde68a' },
  ]
}

/* ── Factory: create default global settings ── */
export function createDefaultGlobalSettings(): ThemeGlobalSettings {
  return {
    identity: {
      logo: '',
      logoWidth: 50,
      favicon: '',
    },
    colors: {
      schemes: defaultSchemes(),
    },
    typography: {
      headingFont: 'Montserrat',
      headingScale: 110,
      bodyFont: 'Arimo',
      bodyScale: 100,
    },
    layout: {
      pageWidth: 1200,
      sectionSpacing: 0,
      gridHorizontal: 28,
      gridVertical: 28,
    },
    motion: {
      revealOnScroll: true,
      hoverEffect: 'none',
    },
    components: {
      buttons: baseStyle({ borderWidth: 1, borderOpacity: 100, radius: 0 }),
      variantPills: baseStyle({ borderWidth: 1, borderOpacity: 55, radius: 4 }),
      inputs: baseStyle({ borderWidth: 1, borderOpacity: 55, radius: 26 }),
      productCards: {
        ...baseStyle({ borderWidth: 0, borderOpacity: 100, radius: 4 }),
        style: 'standard',
        imagePadding: 0,
        textAlign: 'left',
        colorScheme: 'scheme-1',
      },
      containers: baseStyle({ radius: 20, borderOpacity: 10 }),
      media: baseStyle({ radius: 20, borderOpacity: 10 }),
    },
    cart: {
      type: 'drawer',
      showVendor: false,
      enableNote: false,
      drawerCollection: '',
      drawerColorScheme: 'scheme-1',
    },
  }
}

/* ── Settings groups definition (menu structure) ── */
export interface SettingsGroup {
  key: string
  label: string
  icon: string
  description: string
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  { key: 'identity', label: 'Identidad', icon: 'i-lucide-fingerprint', description: 'Logo, favicon e identidad de marca' },
  { key: 'colors', label: 'Colores', icon: 'i-lucide-palette', description: 'Esquemas de color globales' },
  { key: 'typography', label: 'Tipografía', icon: 'i-lucide-type', description: 'Fuentes y escalas de texto' },
  { key: 'layout', label: 'Layout', icon: 'i-lucide-layout', description: 'Ancho de página, espaciados y cuadrícula' },
  { key: 'motion', label: 'Movimiento', icon: 'i-lucide-sparkles', description: 'Animaciones y efectos hover' },
  { key: 'components', label: 'Componentes', icon: 'i-lucide-component', description: 'Botones, entradas, tarjetas y contenedores' },
  { key: 'cart', label: 'Carrito', icon: 'i-lucide-shopping-cart', description: 'Tipo de carrito y opciones' },
]

/* ── Component subgroups ── */
export interface ComponentSubgroup {
  key: keyof ThemeGlobalSettings['components']
  label: string
  icon: string
}

export const COMPONENT_SUBGROUPS: ComponentSubgroup[] = [
  { key: 'buttons', label: 'Botones', icon: 'i-lucide-rectangle-horizontal' },
  { key: 'variantPills', label: 'Botones de variantes', icon: 'i-lucide-toggle-left' },
  { key: 'inputs', label: 'Entradas', icon: 'i-lucide-text-cursor-input' },
  { key: 'productCards', label: 'Tarjetas de producto', icon: 'i-lucide-credit-card' },
  { key: 'containers', label: 'Contenedores', icon: 'i-lucide-square' },
  { key: 'media', label: 'Multimedia', icon: 'i-lucide-image' },
]

/* ── Helper: compute CSS box-shadow from tokens ── */
export function tokenToBoxShadow(t: ComponentStyleTokens): string {
  if (t.shadowOpacity === 0) return 'none'
  const a = Math.round(t.shadowOpacity * 2.55)
  return `${t.shadowX}px ${t.shadowY}px ${t.shadowBlur}px rgba(0,0,0,${(a / 255).toFixed(2)})`
}

/* ── Helper: compute CSS border from tokens ── */
export function tokenToBorder(t: ComponentStyleTokens, color = '#000000'): string {
  if (t.borderWidth === 0) return 'none'
  const a = Math.round(t.borderOpacity * 2.55)
  const hex = color
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${t.borderWidth}px solid rgba(${r},${g},${b},${(a / 255).toFixed(2)})`
}

/* ── Helper: deep equality check (handles objects + arrays) ── */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false
  const ka = Object.keys(a), kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  return ka.every(k => deepEqual(a[k], b[k]))
}

/* ── Helper: resolve scheme by id ── */
export function resolveScheme(schemes: ColorScheme[], id: string): ColorScheme {
  return schemes.find(s => s.id === id) ?? schemes[0]
}

/* ── Composable ── */
export function useThemeSettings() {
  return {
    SETTINGS_GROUPS,
    COMPONENT_SUBGROUPS,
    FONT_OPTIONS,
    HOVER_EFFECT_OPTIONS,
    CART_TYPE_OPTIONS,
    PRODUCT_CARD_STYLE_OPTIONS,
    TEXT_ALIGN_OPTIONS,
    createDefaultGlobalSettings,
    tokenToBoxShadow,
    tokenToBorder,
    resolveScheme,
  }
}
