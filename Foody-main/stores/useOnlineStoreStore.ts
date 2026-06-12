import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { type ThemeGlobalSettings, createDefaultGlobalSettings } from '~/composables/useThemeSettings'

/* ─── Setting Types ─── */
export interface ThemeSetting {
  key: string
  type: 'text' | 'number' | 'color' | 'image' | 'select' | 'checkbox' | 'range' | 'textarea' | 'product-picker' | 'collection-picker'
  label: string
  value: any
  default: any
  options?: { label: string; value: string }[]
  min?: number
  max?: number
  info?: string
}

export interface ThemeBlock {
  id: string
  type: string
  displayName: string
  order: number
  hidden: boolean
  settings: ThemeSetting[]
  appId?: string
}

export interface ThemeSection {
  id: string
  type: string
  displayName: string
  order: number
  hidden: boolean
  settings: ThemeSetting[]
  blocks: ThemeBlock[]
  maxBlocks?: number
}

export interface ThemeTemplate {
  id: string
  name: string
  label: string
  sections: ThemeSection[]
}

export interface Theme {
  id: string
  name: string
  role: 'main' | 'unpublished'
  version: string
  schemaVersion: number
  previewImage: string
  lastSaved: string
  lastPublished: string
  templates: ThemeTemplate[]
  globalSettings: ThemeGlobalSettings
}

export interface AppEmbed {
  appId: string
  embedId: string
  displayName: string
  icon: string
  enabled: boolean
  settings: ThemeSetting[]
}

export interface AppBlock {
  appId: string
  blockType: string
  displayName: string
  icon: string
  settingsSchema: ThemeSetting[]
}

export interface Preferences {
  homeTitle: string
  metaDescription: string
  socialImage: string
  passwordEnabled: boolean
  password: string
  passwordMessage: string
  internationalRedirect: boolean
  hcaptchaEnabled: boolean
  hcaptchaSiteKey: string
  hcaptchaSecretKey: string
  trackingHeadScripts: string
  trackingBodyScripts: string
}

export interface PerformanceMetrics {
  lcp: number | null
  inp: number | null
  cls: number | null
  range: 'today' | '7d' | '30d'
}

export type EditorSaveStatus = 'idle' | 'saving' | 'saved' | 'error'
export type EditorPublishStatus = 'idle' | 'publishing' | 'published' | 'error'

