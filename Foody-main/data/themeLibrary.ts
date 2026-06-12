/* ─────────────────────────────────────────────────────────
   Theme Library — Static definitions for installable themes.
   These live in code, not in DB. Installing one writes it to DB.
   ───────────────────────────────────────────────────────── */

import type { ThemeGlobalSettings } from '~/composables/useThemeSettings'

/* ── Helper ── */
const baseStyle = (overrides: Record<string, number> = {}) => ({
  borderWidth: 0, borderOpacity: 100, radius: 0,
  shadowOpacity: 0, shadowX: 0, shadowY: 0, shadowBlur: 0,
  ...overrides,
})

/* ── Section/Block definition types ── */
export interface LibrarySettingDef {
  key: string
  type: string
  label: string
  value: any
  default: any
  options?: any[]
  min?: number
  max?: number
}

export interface LibraryBlockDef {
  type: string
  displayName: string
  hidden: boolean
  settings: LibrarySettingDef[]
}

export interface LibrarySectionDef {
  type: string
  displayName: string
  hidden: boolean
  settings: LibrarySettingDef[]
  blocks?: LibraryBlockDef[]
}

export interface LibraryTemplateDef {
  name: string
  label: string
  sections: LibrarySectionDef[]
}

export interface LibraryTheme {
  id: string
  name: string
  description: string
  previewImage: string
  tags: string[]
  globalSettings: ThemeGlobalSettings
  templates: {
    home: LibraryTemplateDef
    product: LibraryTemplateDef
    collection: LibraryTemplateDef
    page: LibraryTemplateDef
  }
}

/* ═══════════════════════════════════════════════════════
   TEMA 1: MERIDIONAL
   Inspirado en Calasanta — editorial mediterráneo, lujo quieto
   ═══════════════════════════════════════════════════════ */