/* ─── Helper: create a mock home template ─── */
function createHomeTemplate(): ThemeTemplate {
  return {
    id: 'tmpl-home',
    name: 'index',
    label: 'Inicio',
    sections: [
      {
        id: 'sec-header',
        type: 'header',
        displayName: 'Encabezado',
        order: 0,
        hidden: false,
        settings: [
          { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' },
          { key: 'sticky', type: 'checkbox', label: 'Encabezado fijo', value: true, default: true },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        ],
        blocks: [
          {
            id: 'blk-nav-1',
            type: 'nav_link',
            displayName: 'Enlace: Inicio',
            order: 0,
            hidden: false,
            settings: [
              { key: 'text', type: 'text', label: 'Texto', value: 'Inicio', default: 'Inicio' },
              { key: 'url', type: 'text', label: 'URL', value: '/', default: '/' },
            ],
          },
          {
            id: 'blk-nav-2',
            type: 'nav_link',
            displayName: 'Enlace: Carta',
            order: 1,
            hidden: false,
            settings: [
              { key: 'text', type: 'text', label: 'Texto', value: 'Carta', default: 'Carta' },
              { key: 'url', type: 'text', label: 'URL', value: '/menu', default: '/menu' },
            ],
          },
        ],
      },
      {
        id: 'sec-hero',
        type: 'hero_banner',
        displayName: 'Banner principal',
        order: 1,
        hidden: false,
        settings: [
          { key: 'heading', type: 'text', label: 'Título', value: '¡Bienvenidos!', default: '¡Bienvenidos!' },
          { key: 'subheading', type: 'text', label: 'Subtítulo', value: 'Los mejores platos a tu puerta', default: '' },
          { key: 'bg_image', type: 'image', label: 'Imagen de fondo', value: '', default: '' },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#1a1a2e', default: '#1a1a2e' },
          { key: 'text_color', type: 'color', label: 'Color de texto', value: '#ffffff', default: '#ffffff' },
          { key: 'height', type: 'range', label: 'Altura (px)', value: 500, default: 500, min: 200, max: 800 },
          { key: 'cta_text', type: 'text', label: 'Texto del botón', value: 'Ver menú', default: 'Ver menú' },
          { key: 'cta_url', type: 'text', label: 'URL del botón', value: '/menu', default: '/menu' },
        ],
        blocks: [],
      },
      {
        id: 'sec-featured',
        type: 'featured_collection',
        displayName: 'Colección destacada',
        order: 2,
        hidden: false,
        settings: [
          { key: 'title', type: 'text', label: 'Título', value: 'Platos populares', default: 'Destacados' },
          { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
          { key: 'show_price', type: 'checkbox', label: 'Mostrar precio', value: true, default: true },
        ],
        blocks: [
          {
            id: 'blk-prod-1',
            type: 'product_card',
            displayName: 'Producto: Hamburguesa',
            order: 0,
            hidden: false,
            settings: [
              { key: 'product_name', type: 'text', label: 'Nombre', value: 'Hamburguesa clásica', default: '' },
              { key: 'price', type: 'text', label: 'Precio', value: '9.50€', default: '' },
            ],
          },
          {
            id: 'blk-prod-2',
            type: 'product_card',
            displayName: 'Producto: Pizza',
            order: 1,
            hidden: false,
            settings: [
              { key: 'product_name', type: 'text', label: 'Nombre', value: 'Pizza Margarita', default: '' },
              { key: 'price', type: 'text', label: 'Precio', value: '11.00€', default: '' },
            ],
          },
        ],
        maxBlocks: 12,
      },
      {
        id: 'sec-trust',
        type: 'trust_icons',
        displayName: 'Iconos de confianza',
        order: 3,
        hidden: false,
        settings: [
          { key: 'title', type: 'text', label: 'Título', value: '', default: '' },
          { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
          { key: 'bg_color', type: 'color', label: 'Fondo', value: '#ffffff', default: '#ffffff' },
          { key: 'icon_color', type: 'color', label: 'Color iconos', value: '#059669', default: '#059669' },
        ],
        blocks: [
          { id: 'blk-tr-1', type: 'trust_item', displayName: 'Envío express', order: 0, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'truck', default: 'truck', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Envío express', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'En menos de 30 min', default: '' }] },
          { id: 'blk-tr-2', type: 'trust_item', displayName: 'Ingredientes frescos', order: 1, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'leaf', default: 'leaf', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: '100% frescos', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Ingredientes de temporada', default: '' }] },
          { id: 'blk-tr-3', type: 'trust_item', displayName: 'Pago seguro', order: 2, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'shield', default: 'shield', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Pago seguro', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'SSL y pasarela segura', default: '' }] },
          { id: 'blk-tr-4', type: 'trust_item', displayName: 'Satisfacción', order: 3, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'star', default: 'star', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: '4.9★ valoración', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: '+2.000 clientes satisfechos', default: '' }] },
        ],
        maxBlocks: 8,
      },
      {
        id: 'sec-text',
        type: 'image_with_text',
        displayName: 'Imagen con texto',
        order: 4,
        hidden: false,
        settings: [
          { key: 'heading', type: 'text', label: 'Título', value: 'Nuestra historia', default: '' },
          { key: 'content', type: 'textarea', label: 'Contenido', value: 'Somos un restaurante familiar con más de 10 años de experiencia. Creemos en la cocina honesta, ingredientes de proximidad y sabores que cuentan historias.', default: '' },
          { key: 'image_position', type: 'select', label: 'Posición imagen', value: 'left', default: 'left', options: [{ label: 'Izquierda', value: 'left' }, { label: 'Derecha', value: 'right' }] },
          { key: 'cta_text', type: 'text', label: 'Texto botón', value: 'Conoce más', default: '' },
          { key: 'cta_url', type: 'text', label: 'URL botón', value: '/nosotros', default: '' },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        ],
        blocks: [],
      },
      {
        id: 'sec-testimonials',
        type: 'testimonials',
        displayName: 'Opiniones',
        order: 5,
        hidden: false,
        settings: [
          { key: 'title', type: 'text', label: 'Título', value: 'Lo que dicen nuestros clientes', default: '' },
          { key: 'columns', type: 'select', label: 'Columnas', value: '3', default: '3', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }] },
          { key: 'show_stars', type: 'checkbox', label: 'Mostrar estrellas', value: true, default: true },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#f9fafb', default: '#f9fafb' },
        ],
        blocks: [
          { id: 'blk-test-1', type: 'testimonial', displayName: 'Opinión 1', order: 0, hidden: false, settings: [{ key: 'text', type: 'textarea', label: 'Texto', value: 'Increíble experiencia. La comida llegó caliente y en perfecto estado. ¡Repetiré!', default: '' }, { key: 'author', type: 'text', label: 'Autor', value: 'Ana P.', default: '' }, { key: 'rating', type: 'number', label: 'Estrellas', value: 5, default: 5 }] },
          { id: 'blk-test-2', type: 'testimonial', displayName: 'Opinión 2', order: 1, hidden: false, settings: [{ key: 'text', type: 'textarea', label: 'Texto', value: 'El mejor restaurante de la zona. Calidad-precio insuperable.', default: '' }, { key: 'author', type: 'text', label: 'Autor', value: 'Diego M.', default: '' }, { key: 'rating', type: 'number', label: 'Estrellas', value: 5, default: 5 }] },
          { id: 'blk-test-3', type: 'testimonial', displayName: 'Opinión 3', order: 2, hidden: false, settings: [{ key: 'text', type: 'textarea', label: 'Texto', value: 'Pedimos para toda la familia y nos encantó. El menú infantil es genial.', default: '' }, { key: 'author', type: 'text', label: 'Autor', value: 'Sara L.', default: '' }, { key: 'rating', type: 'number', label: 'Estrellas', value: 4, default: 5 }] },
        ],
        maxBlocks: 8,
      },
      {
        id: 'sec-newsletter',
        type: 'newsletter',
        displayName: 'Newsletter',
        order: 6,
        hidden: false,
        settings: [
          { key: 'heading', type: 'text', label: 'Título', value: 'No te pierdas nada', default: '' },
          { key: 'subheading', type: 'text', label: 'Subtítulo', value: 'Suscríbete para recibir ofertas exclusivas y novedades', default: '' },
          { key: 'placeholder', type: 'text', label: 'Placeholder', value: 'Tu email', default: 'Tu email' },
          { key: 'button_text', type: 'text', label: 'Texto botón', value: 'Suscribirme', default: 'Suscribirme' },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#f3f4f6', default: '#f3f4f6' },
          { key: 'text_color', type: 'color', label: 'Color texto', value: '#111827', default: '#111827' },
        ],
        blocks: [],
      },
      {
        id: 'sec-footer',
        type: 'footer',
        displayName: 'Pie de página',
        order: 7,
        hidden: false,
        settings: [
          { key: 'show_social', type: 'checkbox', label: 'Mostrar redes sociales', value: true, default: true },
          { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#111827', default: '#111827' },
          { key: 'text_color', type: 'color', label: 'Color texto', value: '#d1d5db', default: '#d1d5db' },
          { key: 'columns_count', type: 'select', label: 'Columnas', value: '3', default: '3', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
        ],
        blocks: [
          { id: 'blk-foot-1', type: 'footer_column', displayName: 'Contacto', order: 0, hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Contacto', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: '', default: '' }] },
          { id: 'blk-foot-2', type: 'footer_column', displayName: 'Horarios', order: 1, hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Horarios', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Lun-Vie: 12:00 - 23:00\nSáb-Dom: 12:00 - 00:00', default: '' }] },
          { id: 'blk-foot-3', type: 'footer_column', displayName: 'Legal', order: 2, hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Legal', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Aviso legal\nPolítica de privacidad\nCondiciones de uso', default: '' }] },
        ],
      },
    ],
  }
}

function createProductTemplate(): ThemeTemplate {
  return {
    id: 'tmpl-product',
    name: 'product',
    label: 'Producto',
    sections: [
      {
        id: 'sec-prod-header',
        type: 'header',
        displayName: 'Encabezado',
        order: 0,
        hidden: false,
        settings: [
          { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' },
          { key: 'sticky', type: 'checkbox', label: 'Encabezado fijo', value: true, default: true },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        ],
        blocks: [
          { id: 'blk-pnav-1', type: 'nav_link', displayName: 'Enlace: Inicio', order: 0, hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Inicio', default: 'Inicio' }, { key: 'url', type: 'text', label: 'URL', value: '/', default: '/' }] },
          { id: 'blk-pnav-2', type: 'nav_link', displayName: 'Enlace: Carta', order: 1, hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Carta', default: 'Carta' }, { key: 'url', type: 'text', label: 'URL', value: '/menu', default: '/menu' }] },
          { id: 'blk-pnav-3', type: 'nav_link', displayName: 'Enlace: Contacto', order: 2, hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Contacto', default: 'Contacto' }, { key: 'url', type: 'text', label: 'URL', value: '/contacto', default: '/contacto' }] },
        ],
      },
      {
        id: 'sec-prod-marquee',
        type: 'marquee',
        displayName: 'Barra de anuncios',
        order: 1,
        hidden: false,
        settings: [
          { key: 'text', type: 'text', label: 'Texto', value: '🔥 Envío gratis a partir de 25€ — Pide ahora', default: '' },
          { key: 'bg_color', type: 'color', label: 'Fondo', value: '#111827', default: '#111827' },
          { key: 'text_color', type: 'color', label: 'Color texto', value: '#ffffff', default: '#ffffff' },
          { key: 'speed', type: 'range', label: 'Velocidad', value: 40, default: 40, min: 10, max: 100 },
        ],
        blocks: [],
      },
      {
        id: 'sec-prod-main',
        type: 'product_detail',
        displayName: 'Detalle de producto',
        order: 2,
        hidden: false,
        settings: [
          { key: 'show_gallery', type: 'checkbox', label: 'Mostrar galería', value: true, default: true },
          { key: 'show_reviews', type: 'checkbox', label: 'Mostrar reseñas', value: true, default: true },
          { key: 'show_variants', type: 'checkbox', label: 'Mostrar variantes', value: true, default: true },
          { key: 'show_quantity', type: 'checkbox', label: 'Selector de cantidad', value: true, default: true },
          { key: 'show_share', type: 'checkbox', label: 'Botones compartir', value: true, default: true },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
          { key: 'image_ratio', type: 'select', label: 'Ratio de imagen', value: 'square', default: 'square', options: [{ label: 'Cuadrado', value: 'square' }, { label: '4:3', value: '4-3' }, { label: '16:9', value: '16-9' }] },
          { key: 'layout', type: 'select', label: 'Disposición', value: 'side-by-side', default: 'side-by-side', options: [{ label: 'Lado a lado', value: 'side-by-side' }, { label: 'Galería arriba', value: 'stacked' }] },
        ],
        blocks: [
          {
            id: 'blk-prod-info',
            type: 'product_info',
            displayName: 'Info del producto',
            order: 0,
            hidden: false,
            settings: [
              { key: 'show_vendor', type: 'checkbox', label: 'Mostrar marca', value: true, default: true },
              { key: 'show_sku', type: 'checkbox', label: 'Mostrar SKU', value: false, default: false },
            ],
          },
          {
            id: 'blk-prod-price',
            type: 'product_price',
            displayName: 'Precio',
            order: 1,
            hidden: false,
            settings: [
              { key: 'show_compare', type: 'checkbox', label: 'Mostrar precio anterior', value: true, default: true },
              { key: 'show_tax_info', type: 'checkbox', label: 'Info de impuestos', value: true, default: true },
            ],
          },
          {
            id: 'blk-prod-variants',
            type: 'product_variants',
            displayName: 'Selector de variantes',
            order: 2,
            hidden: false,
            settings: [
              { key: 'style', type: 'select', label: 'Estilo', value: 'buttons', default: 'buttons', options: [{ label: 'Botones', value: 'buttons' }, { label: 'Dropdown', value: 'dropdown' }] },
            ],
          },
          {
            id: 'blk-prod-qty',
            type: 'product_quantity',
            displayName: 'Cantidad',
            order: 3,
            hidden: false,
            settings: [
              { key: 'min', type: 'number', label: 'Mínimo', value: 1, default: 1 },
              { key: 'max', type: 'number', label: 'Máximo', value: 10, default: 10 },
            ],
          },
          {
            id: 'blk-prod-cart-btn',
            type: 'product_buy_button',
            displayName: 'Botón de compra',
            order: 4,
            hidden: false,
            settings: [
              { key: 'text', type: 'text', label: 'Texto', value: 'Añadir al carrito', default: 'Añadir al carrito' },
              { key: 'show_dynamic_checkout', type: 'checkbox', label: 'Pago rápido', value: true, default: true },
            ],
          },
          {
            id: 'blk-prod-desc',
            type: 'product_description',
            displayName: 'Descripción',
            order: 5,
            hidden: false,
            settings: [
              { key: 'collapsible', type: 'checkbox', label: 'Contenido plegable', value: false, default: false },
            ],
          },
          {
            id: 'blk-prod-badges',
            type: 'product_badges',
            displayName: 'Badges de confianza',
            order: 6,
            hidden: false,
            settings: [
              { key: 'badges', type: 'text', label: 'Badges (separados por coma)', value: 'Envío gratis,Sin gluten,Hecho en España', default: '' },
            ],
          },
          {
            id: 'blk-prod-inventory',
            type: 'product_inventory',
            displayName: 'Stock disponible',
            order: 7,
            hidden: false,
            settings: [
              { key: 'show_stock', type: 'checkbox', label: 'Mostrar stock disponible', value: true, default: true },
              { key: 'low_stock_threshold', type: 'number', label: 'Umbral stock bajo', value: 5, default: 5 },
            ],
          },
          {
            id: 'blk-prod-payment',
            type: 'product_payment_methods',
            displayName: 'Métodos de pago',
            order: 8,
            hidden: false,
            settings: [
              { key: 'show_icons', type: 'checkbox', label: 'Mostrar iconos de pago', value: true, default: true },
              { key: 'label', type: 'text', label: 'Texto', value: 'Pago seguro garantizado', default: 'Pago seguro garantizado' },
            ],
          },
          {
            id: 'blk-prod-modifiers',
            type: 'product_modifiers',
            displayName: 'Opciones de personalización',
            order: 9,
            hidden: false,
            settings: [
              { key: 'show_modifiers', type: 'checkbox', label: 'Mostrar personalizaciones', value: true, default: true },
            ],
          },
          {
            id: 'blk-prod-recipe',
            type: 'product_recipe',
            displayName: 'Receta del producto',
            order: 10,
            hidden: true,
            settings: [
              { key: 'show_recipe', type: 'checkbox', label: 'Mostrar receta', value: false, default: false },
            ],
          },
        ],
        maxBlocks: 16,
      },
      {
        id: 'sec-prod-trust',
        type: 'trust_icons',
        displayName: 'Iconos de confianza',
        order: 3,
        hidden: false,
        settings: [
          { key: 'title', type: 'text', label: 'Título', value: '¿Por qué elegirnos?', default: '' },
          { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
          { key: 'bg_color', type: 'color', label: 'Fondo', value: '#f9fafb', default: '#f9fafb' },
          { key: 'icon_color', type: 'color', label: 'Color iconos', value: '#059669', default: '#059669' },
        ],
        blocks: [
          { id: 'blk-pt-1', type: 'trust_item', displayName: 'Envío rápido', order: 0, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'truck', default: 'truck', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Envío 30 min', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Recibe tu pedido en menos de 30 minutos', default: '' }] },
          { id: 'blk-pt-2', type: 'trust_item', displayName: 'Ingredientes frescos', order: 1, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'leaf', default: 'leaf', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Ingredientes frescos', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Productos de proximidad y de temporada', default: '' }] },
          { id: 'blk-pt-3', type: 'trust_item', displayName: 'Pago seguro', order: 2, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'shield', default: 'shield', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Pago 100% seguro', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Tus datos siempre protegidos', default: '' }] },
          { id: 'blk-pt-4', type: 'trust_item', displayName: 'Satisfacción', order: 3, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'star', default: 'star', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: '4.9★ satisfacción', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Miles de clientes satisfechos', default: '' }] },
        ],
        maxBlocks: 8,
      },
      {
        id: 'sec-prod-related',
        type: 'related_products',
        displayName: 'Productos relacionados',
        order: 4,
        hidden: false,
        settings: [
          { key: 'title', type: 'text', label: 'Título', value: 'También te puede gustar', default: 'Productos relacionados' },
          { key: 'max_products', type: 'number', label: 'Máx. productos', value: 4, default: 4 },
          { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
        ],
        blocks: [],
      },
      {
        id: 'sec-prod-testimonials',
        type: 'testimonials',
        displayName: 'Opiniones de clientes',
        order: 5,
        hidden: false,
        settings: [
          { key: 'title', type: 'text', label: 'Título', value: 'Lo que opinan nuestros clientes', default: '' },
          { key: 'columns', type: 'select', label: 'Columnas', value: '3', default: '3', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }] },
          { key: 'show_stars', type: 'checkbox', label: 'Mostrar estrellas', value: true, default: true },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        ],
        blocks: [
          { id: 'blk-ptest-1', type: 'testimonial', displayName: 'Opinión 1', order: 0, hidden: false, settings: [{ key: 'text', type: 'textarea', label: 'Texto', value: 'La mejor hamburguesa que he probado. Ingredientes frescos y la salsa es espectacular.', default: '' }, { key: 'author', type: 'text', label: 'Autor', value: 'María G.', default: '' }, { key: 'rating', type: 'number', label: 'Estrellas', value: 5, default: 5 }] },
          { id: 'blk-ptest-2', type: 'testimonial', displayName: 'Opinión 2', order: 1, hidden: false, settings: [{ key: 'text', type: 'textarea', label: 'Texto', value: 'Pedido a domicilio en 25 minutos. Todo perfecto y caliente. Repetiré seguro.', default: '' }, { key: 'author', type: 'text', label: 'Autor', value: 'Carlos R.', default: '' }, { key: 'rating', type: 'number', label: 'Estrellas', value: 5, default: 5 }] },
          { id: 'blk-ptest-3', type: 'testimonial', displayName: 'Opinión 3', order: 2, hidden: false, settings: [{ key: 'text', type: 'textarea', label: 'Texto', value: 'Gran variedad y excelente relación calidad-precio. El menú infantil genial.', default: '' }, { key: 'author', type: 'text', label: 'Autor', value: 'Laura M.', default: '' }, { key: 'rating', type: 'number', label: 'Estrellas', value: 4, default: 5 }] },
        ],
        maxBlocks: 8,
      },
      {
        id: 'sec-prod-newsletter',
        type: 'newsletter',
        displayName: 'Newsletter',
        order: 6,
        hidden: false,
        settings: [
          { key: 'heading', type: 'text', label: 'Título', value: '¿Te ha gustado? No te pierdas nada', default: 'Newsletter' },
          { key: 'subheading', type: 'text', label: 'Subtítulo', value: 'Suscríbete y recibe ofertas exclusivas y novedades del menú', default: '' },
          { key: 'placeholder', type: 'text', label: 'Placeholder', value: 'Tu correo electrónico', default: 'Tu email' },
          { key: 'button_text', type: 'text', label: 'Texto botón', value: 'Suscribirme', default: 'Suscribirme' },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#f3f4f6', default: '#f3f4f6' },
          { key: 'text_color', type: 'color', label: 'Color texto', value: '#111827', default: '#111827' },
        ],
        blocks: [],
      },
      {
        id: 'sec-prod-footer',
        type: 'footer',
        displayName: 'Pie de página',
        order: 7,
        hidden: false,
        settings: [
          { key: 'show_social', type: 'checkbox', label: 'Mostrar redes sociales', value: true, default: true },
          { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' },
          { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#111827', default: '#111827' },
          { key: 'text_color', type: 'color', label: 'Color texto', value: '#d1d5db', default: '#d1d5db' },
          { key: 'columns_count', type: 'select', label: 'Columnas', value: '3', default: '3', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
        ],
        blocks: [
          { id: 'blk-pf-1', type: 'footer_column', displayName: 'Contacto', order: 0, hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Contacto', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: '', default: '' }] },
          { id: 'blk-pf-2', type: 'footer_column', displayName: 'Horarios', order: 1, hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Horarios', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Lun-Vie: 12:00 - 23:00\nSáb-Dom: 12:00 - 00:00', default: '' }] },
          { id: 'blk-pf-3', type: 'footer_column', displayName: 'Legal', order: 2, hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Legal', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Aviso legal\nPolítica de privacidad\nCookies', default: '' }] },
        ],
      },
    ],
  }
}