export const meridionalTheme: LibraryTheme = {
  id: 'theme-meridional',
  name: 'Meridional',
  description: 'Template editorial mediterráneo. Espacioso, refinado y tipográficamente expresivo. Para marcas con carácter propio.',
  previewImage: '',
  tags: ['minimal', 'editorial', 'luxury', 'premium', 'mediterranean'],
  globalSettings: {
    identity: { logo: '', logoWidth: 50, favicon: '' },
    colors: {
      schemes: [
        { id: 'scheme-1', name: 'Crema', background: '#fafaf8', text: '#1a1209', primary: '#c9a96e', secondary: '#6b5c4a', buttons: '#1a1209', borders: '#e0d8cc' },
        { id: 'scheme-2', name: 'Oscuro', background: '#1a1209', text: '#fafaf8', primary: '#c9a96e', secondary: '#9e8e7c', buttons: '#c9a96e', borders: '#3a2e24' },
        { id: 'scheme-3', name: 'Arena', background: '#f5efe3', text: '#1a1209', primary: '#c9a96e', secondary: '#6b5c4a', buttons: '#1a1209', borders: '#d4c8b4' },
        { id: 'scheme-4', name: 'Natural', background: '#ede8de', text: '#1a1209', primary: '#8a6a3a', secondary: '#9e8e7c', buttons: '#1a1209', borders: '#c8bfb0' },
      ],
    },
    typography: { headingFont: 'Inter', headingScale: 100, bodyFont: 'Inter', bodyScale: 95 },
    layout: { pageWidth: 1200, sectionSpacing: 0, gridHorizontal: 0, gridVertical: 0 },
    motion: { revealOnScroll: true, hoverEffect: 'scale' as const },
    components: {
      buttons:      { ...baseStyle({ borderWidth: 0, radius: 0 }) },
      variantPills: { ...baseStyle({ borderWidth: 1, radius: 0 }) },
      inputs:       { ...baseStyle({ borderWidth: 1, radius: 0 }) },
      productCards: { ...baseStyle({ borderWidth: 0, radius: 0 }), style: 'standard' as const, imagePadding: 0, textAlign: 'left' as const, colorScheme: 'scheme-1' },
      containers:   { ...baseStyle({ radius: 0, borderOpacity: 10 }) },
      media:        { ...baseStyle({ radius: 0, borderOpacity: 10 }) },
    },
    cart: { type: 'drawer' as const, showVendor: false, enableNote: false, drawerCollection: '', drawerColorScheme: 'scheme-1' },
  },
  templates: {
    home: {
      name: 'index', label: 'Inicio',
      sections: [
        {
          type: 'header', displayName: 'Encabezado', hidden: false,
          settings: [
            { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' },
            { key: 'sticky', type: 'checkbox', label: 'Encabezado fijo', value: true, default: true },
            { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#fafaf8', default: '#fafaf8' },
            { key: 'text_color', type: 'color', label: 'Color de texto', value: '#1a1209', default: '#1a1209' },
            { key: 'transparent', type: 'checkbox', label: 'Transparente sobre hero', value: true, default: false },
          ],
          blocks: [
            { type: 'nav_link', displayName: 'Inicio',    hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'INICIO',    default: 'Inicio' }, { key: 'url', type: 'text', label: 'URL', value: '/', default: '/' }] },
            { type: 'nav_link', displayName: 'Carta',     hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'CARTA',     default: 'Carta' }, { key: 'url', type: 'text', label: 'URL', value: '/menu', default: '/menu' }] },
            { type: 'nav_link', displayName: 'Nosotros',  hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'NOSOTROS',  default: 'Nosotros' }, { key: 'url', type: 'text', label: 'URL', value: '/about', default: '/about' }] },
            { type: 'nav_link', displayName: 'Contacto',  hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'CONTACTO',  default: 'Contacto' }, { key: 'url', type: 'text', label: 'URL', value: '/contact', default: '/contact' }] },
          ],
        },
        {
          type: 'editorial_hero', displayName: 'Hero editorial', hidden: false,
          settings: [
            { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' },
            { key: 'image_mobile', type: 'image', label: 'Imagen mobile', value: '', default: '' },
            { key: 'heading', type: 'text', label: 'Título', value: 'La cocina del mediterráneo', default: '' },
            { key: 'eyebrow', type: 'text', label: 'Etiqueta', value: 'Temporada 2025', default: '' },
            { key: 'heading_position', type: 'select', label: 'Posición', value: 'bottom-left', default: 'bottom-left', options: [] },
            { key: 'text_color', type: 'color', label: 'Color texto', value: '#ffffff', default: '#ffffff' },
            { key: 'show_cta', type: 'checkbox', label: 'Mostrar CTA', value: false, default: false },
            { key: 'cta_text', type: 'text', label: 'Texto CTA', value: 'Ver carta', default: '' },
            { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/menu', default: '/' },
            { key: 'height', type: 'select', label: 'Altura', value: 'full', default: 'full', options: [] },
            { key: 'overlay_start', type: 'range', label: 'Gradiente', value: 30, default: 20, min: 0, max: 60 },
          ],
          blocks: [],
        },
        {
          type: 'marquee', displayName: 'Barra de anuncio', hidden: false,
          settings: [
            { key: 'text', type: 'text', label: 'Texto', value: 'Ingredientes de temporada · Elaboración artesanal · Diseño con alma mediterránea', default: '' },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#1a1209', default: '#1a1209' },
            { key: 'text_color', type: 'color', label: 'Texto', value: '#c9a96e', default: '#ffffff' },
            { key: 'animated', type: 'checkbox', label: 'Animado', value: true, default: false },
            { key: 'dismissible', type: 'checkbox', label: 'Cerrable', value: false, default: true },
          ],
          blocks: [],
        },
        {
          type: 'editorial_gallery', displayName: 'Carta destacada', hidden: false,
          settings: [
            { key: 'title', type: 'text', label: 'Título', value: 'NOVEDADES', default: '' },
            { key: 'title_style', type: 'select', label: 'Estilo', value: 'uppercase', default: 'uppercase', options: [] },
            { key: 'subtitle', type: 'text', label: 'Subtítulo', value: '', default: '' },
            { key: 'columns', type: 'select', label: 'Columnas', value: '3', default: '3', options: [] },
            { key: 'image_ratio', type: 'select', label: 'Ratio', value: 'portrait', default: 'portrait', options: [] },
            { key: 'show_price', type: 'checkbox', label: 'Precio', value: true, default: true },
            { key: 'show_name', type: 'checkbox', label: 'Nombre', value: true, default: true },
            { key: 'gap', type: 'select', label: 'Separación', value: 'small', default: 'small', options: [] },
            { key: 'hover_effect', type: 'select', label: 'Hover', value: 'zoom', default: 'zoom', options: [] },
            { key: 'name_position', type: 'select', label: 'Posición nombre', value: 'below', default: 'below', options: [] },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#fafaf8', default: '#fafaf8' },
            { key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' },
            { key: 'max_products', type: 'range', label: 'Máx. productos', value: 6, default: 6, min: 2, max: 16 },
            { key: 'cta_text', type: 'text', label: 'CTA', value: 'VER CARTA COMPLETA', default: '' },
            { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/menu', default: '/' },
          ],
          blocks: [],
        },
        {
          type: 'brand_manifesto', displayName: 'Nuestra historia', hidden: false,
          settings: [
            { key: 'heading', type: 'text', label: 'Título', value: 'Donde el mar se convierte en mesa', default: '' },
            { key: 'eyebrow', type: 'text', label: 'Etiqueta', value: 'NUESTRA FILOSOFÍA', default: '' },
            { key: 'body', type: 'textarea', label: 'Texto', value: 'Cocinamos con lo que el Mediterráneo nos da en cada estación. Sin prisa, sin atajos. Cada plato es una conversación entre el territorio y quien lo recibe.', default: '' },
            { key: 'layout', type: 'select', label: 'Disposición', value: 'centered', default: 'centered', options: [] },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#f5efe3', default: '#f5efe3' },
            { key: 'text_color', type: 'color', label: 'Texto', value: '#1a1209', default: '#1a1209' },
            { key: 'bg_image', type: 'image', label: 'Imagen de fondo', value: '', default: '' },
            { key: 'overlay_opacity', type: 'range', label: 'Overlay', value: 0, default: 0, min: 0, max: 80 },
            { key: 'show_features', type: 'checkbox', label: 'Features', value: true, default: true },
            { key: 'cta_text', type: 'text', label: 'CTA', value: '', default: '' },
            { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/', default: '/' },
            { key: 'max_width', type: 'select', label: 'Ancho', value: 'medium', default: 'medium', options: [] },
            { key: 'padding_top', type: 'select', label: 'Padding sup.', value: 'lg', default: 'lg', options: [] },
            { key: 'padding_bottom', type: 'select', label: 'Padding inf.', value: 'lg', default: 'lg', options: [] },
          ],
          blocks: [
            { type: 'manifesto_feature', displayName: 'Feature 1', hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'leaf', default: 'leaf', options: [] }, { key: 'title', type: 'text', label: 'Título', value: 'Producto de temporada', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Cambiamos la carta con cada estación.', default: '' }] },
            { type: 'manifesto_feature', displayName: 'Feature 2', hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'gem', default: 'leaf', options: [] }, { key: 'title', type: 'text', label: 'Título', value: 'Elaboración propia', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Todo elaborado en nuestra cocina.', default: '' }] },
            { type: 'manifesto_feature', displayName: 'Feature 3', hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'globe', default: 'leaf', options: [] }, { key: 'title', type: 'text', label: 'Título', value: 'Origen trazable', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Conocemos a cada proveedor.', default: '' }] },
            { type: 'manifesto_feature', displayName: 'Feature 4', hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'shield', default: 'leaf', options: [] }, { key: 'title', type: 'text', label: 'Título', value: 'Sin artificiales', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Cero conservantes. Cero aditivos.', default: '' }] },
          ],
        },
        {
          type: 'collection_selector', displayName: 'Nuestra carta', hidden: false,
          settings: [
            { key: 'title', type: 'text', label: 'Título', value: 'NUESTRA CARTA', default: '' },
            { key: 'eyebrow', type: 'text', label: 'Eyebrow', value: '', default: '' },
            { key: 'layout', type: 'select', label: 'Layout', value: 'tiles', default: 'tiles', options: [] },
            { key: 'tile_ratio', type: 'select', label: 'Ratio', value: 'square', default: 'square', options: [] },
            { key: 'show_name', type: 'checkbox', label: 'Nombre', value: true, default: true },
            { key: 'name_style', type: 'select', label: 'Estilo nombre', value: 'overlay', default: 'overlay', options: [] },
            { key: 'name_transform', type: 'select', label: 'Transform', value: 'uppercase', default: 'uppercase', options: [] },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#fafaf8', default: '#fafaf8' },
            { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [] },
            { key: 'gap', type: 'select', label: 'Gap', value: 'small', default: 'small', options: [] },
          ],
          blocks: [
            { type: 'collection_tile', displayName: 'Entrantes',   hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: 'ENTRANTES',   default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }, { key: 'badge_text', type: 'text', label: 'Badge', value: '', default: '' }, { key: 'cta_url', type: 'text', label: 'URL', value: '/', default: '/' }] },
            { type: 'collection_tile', displayName: 'Principales', hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: 'PRINCIPALES', default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }, { key: 'badge_text', type: 'text', label: 'Badge', value: '', default: '' }, { key: 'cta_url', type: 'text', label: 'URL', value: '/', default: '/' }] },
            { type: 'collection_tile', displayName: 'Postres',     hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: 'POSTRES',     default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }, { key: 'badge_text', type: 'text', label: 'Badge', value: '', default: '' }, { key: 'cta_url', type: 'text', label: 'URL', value: '/', default: '/' }] },
            { type: 'collection_tile', displayName: 'Bebidas',     hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: 'BEBIDAS',     default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }, { key: 'badge_text', type: 'text', label: 'Badge', value: '', default: '' }, { key: 'cta_url', type: 'text', label: 'URL', value: '/', default: '/' }] },
          ],
        },
        {
          type: 'stats_row', displayName: 'Datos', hidden: false,
          settings: [
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#1a1209', default: '#1a1209' },
            { key: 'text_color', type: 'color', label: 'Texto', value: '#fafaf8', default: '#ffffff' },
          ],
          blocks: [
            { type: 'stat', displayName: 'Stat 1', hidden: false, settings: [{ key: 'value', type: 'text', label: 'Valor', value: '100%', default: '' }, { key: 'label', type: 'text', label: 'Etiqueta', value: 'Producto local', default: '' }] },
            { type: 'stat', displayName: 'Stat 2', hidden: false, settings: [{ key: 'value', type: 'text', label: 'Valor', value: '0', default: '' }, { key: 'label', type: 'text', label: 'Etiqueta', value: 'Conservantes', default: '' }] },
            { type: 'stat', displayName: 'Stat 3', hidden: false, settings: [{ key: 'value', type: 'text', label: 'Valor', value: '+12', default: '' }, { key: 'label', type: 'text', label: 'Etiqueta', value: 'Años de cocina', default: '' }] },
            { type: 'stat', displayName: 'Stat 4', hidden: false, settings: [{ key: 'value', type: 'text', label: 'Valor', value: '4', default: '' }, { key: 'label', type: 'text', label: 'Etiqueta', value: 'Estaciones, 4 cartas', default: '' }] },
          ],
        },
        {
          type: 'newsletter', displayName: 'Newsletter', hidden: false,
          settings: [
            { key: 'heading', type: 'text', label: 'Título', value: 'SÉ PARTE DE NUESTRA MESA', default: '' },
            { key: 'subheading', type: 'text', label: 'Subtítulo', value: 'Carta de temporada, novedades y reservas especiales.', default: '' },
            { key: 'placeholder', type: 'text', label: 'Placeholder', value: 'Tu email', default: 'Tu email' },
            { key: 'button_text', type: 'text', label: 'Botón', value: 'SUSCRIBIRME', default: 'Suscribirme' },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#ede8de', default: '#f3f4f6' },
            { key: 'text_color', type: 'color', label: 'Texto', value: '#1a1209', default: '#111827' },
          ],
          blocks: [],
        },
        {
          type: 'footer', displayName: 'Pie de página', hidden: false,
          settings: [
            { key: 'show_social', type: 'checkbox', label: 'Redes', value: true, default: true },
            { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#1a1209', default: '#111827' },
            { key: 'text_color', type: 'color', label: 'Texto', value: '#d4c8b8', default: '#d1d5db' },
            { key: 'columns_count', type: 'select', label: 'Columnas', value: '3', default: '4', options: [] },
          ],
          blocks: [
            { type: 'footer_column', displayName: 'Contacto', hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Contacto', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: '', default: '' }] },
            { type: 'footer_column', displayName: 'Horario',  hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Horario', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Mar-Dom: 13:00 - 23:00', default: '' }] },
            { type: 'footer_column', displayName: 'Legal',    hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Legal', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Aviso legal\nPrivacidad\nCookies', default: '' }] },
          ],
        },
      ],
    },
    product: {
      name: 'product', label: 'Producto',
      sections: [
        { type: 'header', displayName: 'Encabezado', hidden: false, settings: [{ key: 'sticky', type: 'checkbox', label: 'Fijo', value: true, default: true }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#fafaf8', default: '#ffffff' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#1a1209', default: '#111827' }, { key: 'transparent', type: 'checkbox', label: 'Transparente', value: false, default: false }, { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' }], blocks: [] },
        { type: 'product_detail', displayName: 'Detalle del producto', hidden: false, settings: [{ key: 'bg_color', type: 'color', label: 'Fondo', value: '#fafaf8', default: '#ffffff' }, { key: 'gallery_position', type: 'select', label: 'Galería', value: 'left', default: 'left', options: [] }, { key: 'show_gallery', type: 'checkbox', label: 'Galería', value: true, default: true }, { key: 'show_badges', type: 'checkbox', label: 'Badges', value: false, default: true }, { key: 'show_shipping', type: 'checkbox', label: 'Envío', value: true, default: true }, { key: 'show_accordion', type: 'checkbox', label: 'Acordeones', value: true, default: true }, { key: 'show_reviews', type: 'checkbox', label: 'Reseñas', value: false, default: true }, { key: 'productId', type: 'product-picker', label: 'Producto', value: '', default: '' }], blocks: [] },
        { type: 'brand_manifesto', displayName: 'El detalle lo es todo', hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Título', value: 'EL DETALLE LO ES TODO', default: '' }, { key: 'eyebrow', type: 'text', label: 'Eyebrow', value: '', default: '' }, { key: 'body', type: 'textarea', label: 'Texto', value: '', default: '' }, { key: 'layout', type: 'select', label: 'Layout', value: 'left-aligned', default: 'centered', options: [] }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#f5efe3', default: '#f5efe3' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#1a1209', default: '#1a1209' }, { key: 'bg_image', type: 'image', label: 'Imagen', value: '', default: '' }, { key: 'overlay_opacity', type: 'range', label: 'Overlay', value: 0, default: 0, min: 0, max: 80 }, { key: 'show_features', type: 'checkbox', label: 'Features', value: true, default: true }, { key: 'cta_text', type: 'text', label: 'CTA', value: '', default: '' }, { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/', default: '/' }, { key: 'max_width', type: 'select', label: 'Ancho', value: 'medium', default: 'medium', options: [] }, { key: 'padding_top', type: 'select', label: 'Padding sup.', value: 'md', default: 'lg', options: [] }, { key: 'padding_bottom', type: 'select', label: 'Padding inf.', value: 'md', default: 'lg', options: [] }], blocks: [] },
        { type: 'trust_icons', displayName: 'Garantías', hidden: false, settings: [{ key: 'title', type: 'text', label: 'Título', value: '', default: '' }, { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [] }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#fafaf8', default: '#ffffff' }, { key: 'icon_color', type: 'color', label: 'Iconos', value: '#c9a96e', default: '#059669' }], blocks: [] },
        { type: 'footer', displayName: 'Pie de página', hidden: false, settings: [{ key: 'bg_color', type: 'color', label: 'Fondo', value: '#1a1209', default: '#111827' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#d4c8b8', default: '#d1d5db' }, { key: 'show_social', type: 'checkbox', label: 'Redes', value: true, default: true }, { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' }, { key: 'columns_count', type: 'select', label: 'Columnas', value: '3', default: '4', options: [] }], blocks: [] },
      ],
    },
    collection: {
      name: 'collection', label: 'Colección',
      sections: [
        { type: 'header', displayName: 'Encabezado', hidden: false, settings: [{ key: 'sticky', type: 'checkbox', label: 'Fijo', value: true, default: true }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#fafaf8', default: '#ffffff' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#1a1209', default: '#111827' }, { key: 'transparent', type: 'checkbox', label: 'Transparente', value: false, default: false }, { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' }], blocks: [] },
        { type: 'editorial_gallery', displayName: 'Productos', hidden: false, settings: [{ key: 'title', type: 'text', label: 'Título', value: '', default: '' }, { key: 'title_style', type: 'select', label: 'Estilo', value: 'uppercase', default: 'uppercase', options: [] }, { key: 'subtitle', type: 'text', label: 'Subtítulo', value: '', default: '' }, { key: 'columns', type: 'select', label: 'Columnas', value: '3', default: '3', options: [] }, { key: 'image_ratio', type: 'select', label: 'Ratio', value: 'portrait', default: 'portrait', options: [] }, { key: 'show_price', type: 'checkbox', label: 'Precio', value: true, default: true }, { key: 'show_name', type: 'checkbox', label: 'Nombre', value: true, default: true }, { key: 'gap', type: 'select', label: 'Gap', value: 'small', default: 'small', options: [] }, { key: 'hover_effect', type: 'select', label: 'Hover', value: 'zoom', default: 'zoom', options: [] }, { key: 'name_position', type: 'select', label: 'Nombre pos.', value: 'below', default: 'below', options: [] }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#fafaf8', default: '#fafaf8' }, { key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'max_products', type: 'range', label: 'Máx.', value: 12, default: 6, min: 2, max: 16 }, { key: 'cta_text', type: 'text', label: 'CTA', value: '', default: '' }, { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/', default: '/' }], blocks: [] },
        { type: 'footer', displayName: 'Pie de página', hidden: false, settings: [{ key: 'bg_color', type: 'color', label: 'Fondo', value: '#1a1209', default: '#111827' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#d4c8b8', default: '#d1d5db' }, { key: 'show_social', type: 'checkbox', label: 'Redes', value: false, default: true }, { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' }, { key: 'columns_count', type: 'select', label: 'Columnas', value: '2', default: '4', options: [] }], blocks: [] },
      ],
    },
    page: {
      name: 'page', label: 'Página',
      sections: [
        { type: 'header', displayName: 'Encabezado', hidden: false, settings: [{ key: 'sticky', type: 'checkbox', label: 'Fijo', value: true, default: true }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#fafaf8', default: '#ffffff' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#1a1209', default: '#111827' }, { key: 'transparent', type: 'checkbox', label: 'Transparente', value: false, default: false }, { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' }], blocks: [] },
        { type: 'rich_text', displayName: 'Contenido', hidden: false, settings: [{ key: 'content', type: 'textarea', label: 'Contenido', value: '', default: '' }, { key: 'alignment', type: 'select', label: 'Alineación', value: 'left', default: 'center', options: [] }, { key: 'heading', type: 'text', label: 'Título', value: '', default: '' }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#fafaf8', default: '#ffffff' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#1a1209', default: '#374151' }, { key: 'max_width', type: 'select', label: 'Ancho', value: 'md', default: 'md', options: [] }], blocks: [] },
        { type: 'footer', displayName: 'Pie de página', hidden: false, settings: [{ key: 'bg_color', type: 'color', label: 'Fondo', value: '#1a1209', default: '#111827' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#d4c8b8', default: '#d1d5db' }, { key: 'show_social', type: 'checkbox', label: 'Redes', value: false, default: true }, { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' }, { key: 'columns_count', type: 'select', label: 'Columnas', value: '2', default: '4', options: [] }], blocks: [] },
      ],
    },
  },
}

/* ═══════════════════════════════════════════════════════
   TEMA 2: DROP
   Inspirado en Nude Project — drop culture, urgencia, comunidad
   ═══════════════════════════════════════════════════════ */
export const dropTheme: LibraryTheme = {
  id: 'theme-drop',
  name: 'Drop',
  description: 'Template para marcas de carácter fuerte y cultura del lanzamiento. Urgencia real, cross-sell contextual y comunidad visible.',
  previewImage: '',
  tags: ['bold', 'streetwear', 'drop', 'community', 'urgency'],
  globalSettings: {
    identity: { logo: '', logoWidth: 50, favicon: '' },
    colors: {
      schemes: [
        { id: 'scheme-1', name: 'Blanco', background: '#ffffff', text: '#0f0f0f', primary: '#e63946', secondary: '#3d3d3d', buttons: '#0f0f0f', borders: '#e5e5e5' },
        { id: 'scheme-2', name: 'Negro', background: '#0f0f0f', text: '#ffffff', primary: '#e63946', secondary: '#767676', buttons: '#e63946', borders: '#1f1f1f' },
        { id: 'scheme-3', name: 'Gris', background: '#f5f5f5', text: '#0f0f0f', primary: '#0f0f0f', secondary: '#767676', buttons: '#0f0f0f', borders: '#e5e5e5' },
        { id: 'scheme-4', name: 'Rojo', background: '#ffffff', text: '#0f0f0f', primary: '#c1121f', secondary: '#3d3d3d', buttons: '#c1121f', borders: '#e5e5e5' },
      ],
    },
    typography: { headingFont: 'Inter', headingScale: 105, bodyFont: 'Inter', bodyScale: 100 },
    layout: { pageWidth: 1280, sectionSpacing: 0, gridHorizontal: 0, gridVertical: 0 },
    motion: { revealOnScroll: false, hoverEffect: 'none' as const },
    components: {
      buttons:      { ...baseStyle({ borderWidth: 0, radius: 2 }) },
      variantPills: { ...baseStyle({ borderWidth: 1, radius: 2 }) },
      inputs:       { ...baseStyle({ borderWidth: 1, radius: 2 }) },
      productCards: { ...baseStyle({ borderWidth: 0, radius: 0 }), style: 'standard' as const, imagePadding: 0, textAlign: 'left' as const, colorScheme: 'scheme-1' },
      containers:   { ...baseStyle({ radius: 2, borderOpacity: 10 }) },
      media:        { ...baseStyle({ radius: 0, borderOpacity: 0 }) },
    },
    cart: { type: 'drawer' as const, showVendor: false, enableNote: false, drawerCollection: '', drawerColorScheme: 'scheme-1' },
  },
  templates: {
    home: {
      name: 'index', label: 'Inicio',
      sections: [
        {
          type: 'drop_announcement', displayName: 'Barra de lanzamiento', hidden: false,
          settings: [
            { key: 'badge_text', type: 'text', label: 'Badge', value: 'NUEVO', default: 'NUEVO' },
            { key: 'show_badge', type: 'checkbox', label: 'Mostrar badge', value: true, default: true },
            { key: 'badge_animate', type: 'checkbox', label: 'Animar badge', value: true, default: true },
            { key: 'heading', type: 'text', label: 'Texto', value: 'Nueva carta disponible ahora', default: '' },
            { key: 'tagline', type: 'text', label: 'Tagline', value: '', default: '' },
            { key: 'cta_text', type: 'text', label: 'CTA', value: 'Ver carta', default: 'Ver carta' },
            { key: 'cta_url', type: 'text', label: 'URL', value: '/menu', default: '/' },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#0f0f0f', default: '#0f0f0f' },
            { key: 'text_color', type: 'color', label: 'Texto', value: '#ffffff', default: '#ffffff' },
            { key: 'dismissible', type: 'checkbox', label: 'Cerrable', value: false, default: false },
            { key: 'height', type: 'select', label: 'Altura', value: 'compact', default: 'compact', options: [] },
          ],
          blocks: [],
        },
        {
          type: 'header', displayName: 'Encabezado', hidden: false,
          settings: [
            { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' },
            { key: 'sticky', type: 'checkbox', label: 'Fijo', value: true, default: true },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#ffffff', default: '#ffffff' },
            { key: 'text_color', type: 'color', label: 'Texto', value: '#0f0f0f', default: '#111827' },
            { key: 'transparent', type: 'checkbox', label: 'Transparente', value: false, default: false },
          ],
          blocks: [
            { type: 'nav_link', displayName: 'Novedades',   hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Novedades',   default: 'Inicio' }, { key: 'url', type: 'text', label: 'URL', value: '/menu', default: '/' }] },
            { type: 'nav_link', displayName: 'Más pedidos', hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Más pedidos', default: 'Carta' }, { key: 'url', type: 'text', label: 'URL', value: '/menu', default: '/menu' }] },
            { type: 'nav_link', displayName: 'Carta',       hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Carta',       default: 'Nosotros' }, { key: 'url', type: 'text', label: 'URL', value: '/menu', default: '/about' }] },
            { type: 'nav_link', displayName: 'Tiendas',     hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Tiendas',     default: 'Contacto' }, { key: 'url', type: 'text', label: 'URL', value: '/tiendas', default: '/contact' }] },
          ],
        },
        {
          type: 'editorial_hero', displayName: 'Hero campaña', hidden: false,
          settings: [
            { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' },
            { key: 'image_mobile', type: 'image', label: 'Imagen mobile', value: '', default: '' },
            { key: 'heading', type: 'text', label: 'Título', value: 'La nueva carta está aquí', default: '' },
            { key: 'eyebrow', type: 'text', label: 'Eyebrow', value: 'SS25 · 01', default: '' },
            { key: 'heading_position', type: 'select', label: 'Posición', value: 'center', default: 'bottom-left', options: [] },
            { key: 'text_color', type: 'color', label: 'Texto', value: '#ffffff', default: '#ffffff' },
            { key: 'show_cta', type: 'checkbox', label: 'Mostrar CTA', value: true, default: false },
            { key: 'cta_text', type: 'text', label: 'Texto CTA', value: 'Pedir ahora', default: '' },
            { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/menu', default: '/' },
            { key: 'height', type: 'select', label: 'Altura', value: 'large', default: 'full', options: [] },
            { key: 'overlay_start', type: 'range', label: 'Gradiente', value: 25, default: 20, min: 0, max: 60 },
          ],
          blocks: [],
        },
        {
          type: 'featured_collection', displayName: 'Novedades', hidden: false,
          settings: [
            { key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' },
            { key: 'title', type: 'text', label: 'Título', value: 'Novedades', default: 'Destacados' },
            { key: 'subtitle', type: 'text', label: 'Subtítulo', value: '', default: '' },
            { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [] },
            { key: 'show_price', type: 'checkbox', label: 'Precio', value: true, default: true },
            { key: 'show_badge', type: 'checkbox', label: 'Badge', value: true, default: true },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#ffffff', default: '#ffffff' },
            { key: 'max_products', type: 'range', label: 'Máx.', value: 8, default: 8, min: 2, max: 16 },
          ],
          blocks: [],
        },
        {
          type: 'shop_the_look', displayName: 'Completa el pedido', hidden: false,
          settings: [
            { key: 'heading', type: 'text', label: 'Título', value: 'Completa el pedido', default: 'Completa el pedido' },
            { key: 'editorial_image', type: 'image', label: 'Imagen', value: '', default: '' },
            { key: 'image_position', type: 'select', label: 'Imagen pos.', value: 'left', default: 'left', options: [] },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#f5f5f5', default: '#ffffff' },
            { key: 'show_total_price', type: 'checkbox', label: 'Total', value: false, default: false },
            { key: 'cta_add_all_text', type: 'text', label: 'Añadir todo', value: 'Añadir todo al carrito', default: '' },
            { key: 'image_ratio', type: 'select', label: 'Ratio', value: '4:5', default: '4:5', options: [] },
          ],
          blocks: [
            { type: 'look_item', displayName: 'Producto 1', hidden: false, settings: [{ key: 'productId', type: 'product-picker', label: 'Producto', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: '', default: '' }, { key: 'show_sizes', type: 'checkbox', label: 'Variantes', value: true, default: true }] },
            { type: 'look_item', displayName: 'Producto 2', hidden: false, settings: [{ key: 'productId', type: 'product-picker', label: 'Producto', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: '', default: '' }, { key: 'show_sizes', type: 'checkbox', label: 'Variantes', value: true, default: true }] },
            { type: 'look_item', displayName: 'Producto 3', hidden: false, settings: [{ key: 'productId', type: 'product-picker', label: 'Producto', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: '', default: '' }, { key: 'show_sizes', type: 'checkbox', label: 'Variantes', value: true, default: true }] },
          ],
        },
        {
          type: 'best_sellers', displayName: 'Más pedidos', hidden: false,
          settings: [
            { key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' },
            { key: 'title', type: 'text', label: 'Título', value: 'Los más pedidos', default: '' },
            { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [] },
            { key: 'show_ranking', type: 'checkbox', label: 'Ranking', value: false, default: true },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#ffffff', default: '#f9fafb' },
          ],
          blocks: [],
        },
        {
          type: 'newsletter', displayName: 'Newsletter', hidden: false,
          settings: [
            { key: 'heading', type: 'text', label: 'Título', value: '10% de descuento en tu primer pedido', default: '' },
            { key: 'subheading', type: 'text', label: 'Subtítulo', value: 'Suscríbete y recibe tu código al instante.', default: '' },
            { key: 'placeholder', type: 'text', label: 'Placeholder', value: 'Tu email', default: 'Tu email' },
            { key: 'button_text', type: 'text', label: 'Botón', value: 'Conseguir 10%', default: 'Suscribirme' },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#0f0f0f', default: '#f3f4f6' },
            { key: 'text_color', type: 'color', label: 'Texto', value: '#ffffff', default: '#111827' },
          ],
          blocks: [],
        },
        {
          type: 'footer', displayName: 'Pie de página', hidden: false,
          settings: [
            { key: 'show_social', type: 'checkbox', label: 'Redes', value: true, default: true },
            { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' },
            { key: 'bg_color', type: 'color', label: 'Fondo', value: '#0f0f0f', default: '#111827' },
            { key: 'text_color', type: 'color', label: 'Texto', value: '#767676', default: '#d1d5db' },
            { key: 'columns_count', type: 'select', label: 'Columnas', value: '4', default: '4', options: [] },
          ],
          blocks: [
            { type: 'footer_column', displayName: 'Marca',   hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'La marca', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Sobre nosotros\nHistoria\nTiendas', default: '' }] },
            { type: 'footer_column', displayName: 'Soporte', hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Soporte', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Devoluciones\nPedido\nContacto', default: '' }] },
            { type: 'footer_column', displayName: 'Legal',   hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Legal', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Aviso legal\nPrivacidad\nCookies', default: '' }] },
          ],
        },
      ],
    },
    product: {
      name: 'product', label: 'Producto',
      sections: [
        { type: 'drop_announcement', displayName: 'Barra de lanzamiento', hidden: false, settings: [{ key: 'badge_text', type: 'text', label: 'Badge', value: 'NUEVO', default: 'NUEVO' }, { key: 'show_badge', type: 'checkbox', label: 'Badge', value: true, default: true }, { key: 'badge_animate', type: 'checkbox', label: 'Animar', value: true, default: true }, { key: 'heading', type: 'text', label: 'Texto', value: 'Nueva carta disponible ahora', default: '' }, { key: 'tagline', type: 'text', label: 'Tagline', value: '', default: '' }, { key: 'cta_text', type: 'text', label: 'CTA', value: 'Ver carta', default: 'Ver carta' }, { key: 'cta_url', type: 'text', label: 'URL', value: '/menu', default: '/' }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#0f0f0f', default: '#0f0f0f' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#ffffff', default: '#ffffff' }, { key: 'dismissible', type: 'checkbox', label: 'Cerrable', value: false, default: false }, { key: 'height', type: 'select', label: 'Altura', value: 'compact', default: 'compact', options: [] }], blocks: [] },
        { type: 'header', displayName: 'Encabezado', hidden: false, settings: [{ key: 'sticky', type: 'checkbox', label: 'Fijo', value: true, default: true }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#ffffff', default: '#ffffff' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#0f0f0f', default: '#111827' }, { key: 'transparent', type: 'checkbox', label: 'Transparente', value: false, default: false }, { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' }], blocks: [] },
        { type: 'product_detail', displayName: 'Detalle del producto', hidden: false, settings: [{ key: 'bg_color', type: 'color', label: 'Fondo', value: '#ffffff', default: '#ffffff' }, { key: 'gallery_position', type: 'select', label: 'Galería', value: 'left', default: 'left', options: [] }, { key: 'show_gallery', type: 'checkbox', label: 'Galería', value: true, default: true }, { key: 'show_badges', type: 'checkbox', label: 'Badges', value: true, default: true }, { key: 'show_shipping', type: 'checkbox', label: 'Envío', value: true, default: true }, { key: 'show_accordion', type: 'checkbox', label: 'Acordeones', value: true, default: true }, { key: 'show_reviews', type: 'checkbox', label: 'Reseñas', value: false, default: true }, { key: 'productId', type: 'product-picker', label: 'Producto', value: '', default: '' }], blocks: [] },
        { type: 'shop_the_look', displayName: 'Completa el pedido', hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Título', value: 'También te puede gustar', default: '' }, { key: 'editorial_image', type: 'image', label: 'Imagen', value: '', default: '' }, { key: 'image_position', type: 'select', label: 'Pos.', value: 'left', default: 'left', options: [] }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#f5f5f5', default: '#ffffff' }, { key: 'show_total_price', type: 'checkbox', label: 'Total', value: false, default: false }, { key: 'cta_add_all_text', type: 'text', label: 'Añadir todo', value: '', default: '' }, { key: 'image_ratio', type: 'select', label: 'Ratio', value: '4:5', default: '4:5', options: [] }], blocks: [{ type: 'look_item', displayName: 'Producto 1', hidden: false, settings: [{ key: 'productId', type: 'product-picker', label: 'Producto', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: '', default: '' }, { key: 'show_sizes', type: 'checkbox', label: 'Variantes', value: true, default: true }] }, { type: 'look_item', displayName: 'Producto 2', hidden: false, settings: [{ key: 'productId', type: 'product-picker', label: 'Producto', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: '', default: '' }, { key: 'show_sizes', type: 'checkbox', label: 'Variantes', value: true, default: true }] }] },
        { type: 'related_products', displayName: 'Relacionados', hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'title', type: 'text', label: 'Título', value: 'También te puede gustar', default: '' }, { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [] }, { key: 'max_products', type: 'range', label: 'Máx.', value: 4, default: 4, min: 2, max: 8 }], blocks: [] },
        { type: 'newsletter', displayName: 'Newsletter', hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Título', value: '10% de descuento en tu primer pedido', default: '' }, { key: 'subheading', type: 'text', label: 'Subtítulo', value: 'Suscríbete y recibe tu código al instante.', default: '' }, { key: 'placeholder', type: 'text', label: 'Placeholder', value: 'Tu email', default: 'Tu email' }, { key: 'button_text', type: 'text', label: 'Botón', value: 'Conseguir 10%', default: 'Suscribirme' }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#0f0f0f', default: '#f3f4f6' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#ffffff', default: '#111827' }], blocks: [] },
        { type: 'footer', displayName: 'Pie de página', hidden: false, settings: [{ key: 'bg_color', type: 'color', label: 'Fondo', value: '#0f0f0f', default: '#111827' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#767676', default: '#d1d5db' }, { key: 'show_social', type: 'checkbox', label: 'Redes', value: true, default: true }, { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' }, { key: 'columns_count', type: 'select', label: 'Columnas', value: '3', default: '4', options: [] }], blocks: [] },
      ],
    },
    collection: {
      name: 'collection', label: 'Colección',
      sections: [
        { type: 'drop_announcement', displayName: 'Barra de lanzamiento', hidden: false, settings: [{ key: 'badge_text', type: 'text', label: 'Badge', value: 'NUEVO', default: 'NUEVO' }, { key: 'show_badge', type: 'checkbox', label: 'Badge', value: true, default: true }, { key: 'badge_animate', type: 'checkbox', label: 'Animar', value: true, default: true }, { key: 'heading', type: 'text', label: 'Texto', value: 'Nueva carta disponible ahora', default: '' }, { key: 'tagline', type: 'text', label: 'Tagline', value: '', default: '' }, { key: 'cta_text', type: 'text', label: 'CTA', value: 'Ver carta', default: 'Ver carta' }, { key: 'cta_url', type: 'text', label: 'URL', value: '/menu', default: '/' }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#0f0f0f', default: '#0f0f0f' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#ffffff', default: '#ffffff' }, { key: 'dismissible', type: 'checkbox', label: 'Cerrable', value: false, default: false }, { key: 'height', type: 'select', label: 'Altura', value: 'compact', default: 'compact', options: [] }], blocks: [] },
        { type: 'header', displayName: 'Encabezado', hidden: false, settings: [{ key: 'sticky', type: 'checkbox', label: 'Fijo', value: true, default: true }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#ffffff', default: '#ffffff' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#0f0f0f', default: '#111827' }, { key: 'transparent', type: 'checkbox', label: 'Transparente', value: false, default: false }, { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' }], blocks: [] },
        { type: 'featured_collection', displayName: 'Productos', hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'title', type: 'text', label: 'Título', value: '', default: 'Destacados' }, { key: 'subtitle', type: 'text', label: 'Subtítulo', value: '', default: '' }, { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [] }, { key: 'show_price', type: 'checkbox', label: 'Precio', value: true, default: true }, { key: 'show_badge', type: 'checkbox', label: 'Badge', value: true, default: true }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#ffffff', default: '#ffffff' }, { key: 'max_products', type: 'range', label: 'Máx.', value: 16, default: 8, min: 2, max: 16 }], blocks: [] },
        { type: 'footer', displayName: 'Pie de página', hidden: false, settings: [{ key: 'bg_color', type: 'color', label: 'Fondo', value: '#0f0f0f', default: '#111827' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#767676', default: '#d1d5db' }, { key: 'show_social', type: 'checkbox', label: 'Redes', value: false, default: true }, { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' }, { key: 'columns_count', type: 'select', label: 'Columnas', value: '2', default: '4', options: [] }], blocks: [] },
      ],
    },
    page: {
      name: 'page', label: 'Página',
      sections: [
        { type: 'header', displayName: 'Encabezado', hidden: false, settings: [{ key: 'sticky', type: 'checkbox', label: 'Fijo', value: true, default: true }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#ffffff', default: '#ffffff' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#0f0f0f', default: '#111827' }, { key: 'transparent', type: 'checkbox', label: 'Transparente', value: false, default: false }, { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' }], blocks: [] },
        { type: 'rich_text', displayName: 'Contenido', hidden: false, settings: [{ key: 'content', type: 'textarea', label: 'Contenido', value: '', default: '' }, { key: 'alignment', type: 'select', label: 'Alineación', value: 'left', default: 'center', options: [] }, { key: 'heading', type: 'text', label: 'Título', value: '', default: '' }, { key: 'bg_color', type: 'color', label: 'Fondo', value: '#ffffff', default: '#ffffff' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#0f0f0f', default: '#374151' }, { key: 'max_width', type: 'select', label: 'Ancho', value: 'md', default: 'md', options: [] }], blocks: [] },
        { type: 'footer', displayName: 'Pie de página', hidden: false, settings: [{ key: 'bg_color', type: 'color', label: 'Fondo', value: '#0f0f0f', default: '#111827' }, { key: 'text_color', type: 'color', label: 'Texto', value: '#767676', default: '#d1d5db' }, { key: 'show_social', type: 'checkbox', label: 'Redes', value: false, default: true }, { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' }, { key: 'columns_count', type: 'select', label: 'Columnas', value: '2', default: '4', options: [] }], blocks: [] },
      ],
    },
  },
}

/* ── All library themes ── */
export const THEME_LIBRARY: LibraryTheme[] = [meridionalTheme, dropTheme]