function createCollectionTemplate(): ThemeTemplate {
  return {
    id: 'tmpl-collection',
    name: 'collection',
    label: 'Colección',
    sections: [
      {
        id: 'sec-coll-grid',
        type: 'collection_grid',
        displayName: 'Cuadrícula de productos',
        order: 0,
        hidden: false,
        settings: [
          { key: 'columns', type: 'select', label: 'Columnas', value: '3', default: '3', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
          { key: 'show_filters', type: 'checkbox', label: 'Mostrar filtros', value: true, default: true },
        ],
        blocks: [],
      },
    ],
  }
}

function createPageTemplate(): ThemeTemplate {
  return {
    id: 'tmpl-page',
    name: 'page',
    label: 'Página',
    sections: [
      {
        id: 'sec-page-content',
        type: 'page_content',
        displayName: 'Contenido de página',
        order: 0,
        hidden: false,
        settings: [
          { key: 'show_title', type: 'checkbox', label: 'Mostrar título', value: true, default: true },
          { key: 'max_width', type: 'select', label: 'Ancho máximo', value: 'md', default: 'md', options: [{ label: 'Estrecho', value: 'sm' }, { label: 'Mediano', value: 'md' }, { label: 'Ancho', value: 'lg' }] },
        ],
        blocks: [],
      },
    ],
  }
}

/* ─── Store ─── */
export const useOnlineStoreStore = defineStore('onlineStore', () => {
  /* ── Themes (fetched from API) ── */
  const themes = ref<Theme[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchThemes = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Theme[]>('/api/themes')
      themes.value = data
    } catch (e: any) {
      error.value = e?.message || 'Error loading themes'
      console.error('[OnlineStore] fetchThemes failed:', e)
    } finally {
      loading.value = false
    }
  }

  const currentTheme = computed(() => themes.value.find(t => t.role === 'main'))
  const libraryThemes = computed(() => themes.value.filter(t => t.role === 'unpublished'))

  const publishTheme = async (id: string) => {
    themes.value.forEach(t => {
      t.role = t.id === id ? 'main' : 'unpublished'
    })
    const theme = themes.value.find(t => t.id === id)
    if (theme) {
      theme.lastPublished = new Date().toISOString()
      await $fetch(`/api/themes/${id}`, { method: 'PUT', body: theme })
      // Update other themes' roles in backend
      for (const t of themes.value.filter(t => t.id !== id)) {
        await $fetch(`/api/themes/${t.id}`, { method: 'PUT', body: { role: 'unpublished' } })
      }
    }
  }

  const duplicateTheme = async (id: string) => {
    const source = themes.value.find(t => t.id === id)
    if (!source) return
    const dup: Theme = JSON.parse(JSON.stringify(source))
    dup.id = `theme-${Date.now()}`
    dup.name = `${source.name} (copia)`
    dup.role = 'unpublished'
    dup.lastSaved = new Date().toISOString()
    dup.lastPublished = ''
    themes.value.push(dup)
    // Persist the duplicate to backend
    await $fetch(`/api/themes/${dup.id}`, { method: 'PUT', body: dup }).catch(() => {
      // If PUT fails (theme doesn't exist), we need a create endpoint — use the full save
      // For now the PUT creates the row via upsert handled by the endpoint
    })
  }

  const renameTheme = async (id: string, name: string) => {
    const t = themes.value.find(t => t.id === id)
    if (t) {
      t.name = name
      await $fetch(`/api/themes/${id}`, { method: 'PUT', body: { name } })
    }
  }

  const deleteTheme = async (id: string) => {
    const idx = themes.value.findIndex(t => t.id === id)
    if (idx !== -1 && themes.value[idx].role !== 'main') {
      themes.value.splice(idx, 1)
      await ($fetch as any)(`/api/themes/${id}`, { method: 'DELETE' }).catch(() => {})
    }
  }

  /* ── Performance (mock — no table yet) ── */
  const performanceRange = ref<'today' | '7d' | '30d'>('7d')
  const performanceLoading = ref(false)
  const performanceMetrics = ref<PerformanceMetrics>({
    lcp: 1850,
    inp: 95,
    cls: 0.08,
    range: '7d',
  })

  const loadPerformance = async (range: 'today' | '7d' | '30d') => {
    performanceLoading.value = true
    performanceRange.value = range
    await new Promise(r => setTimeout(r, 800))
    const mocks: Record<string, PerformanceMetrics> = {
      today: { lcp: 1720, inp: 88, cls: 0.06, range: 'today' },
      '7d': { lcp: 1850, inp: 95, cls: 0.08, range: '7d' },
      '30d': { lcp: 2100, inp: 120, cls: 0.12, range: '30d' },
    }
    performanceMetrics.value = mocks[range]
    performanceLoading.value = false
  }

  /* ── Preferences ── */
  const preferences = ref<Preferences>({
    homeTitle: '',
    metaDescription: '',
    socialImage: '',
    passwordEnabled: false,
    password: '',
    passwordMessage: 'Próximamente estaremos disponibles.',
    internationalRedirect: false,
    hcaptchaEnabled: false,
    hcaptchaSiteKey: '',
    hcaptchaSecretKey: '',
    trackingHeadScripts: '',
    trackingBodyScripts: '',
  })

  /* ── App Extensions ── */
  const appEmbeds = ref<AppEmbed[]>([
    {
      appId: 'app-chat',
      embedId: 'chat-bubble',
      displayName: 'Chat en vivo',
      icon: 'i-lucide-message-circle',
      enabled: false,
      settings: [
        { key: 'position', type: 'select', label: 'Posición', value: 'bottom-right', default: 'bottom-right', options: [{ label: 'Abajo derecha', value: 'bottom-right' }, { label: 'Abajo izquierda', value: 'bottom-left' }] },
        { key: 'color', type: 'color', label: 'Color del botón', value: '#e63946', default: '#e63946' },
        { key: 'welcome_msg', type: 'text', label: 'Mensaje de bienvenida', value: '¡Hola! ¿En qué podemos ayudarte?', default: '' },
      ],
    },
  ])

  const appBlocks = ref<AppBlock[]>([
    {
      appId: 'app-promo',
      blockType: 'promo_banner',
      displayName: 'Banner promocional',
      icon: 'i-lucide-badge-percent',
      settingsSchema: [
        { key: 'text', type: 'text', label: 'Texto', value: '🔥 ¡20% de descuento en tu primer pedido!', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#fef3c7', default: '#fef3c7' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#92400e', default: '#92400e' },
        { key: 'dismissible', type: 'checkbox', label: 'Permitir cerrar', value: true, default: true },
      ],
    },
  ])

  const registerEmbed = (embed: AppEmbed) => {
    if (!appEmbeds.value.find(e => e.embedId === embed.embedId)) {
      appEmbeds.value.push(embed)
    }
  }

  const registerBlock = (block: AppBlock) => {
    if (!appBlocks.value.find(b => b.blockType === block.blockType)) {
      appBlocks.value.push(block)
    }
  }

  /* ── Editor state (transient) ── */
  const editorSelectedSectionId = ref<string | null>(null)
  const editorSelectedBlockId = ref<string | null>(null)
  const editorActiveTemplateId = ref('tmpl-home')
  const editorSidebarView = ref<'sections' | 'theme_settings' | 'app_embeds'>('sections')
  const editorPreviewMode = ref<'desktop' | 'mobile'>('desktop')
  const editorInspectorEnabled = ref(false)
  const editorPreviewProductId = ref<string | null>(null)
  const editorPreviewCollectionId = ref<string | null>(null)

  /* ── Draft / Publish snapshots ── */
  const draftSnapshots = ref<Record<string, string>>({})
  const publishedSnapshots = ref<Record<string, string>>({})
  const editorSaveStatus = ref<EditorSaveStatus>('idle')
  const editorPublishStatus = ref<EditorPublishStatus>('idle')

  const initEditorDraft = (themeId: string) => {
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme) return
    const snap = JSON.stringify(theme)
    draftSnapshots.value[themeId] = snap
    if (theme.lastPublished) {
      publishedSnapshots.value[themeId] = snap
    }
    undoStack.value = []
    redoStack.value = []
    editorSaveStatus.value = 'idle'
    editorPublishStatus.value = 'idle'
  }

  /* ── Sync identity defaults from brand settings (non-destructive) ──
     Only fills in fields that are currently empty so user overrides
     are never overwritten. Does NOT push to undo stack. */
  const syncIdentityDefaults = (themeId: string, opts: {
    logo?: string
    storeName?: string
  }) => {
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme) return
    if (opts.logo && !theme.globalSettings.identity.logo) {
      theme.globalSettings.identity.logo = opts.logo
    }
  }

  const hasDraftChanges = (themeId: string) => {
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme || !draftSnapshots.value[themeId]) return false
    return JSON.stringify(theme) !== draftSnapshots.value[themeId]
  }

  const hasUnpublishedChanges = (themeId: string) => {
    if (!draftSnapshots.value[themeId] || !publishedSnapshots.value[themeId]) return false
    return draftSnapshots.value[themeId] !== publishedSnapshots.value[themeId]
  }

  const saveDraft = async (themeId: string) => {
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme) return
    editorSaveStatus.value = 'saving'
    try {
      theme.lastSaved = new Date().toISOString()
      await $fetch(`/api/themes/${themeId}`, { method: 'PUT', body: theme })
      draftSnapshots.value[themeId] = JSON.stringify(theme)
      editorSaveStatus.value = 'saved'
    } catch (e) {
      console.error('[OnlineStore] saveDraft failed:', e)
      editorSaveStatus.value = 'idle'
    }
    setTimeout(() => {
      if (editorSaveStatus.value === 'saved') editorSaveStatus.value = 'idle'
    }, 2000)
  }

  const publishDraft = async (themeId: string) => {
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme) return
    if (hasDraftChanges(themeId)) {
      await saveDraft(themeId)
    }
    editorPublishStatus.value = 'publishing'
    try {
      theme.lastPublished = new Date().toISOString()
      if (theme.role !== 'main') {
        themes.value.forEach(t => { t.role = t.id === themeId ? 'main' : 'unpublished' })
      }
      await $fetch(`/api/themes/${themeId}`, { method: 'PUT', body: theme })
      // Update other themes' roles in backend
      for (const t of themes.value.filter(t => t.id !== themeId)) {
        await $fetch(`/api/themes/${t.id}`, { method: 'PUT', body: { role: 'unpublished' } })
      }
      publishedSnapshots.value[themeId] = draftSnapshots.value[themeId]
      editorPublishStatus.value = 'published'
    } catch (e) {
      console.error('[OnlineStore] publishDraft failed:', e)
      editorPublishStatus.value = 'idle'
    }
    setTimeout(() => {
      if (editorPublishStatus.value === 'published') editorPublishStatus.value = 'idle'
    }, 2500)
  }

  /* ── Undo / Redo ── */
  const undoStack = ref<string[]>([])
  const redoStack = ref<string[]>([])
  let _lastPushTime = 0

  const pushUndo = (themeId: string) => {
    const now = Date.now()
    if (now - _lastPushTime < 300) return
    _lastPushTime = now
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme) return
    undoStack.value.push(JSON.stringify(theme))
    redoStack.value = []
    if (undoStack.value.length > 80) undoStack.value.shift()
  }

  const undo = (themeId: string) => {
    if (!undoStack.value.length) return
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme) return
    redoStack.value.push(JSON.stringify(theme))
    const prev = JSON.parse(undoStack.value.pop()!)
    Object.assign(theme, prev)
  }

  const redo = (themeId: string) => {
    if (!redoStack.value.length) return
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme) return
    undoStack.value.push(JSON.stringify(theme))
    const next = JSON.parse(redoStack.value.pop()!)
    Object.assign(theme, next)
  }

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  /* ── Library theme installation ── */
  const installingThemeId = ref<string | null>(null)
  const installError = ref<string | null>(null)

  const installLibraryTheme = async (libraryTheme: {
    id: string
    name: string
    description?: string
    previewImage?: string
    globalSettings: any
    templates: Record<string, any> | any[]
  }) => {
    if (themes.value.some(t => t.id === libraryTheme.id)) {
      installError.value = `El tema "${libraryTheme.name}" ya está instalado`
      return null
    }
    installingThemeId.value = libraryTheme.id
    installError.value = null
    try {
      /* Normalize templates: themeLibrary uses a keyed object {home,product,...}
         but the API expects an array. Convert if needed. */
      const templatesArray: any[] = Array.isArray(libraryTheme.templates)
        ? libraryTheme.templates
        : Object.values(libraryTheme.templates as Record<string, any>)

      const installed = await $fetch<Theme>('/api/themes', {
        method: 'POST',
        body: { ...libraryTheme, templates: templatesArray },
      })
      themes.value.push(installed)
      return installed
    } catch (e: any) {
      installError.value = e?.data?.statusMessage || e?.message || 'Error al instalar el tema'
      console.error('[OnlineStore] installLibraryTheme failed:', e)
      return null
    } finally {
      installingThemeId.value = null
    }
  }

  return {  // eslint-disable-next-line
    themes,
    loading,
    error,
    fetchThemes,
    currentTheme,
    libraryThemes,
    publishTheme,
    duplicateTheme,
    renameTheme,
    deleteTheme,
    performanceRange,
    performanceLoading,
    performanceMetrics,
    loadPerformance,
    preferences,
    appEmbeds,
    appBlocks,
    registerEmbed,
    registerBlock,
    editorSelectedSectionId,
    editorSelectedBlockId,
    editorActiveTemplateId,
    editorSidebarView,
    editorPreviewMode,
    editorInspectorEnabled,
    editorPreviewProductId,
    editorPreviewCollectionId,
    draftSnapshots,
    publishedSnapshots,
    editorSaveStatus,
    editorPublishStatus,
    initEditorDraft,
    syncIdentityDefaults,
    hasDraftChanges,
    hasUnpublishedChanges,
    saveDraft,
    publishDraft,
    undoStack,
    redoStack,
    pushUndo,
    undo,
    redo,
    canUndo,
    canRedo,
    installLibraryTheme,
    installingThemeId,
    installError,
  }
})
