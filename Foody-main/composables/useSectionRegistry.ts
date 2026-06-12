import type { ThemeSection, ThemeSetting, ThemeBlock } from '~/stores/useOnlineStoreStore'

export interface SectionDefinition {
  type: string
  label: string
  icon: string
  description: string
  category: 'header' | 'hero' | 'content' | 'products' | 'social' | 'footer' | 'promo' | 'media'
  defaultSettings: ThemeSetting[]
  defaultBlocks: ThemeBlock[]
  maxBlocks?: number
}

let _counter = 0
const uid = () => `${Date.now()}-${++_counter}`

export function useSectionRegistry() {
  const registry: SectionDefinition[] = [
    /* ── HEADER ── */
    {
      type: 'header',
      label: 'Encabezado',
      icon: 'i-lucide-panel-top',
      description: 'Barra de navegación superior con logo y enlaces',
      category: 'header',
      defaultSettings: [
        { key: 'logo_url', type: 'image', label: 'Logo', value: '', default: '' },
        { key: 'sticky', type: 'checkbox', label: 'Encabezado fijo', value: true, default: true },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#111827', default: '#111827' },
        { key: 'transparent', type: 'checkbox', label: 'Transparente sobre hero', value: false, default: false },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'nav_link', displayName: 'Enlace: Inicio', order: 0, hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Inicio', default: 'Inicio' }, { key: 'url', type: 'text', label: 'URL', value: '/', default: '/' }] },
        { id: `blk-${uid()}`, type: 'nav_link', displayName: 'Enlace: Carta', order: 1, hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Carta', default: 'Carta' }, { key: 'url', type: 'text', label: 'URL', value: '/menu', default: '/menu' }] },
      ],
    },

    /* ── HEROES ── */
    {
      type: 'hero_banner',
      label: 'Banner principal',
      icon: 'i-lucide-image',
      description: 'Hero a pantalla completa con título, subtítulo y CTA',
      category: 'hero',
      defaultSettings: [
        { key: 'heading', type: 'text', label: 'Título', value: '¡Bienvenidos!', default: '¡Bienvenidos!' },
        { key: 'subheading', type: 'text', label: 'Subtítulo', value: 'Los mejores platos a tu puerta', default: '' },
        { key: 'bg_image', type: 'image', label: 'Imagen de fondo', value: '', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#1a1a2e', default: '#1a1a2e' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#ffffff', default: '#ffffff' },
        { key: 'height', type: 'range', label: 'Altura (px)', value: 500, default: 500, min: 200, max: 800 },
        { key: 'overlay_opacity', type: 'range', label: 'Opacidad overlay', value: 40, default: 40, min: 0, max: 100 },
        { key: 'cta_text', type: 'text', label: 'Texto del botón', value: 'Ver menú', default: 'Ver menú' },
        { key: 'cta_url', type: 'text', label: 'URL del botón', value: '/menu', default: '/menu' },
        { key: 'alignment', type: 'select', label: 'Alineación', value: 'center', default: 'center', options: [{ label: 'Izquierda', value: 'left' }, { label: 'Centro', value: 'center' }, { label: 'Derecha', value: 'right' }] },
      ],
      defaultBlocks: [],
    },
    {
      type: 'hero_split',
      label: 'Hero dos columnas',
      icon: 'i-lucide-columns-2',
      description: 'Hero dividido: imagen a un lado, texto al otro',
      category: 'hero',
      defaultSettings: [
        { key: 'heading', type: 'text', label: 'Título', value: 'Comida fresca cada día', default: '' },
        { key: 'subheading', type: 'text', label: 'Subtítulo', value: 'Ingredientes de primera calidad', default: '' },
        { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' },
        { key: 'image_position', type: 'select', label: 'Posición imagen', value: 'right', default: 'right', options: [{ label: 'Izquierda', value: 'left' }, { label: 'Derecha', value: 'right' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#f9fafb', default: '#f9fafb' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#111827', default: '#111827' },
        { key: 'cta_text', type: 'text', label: 'Texto CTA', value: 'Pedir ahora', default: 'Pedir ahora' },
        { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/menu', default: '/menu' },
      ],
      defaultBlocks: [],
    },

    /* ── PROMO ── */
    {
      type: 'marquee',
      label: 'Barra de anuncio',
      icon: 'i-lucide-megaphone',
      description: 'Barra superior con texto animado o estático',
      category: 'promo',
      defaultSettings: [
        { key: 'text', type: 'text', label: 'Texto', value: '🔥 Envío gratis en pedidos superiores a 25€', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#111827', default: '#111827' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#ffffff', default: '#ffffff' },
        { key: 'animated', type: 'checkbox', label: 'Texto animado (marquee)', value: false, default: false },
        { key: 'dismissible', type: 'checkbox', label: 'Permitir cerrar', value: true, default: true },
        { key: 'link_url', type: 'text', label: 'URL (opcional)', value: '', default: '' },
      ],
      defaultBlocks: [],
    },
    {
      type: 'promo_banner',
      label: 'Banner promocional',
      icon: 'i-lucide-badge-percent',
      description: 'Banner visual para promociones con countdown opcional',
      category: 'promo',
      defaultSettings: [
        { key: 'heading', type: 'text', label: 'Título', value: '¡Oferta especial!', default: '' },
        { key: 'subheading', type: 'text', label: 'Subtítulo', value: '20% de descuento en tu primer pedido', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#fef3c7', default: '#fef3c7' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#92400e', default: '#92400e' },
        { key: 'cta_text', type: 'text', label: 'Texto CTA', value: 'Usar código: FOODFY20', default: '' },
        { key: 'show_countdown', type: 'checkbox', label: 'Mostrar cuenta atrás', value: false, default: false },
        { key: 'countdown_date', type: 'text', label: 'Fecha fin (YYYY-MM-DD)', value: '2026-12-31', default: '' },
      ],
      defaultBlocks: [],
    },
    {
      type: 'countdown_timer',
      label: 'Temporizador promocional',
      icon: 'i-lucide-timer',
      description: 'Cuenta atrás visual para ofertas temporales',
      category: 'promo',
      defaultSettings: [
        { key: 'heading', type: 'text', label: 'Título', value: 'La oferta termina en', default: '' },
        { key: 'end_date', type: 'text', label: 'Fecha fin (YYYY-MM-DD HH:MM)', value: '2026-12-31 23:59', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#1e293b', default: '#1e293b' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#ffffff', default: '#ffffff' },
        { key: 'accent_color', type: 'color', label: 'Color acento', value: '#e63946', default: '#e63946' },
        { key: 'expired_text', type: 'text', label: 'Texto al expirar', value: '¡Oferta finalizada!', default: '' },
      ],
      defaultBlocks: [],
    },

    /* ── PRODUCTS ── */
    {
      type: 'featured_collection',
      label: 'Colección destacada',
      icon: 'i-lucide-grid-3x3',
      description: 'Productos de una colección con rejilla configurable',
      category: 'products',
      defaultSettings: [
        { key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' },
        { key: 'title', type: 'text', label: 'Título', value: 'Platos populares', default: 'Destacados' },
        { key: 'subtitle', type: 'text', label: 'Subtítulo', value: '', default: '' },
        { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
        { key: 'show_price', type: 'checkbox', label: 'Mostrar precio', value: true, default: true },
        { key: 'show_badge', type: 'checkbox', label: 'Mostrar badge', value: true, default: true },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        { key: 'max_products', type: 'range', label: 'Máx. productos', value: 8, default: 8, min: 2, max: 16 },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'product_card', displayName: 'Producto: Hamburguesa', order: 0, hidden: false, settings: [{ key: 'product_name', type: 'text', label: 'Nombre', value: 'Hamburguesa clásica', default: '' }, { key: 'price', type: 'text', label: 'Precio', value: '9.50€', default: '' }, { key: 'badge', type: 'text', label: 'Badge', value: 'Popular', default: '' }] },
        { id: `blk-${uid()}`, type: 'product_card', displayName: 'Producto: Pizza', order: 1, hidden: false, settings: [{ key: 'product_name', type: 'text', label: 'Nombre', value: 'Pizza Margarita', default: '' }, { key: 'price', type: 'text', label: 'Precio', value: '11.00€', default: '' }, { key: 'badge', type: 'text', label: 'Badge', value: '', default: '' }] },
        { id: `blk-${uid()}`, type: 'product_card', displayName: 'Producto: Ensalada', order: 2, hidden: false, settings: [{ key: 'product_name', type: 'text', label: 'Nombre', value: 'Ensalada César', default: '' }, { key: 'price', type: 'text', label: 'Precio', value: '8.00€', default: '' }, { key: 'badge', type: 'text', label: 'Badge', value: 'Nuevo', default: '' }] },
        { id: `blk-${uid()}`, type: 'product_card', displayName: 'Producto: Pasta', order: 3, hidden: false, settings: [{ key: 'product_name', type: 'text', label: 'Nombre', value: 'Pasta Carbonara', default: '' }, { key: 'price', type: 'text', label: 'Precio', value: '10.50€', default: '' }, { key: 'badge', type: 'text', label: 'Badge', value: '', default: '' }] },
      ],
      maxBlocks: 16,
    },
    {
      type: 'collection_grid',
      label: 'Rejilla de colecciones',
      icon: 'i-lucide-layout-grid',
      description: 'Muestra varias colecciones en formato de cuadrícula',
      category: 'products',
      defaultSettings: [
        { key: 'title', type: 'text', label: 'Título', value: 'Nuestras categorías', default: '' },
        { key: 'columns', type: 'select', label: 'Columnas', value: '3', default: '3', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
        { key: 'show_filters', type: 'checkbox', label: 'Mostrar filtros', value: false, default: false },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'collection_card', displayName: 'Categoría: Entrantes', order: 0, hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'title', type: 'text', label: 'Nombre', value: 'Entrantes', default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }] },
        { id: `blk-${uid()}`, type: 'collection_card', displayName: 'Categoría: Principales', order: 1, hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'title', type: 'text', label: 'Nombre', value: 'Principales', default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }] },
        { id: `blk-${uid()}`, type: 'collection_card', displayName: 'Categoría: Postres', order: 2, hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'title', type: 'text', label: 'Nombre', value: 'Postres', default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }] },
      ],
    },
    {
      type: 'related_products',
      label: 'Productos relacionados',
      icon: 'i-lucide-sparkles',
      description: 'Rejilla de productos recomendados',
      category: 'products',
      defaultSettings: [
        { key: 'collectionId', type: 'collection-picker', label: 'Colección fuente', value: '', default: '' },
        { key: 'title', type: 'text', label: 'Título', value: 'También te puede gustar', default: '' },
        { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
        { key: 'max_products', type: 'range', label: 'Máx. productos', value: 4, default: 4, min: 2, max: 8 },
      ],
      defaultBlocks: [],
    },
    {
      type: 'best_sellers',
      label: 'Más vendidos',
      icon: 'i-lucide-trophy',
      description: 'Los productos más populares de la tienda',
      category: 'products',
      defaultSettings: [
        { key: 'collectionId', type: 'collection-picker', label: 'Colección fuente', value: '', default: '' },
        { key: 'title', type: 'text', label: 'Título', value: 'Los más vendidos', default: '' },
        { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [{ label: '3', value: '3' }, { label: '4', value: '4' }] },
        { key: 'show_ranking', type: 'checkbox', label: 'Mostrar ranking', value: true, default: true },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#f9fafb', default: '#f9fafb' },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'product_card', displayName: '#1 Hamburguesa', order: 0, hidden: false, settings: [{ key: 'product_name', type: 'text', label: 'Nombre', value: 'Hamburguesa clásica', default: '' }, { key: 'price', type: 'text', label: 'Precio', value: '9.50€', default: '' }, { key: 'badge', type: 'text', label: 'Badge', value: '#1', default: '' }] },
        { id: `blk-${uid()}`, type: 'product_card', displayName: '#2 Pizza', order: 1, hidden: false, settings: [{ key: 'product_name', type: 'text', label: 'Nombre', value: 'Pizza Margarita', default: '' }, { key: 'price', type: 'text', label: 'Precio', value: '11.00€', default: '' }, { key: 'badge', type: 'text', label: 'Badge', value: '#2', default: '' }] },
      ],
    },

    /* ── PRODUCT PAGE ── */
    {
      type: 'product_detail',
      label: 'Detalle de producto',
      icon: 'i-lucide-package',
      description: 'Página completa de producto con galería, variantes y CTA',
      category: 'products',
      defaultSettings: [
        { key: 'productId', type: 'product-picker', label: 'Producto', value: '', default: '' },
        { key: 'show_gallery', type: 'checkbox', label: 'Mostrar galería', value: true, default: true },
        { key: 'show_reviews', type: 'checkbox', label: 'Mostrar reseñas', value: true, default: true },
        { key: 'show_badges', type: 'checkbox', label: 'Mostrar badges', value: true, default: true },
        { key: 'show_shipping', type: 'checkbox', label: 'Info de envío', value: true, default: true },
        { key: 'show_accordion', type: 'checkbox', label: 'Acordeones informativos', value: true, default: true },
        { key: 'gallery_position', type: 'select', label: 'Posición galería', value: 'left', default: 'left', options: [{ label: 'Izquierda', value: 'left' }, { label: 'Derecha', value: 'right' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'product_gallery', displayName: 'Galería de imágenes', order: 0, hidden: false, settings: [{ key: 'zoom', type: 'checkbox', label: 'Zoom al hover', value: true, default: true }, { key: 'thumbnails', type: 'checkbox', label: 'Miniaturas', value: true, default: true }] },
        { id: `blk-${uid()}`, type: 'product_title', displayName: 'Título del producto', order: 1, hidden: false, settings: [{ key: 'show_vendor', type: 'checkbox', label: 'Mostrar marca', value: true, default: true }] },
        { id: `blk-${uid()}`, type: 'product_price', displayName: 'Precio', order: 2, hidden: false, settings: [{ key: 'show_compare', type: 'checkbox', label: 'Mostrar precio comparativo', value: true, default: true }, { key: 'show_tax', type: 'checkbox', label: 'Incluye impuestos', value: true, default: true }] },
        { id: `blk-${uid()}`, type: 'product_variants', displayName: 'Variantes', order: 3, hidden: false, settings: [{ key: 'style', type: 'select', label: 'Estilo', value: 'buttons', default: 'buttons', options: [{ label: 'Botones', value: 'buttons' }, { label: 'Dropdown', value: 'dropdown' }] }] },
        { id: `blk-${uid()}`, type: 'product_description', displayName: 'Descripción', order: 4, hidden: false, settings: [{ key: 'collapsible', type: 'checkbox', label: 'Colapsable', value: false, default: false }] },
        { id: `blk-${uid()}`, type: 'product_cta', displayName: 'Botón Añadir al carrito', order: 5, hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Añadir al carrito', default: 'Añadir al carrito' }, { key: 'style', type: 'select', label: 'Estilo', value: 'primary', default: 'primary', options: [{ label: 'Primario', value: 'primary' }, { label: 'Secundario', value: 'secondary' }, { label: 'Outline', value: 'outline' }] }] },
        { id: `blk-${uid()}`, type: 'product_badges', displayName: 'Badges', order: 6, hidden: false, settings: [{ key: 'badges', type: 'text', label: 'Badges (separados por coma)', value: 'Envío gratis,Garantía 30 días,100% natural', default: '' }] },
        { id: `blk-${uid()}`, type: 'product_shipping', displayName: 'Info de envío', order: 7, hidden: false, settings: [{ key: 'text', type: 'text', label: 'Texto', value: 'Entrega en 30-45 min', default: '' }, { key: 'icon', type: 'select', label: 'Icono', value: 'truck', default: 'truck', options: [{ label: 'Camión', value: 'truck' }, { label: 'Reloj', value: 'clock' }, { label: 'Escudo', value: 'shield' }] }] },
        { id: `blk-${uid()}`, type: 'product_accordion', displayName: 'Acordeón: Ingredientes', order: 8, hidden: false, settings: [{ key: 'title', type: 'text', label: 'Título', value: 'Ingredientes', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Pan brioche, carne de ternera 180g, lechuga, tomate, cebolla caramelizada, salsa especial.', default: '' }] },
        { id: `blk-${uid()}`, type: 'product_accordion', displayName: 'Acordeón: Alérgenos', order: 9, hidden: false, settings: [{ key: 'title', type: 'text', label: 'Título', value: 'Información de alérgenos', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Contiene gluten, lactosa, huevo. Puede contener trazas de frutos secos.', default: '' }] },
      ],
    },

    /* ── CONTENT ── */
    {
      type: 'rich_text',
      label: 'Texto enriquecido',
      icon: 'i-lucide-text',
      description: 'Bloque de texto con formato configurable',
      category: 'content',
      defaultSettings: [
        { key: 'content', type: 'textarea', label: 'Contenido', value: 'Somos un restaurante familiar con más de 10 años de experiencia.', default: '' },
        { key: 'alignment', type: 'select', label: 'Alineación', value: 'center', default: 'center', options: [{ label: 'Izquierda', value: 'left' }, { label: 'Centro', value: 'center' }, { label: 'Derecha', value: 'right' }] },
        { key: 'heading', type: 'text', label: 'Título (opcional)', value: '', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#374151', default: '#374151' },
        { key: 'max_width', type: 'select', label: 'Ancho máximo', value: 'md', default: 'md', options: [{ label: 'Estrecho', value: 'sm' }, { label: 'Mediano', value: 'md' }, { label: 'Ancho', value: 'lg' }, { label: 'Completo', value: 'full' }] },
      ],
      defaultBlocks: [],
    },
    {
      type: 'image_with_text',
      label: 'Imagen con texto',
      icon: 'i-lucide-layout-panel-left',
      description: 'Imagen al lado de bloque de texto con CTA',
      category: 'content',
      defaultSettings: [
        { key: 'heading', type: 'text', label: 'Título', value: 'Nuestra historia', default: '' },
        { key: 'content', type: 'textarea', label: 'Contenido', value: 'Desde 2016, servimos los mejores platos con ingredientes locales y de temporada.', default: '' },
        { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' },
        { key: 'image_position', type: 'select', label: 'Posición imagen', value: 'left', default: 'left', options: [{ label: 'Izquierda', value: 'left' }, { label: 'Derecha', value: 'right' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        { key: 'cta_text', type: 'text', label: 'Texto CTA', value: 'Saber más', default: '' },
        { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/about', default: '' },
        { key: 'aspect_ratio', type: 'select', label: 'Ratio de imagen', value: '1:1', default: '1:1', options: [{ label: '1:1', value: '1:1' }, { label: '4:3', value: '4:3' }, { label: '16:9', value: '16:9' }] },
      ],
      defaultBlocks: [],
    },
    {
      type: 'video_section',
      label: 'Vídeo',
      icon: 'i-lucide-play-circle',
      description: 'Sección de vídeo embebido (YouTube/URL)',
      category: 'media',
      defaultSettings: [
        { key: 'heading', type: 'text', label: 'Título', value: '', default: '' },
        { key: 'video_url', type: 'text', label: 'URL del vídeo', value: '', default: '' },
        { key: 'autoplay', type: 'checkbox', label: 'Autoplay', value: false, default: false },
        { key: 'aspect_ratio', type: 'select', label: 'Ratio', value: '16:9', default: '16:9', options: [{ label: '16:9', value: '16:9' }, { label: '4:3', value: '4:3' }, { label: '1:1', value: '1:1' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#000000', default: '#000000' },
      ],
      defaultBlocks: [],
    },

    /* ── SOCIAL PROOF ── */
    {
      type: 'testimonials',
      label: 'Testimonios',
      icon: 'i-lucide-quote',
      description: 'Reseñas y testimonios de clientes',
      category: 'social',
      defaultSettings: [
        { key: 'title', type: 'text', label: 'Título', value: 'Lo que dicen nuestros clientes', default: '' },
        { key: 'columns', type: 'select', label: 'Columnas', value: '3', default: '3', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#f9fafb', default: '#f9fafb' },
        { key: 'show_stars', type: 'checkbox', label: 'Mostrar estrellas', value: true, default: true },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'testimonial', displayName: 'Reseña: María', order: 0, hidden: false, settings: [{ key: 'author', type: 'text', label: 'Autor', value: 'María G.', default: '' }, { key: 'text', type: 'textarea', label: 'Texto', value: 'La mejor hamburguesa que he probado. Entrega rapidísima.', default: '' }, { key: 'rating', type: 'range', label: 'Estrellas', value: 5, default: 5, min: 1, max: 5 }] },
        { id: `blk-${uid()}`, type: 'testimonial', displayName: 'Reseña: Carlos', order: 1, hidden: false, settings: [{ key: 'author', type: 'text', label: 'Autor', value: 'Carlos R.', default: '' }, { key: 'text', type: 'textarea', label: 'Texto', value: 'Pedimos para toda la oficina. Todo llegó caliente y perfecto.', default: '' }, { key: 'rating', type: 'range', label: 'Estrellas', value: 5, default: 5, min: 1, max: 5 }] },
        { id: `blk-${uid()}`, type: 'testimonial', displayName: 'Reseña: Laura', order: 2, hidden: false, settings: [{ key: 'author', type: 'text', label: 'Autor', value: 'Laura M.', default: '' }, { key: 'text', type: 'textarea', label: 'Texto', value: 'Las opciones vegetarianas son increíbles. Muy recomendable.', default: '' }, { key: 'rating', type: 'range', label: 'Estrellas', value: 4, default: 5, min: 1, max: 5 }] },
      ],
    },
    {
      type: 'trust_icons',
      label: 'Iconos de confianza',
      icon: 'i-lucide-shield-check',
      description: 'Badges de garantía, envío, seguridad, etc.',
      category: 'social',
      defaultSettings: [
        { key: 'title', type: 'text', label: 'Título', value: '', default: '' },
        { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [{ label: '3', value: '3' }, { label: '4', value: '4' }, { label: '5', value: '5' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        { key: 'icon_color', type: 'color', label: 'Color de iconos', value: '#059669', default: '#059669' },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'trust_item', displayName: 'Envío gratis', order: 0, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'truck', default: 'truck', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Corazón', value: 'heart' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Envío gratis', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'En pedidos +25€', default: '' }] },
        { id: `blk-${uid()}`, type: 'trust_item', displayName: 'Entrega rápida', order: 1, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'clock', default: 'truck', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Corazón', value: 'heart' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Entrega en 30 min', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'O tu pedido gratis', default: '' }] },
        { id: `blk-${uid()}`, type: 'trust_item', displayName: 'Pago seguro', order: 2, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'shield', default: 'truck', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Corazón', value: 'heart' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Pago seguro', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'SSL + 3D Secure', default: '' }] },
        { id: `blk-${uid()}`, type: 'trust_item', displayName: 'Satisfacción', order: 3, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'heart', default: 'truck', options: [{ label: 'Camión', value: 'truck' }, { label: 'Escudo', value: 'shield' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Corazón', value: 'heart' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: '100% satisfacción', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'O te devolvemos el dinero', default: '' }] },
      ],
    },
    {
      type: 'features_grid',
      label: 'Beneficios / Features',
      icon: 'i-lucide-gem',
      description: 'Cuadrícula de características o beneficios clave',
      category: 'content',
      defaultSettings: [
        { key: 'title', type: 'text', label: 'Título', value: '¿Por qué elegirnos?', default: '' },
        { key: 'columns', type: 'select', label: 'Columnas', value: '3', default: '3', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        { key: 'icon_color', type: 'color', label: 'Color de iconos', value: '#e63946', default: '#e63946' },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'feature_item', displayName: 'Feature: Ingredientes', order: 0, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'leaf', default: 'star', options: [{ label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Fuego', value: 'flame' }, { label: 'Corazón', value: 'heart' }, { label: 'Rayo', value: 'zap' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Ingredientes frescos', default: '' }, { key: 'description', type: 'textarea', label: 'Descripción', value: 'Solo usamos ingredientes de proximidad y de temporada.', default: '' }] },
        { id: `blk-${uid()}`, type: 'feature_item', displayName: 'Feature: Rapidez', order: 1, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'zap', default: 'star', options: [{ label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Fuego', value: 'flame' }, { label: 'Corazón', value: 'heart' }, { label: 'Rayo', value: 'zap' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Entrega ultrarrápida', default: '' }, { key: 'description', type: 'textarea', label: 'Descripción', value: 'Tu pedido en menos de 30 minutos o es gratis.', default: '' }] },
        { id: `blk-${uid()}`, type: 'feature_item', displayName: 'Feature: Calidad', order: 2, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'heart', default: 'star', options: [{ label: 'Estrella', value: 'star' }, { label: 'Hoja', value: 'leaf' }, { label: 'Fuego', value: 'flame' }, { label: 'Corazón', value: 'heart' }, { label: 'Rayo', value: 'zap' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Hecho con amor', default: '' }, { key: 'description', type: 'textarea', label: 'Descripción', value: 'Cada plato está preparado al momento por nuestros chefs.', default: '' }] },
      ],
    },
    {
      type: 'logo_list',
      label: 'Logos de marcas',
      icon: 'i-lucide-building-2',
      description: 'Fila de logos de partners o marcas colaboradoras',
      category: 'social',
      defaultSettings: [
        { key: 'title', type: 'text', label: 'Título', value: 'Confían en nosotros', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        { key: 'grayscale', type: 'checkbox', label: 'Logos en escala de grises', value: true, default: true },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'logo_item', displayName: 'Logo 1', order: 0, hidden: false, settings: [{ key: 'name', type: 'text', label: 'Nombre', value: 'Partner 1', default: '' }, { key: 'image', type: 'image', label: 'Logo', value: '', default: '' }] },
        { id: `blk-${uid()}`, type: 'logo_item', displayName: 'Logo 2', order: 1, hidden: false, settings: [{ key: 'name', type: 'text', label: 'Nombre', value: 'Partner 2', default: '' }, { key: 'image', type: 'image', label: 'Logo', value: '', default: '' }] },
      ],
    },

    /* ── FAQ ── */
    {
      type: 'faq_accordion',
      label: 'FAQ / Acordeón',
      icon: 'i-lucide-help-circle',
      description: 'Preguntas frecuentes con secciones colapsables',
      category: 'content',
      defaultSettings: [
        { key: 'title', type: 'text', label: 'Título', value: 'Preguntas frecuentes', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        { key: 'max_width', type: 'select', label: 'Ancho máximo', value: 'md', default: 'md', options: [{ label: 'Estrecho', value: 'sm' }, { label: 'Mediano', value: 'md' }, { label: 'Ancho', value: 'lg' }] },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'faq_item', displayName: 'FAQ: Envío', order: 0, hidden: false, settings: [{ key: 'question', type: 'text', label: 'Pregunta', value: '¿Cuánto tarda el envío?', default: '' }, { key: 'answer', type: 'textarea', label: 'Respuesta', value: 'Nuestro tiempo medio de entrega es de 30-45 minutos.', default: '' }] },
        { id: `blk-${uid()}`, type: 'faq_item', displayName: 'FAQ: Devoluciones', order: 1, hidden: false, settings: [{ key: 'question', type: 'text', label: 'Pregunta', value: '¿Puedo devolver mi pedido?', default: '' }, { key: 'answer', type: 'textarea', label: 'Respuesta', value: 'Si no estás satisfecho, contacta con nosotros en los primeros 30 minutos y te lo reenviamos o reembolsamos.', default: '' }] },
        { id: `blk-${uid()}`, type: 'faq_item', displayName: 'FAQ: Alérgenos', order: 2, hidden: false, settings: [{ key: 'question', type: 'text', label: 'Pregunta', value: '¿Tienen opciones para alérgicos?', default: '' }, { key: 'answer', type: 'textarea', label: 'Respuesta', value: 'Sí, tenemos opciones sin gluten, sin lactosa y veganas. Consulta la información de alérgenos en cada producto.', default: '' }] },
      ],
    },

    /* ── NEWSLETTER ── */
    {
      type: 'newsletter',
      label: 'Newsletter',
      icon: 'i-lucide-mail',
      description: 'Formulario de suscripción por email',
      category: 'content',
      defaultSettings: [
        { key: 'heading', type: 'text', label: 'Título', value: '¿No te lo quieres perder?', default: '' },
        { key: 'subheading', type: 'text', label: 'Subtítulo', value: 'Suscríbete y recibe ofertas exclusivas y novedades.', default: '' },
        { key: 'placeholder', type: 'text', label: 'Placeholder', value: 'Tu email', default: 'Tu email' },
        { key: 'button_text', type: 'text', label: 'Texto del botón', value: 'Suscribirme', default: 'Suscribirme' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#f3f4f6', default: '#f3f4f6' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#111827', default: '#111827' },
      ],
      defaultBlocks: [],
    },

    /* ── FOOTER ── */
    {
      type: 'footer',
      label: 'Pie de página',
      icon: 'i-lucide-panel-bottom',
      description: 'Footer con columnas, copyright y redes sociales',
      category: 'footer',
      defaultSettings: [
        { key: 'show_social', type: 'checkbox', label: 'Mostrar redes sociales', value: true, default: true },
        { key: 'copyright', type: 'text', label: 'Copyright', value: '', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#111827', default: '#111827' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#d1d5db', default: '#d1d5db' },
        { key: 'columns_count', type: 'select', label: 'Columnas', value: '4', default: '4', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'footer_column', displayName: 'Columna: Contacto', order: 0, hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Contacto', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: '', default: '' }] },
        { id: `blk-${uid()}`, type: 'footer_column', displayName: 'Columna: Horario', order: 1, hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Horario', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Lun-Vie: 12:00 - 23:00\nSáb-Dom: 12:00 - 00:00', default: '' }] },
        { id: `blk-${uid()}`, type: 'footer_column', displayName: 'Columna: Empresa', order: 2, hidden: false, settings: [{ key: 'heading', type: 'text', label: 'Encabezado', value: 'Empresa', default: '' }, { key: 'content', type: 'textarea', label: 'Contenido', value: 'Sobre nosotros\nBlog\nTrabaja con nosotros', default: '' }] },
      ],
    },

    /* ── CTA STRIP ── */
    {
      type: 'cta_strip',
      label: 'Banda CTA',
      icon: 'i-lucide-megaphone',
      description: 'Franja de llamada a la acción de ancho completo con título y botón',
      category: 'content',
      defaultSettings: [
        { key: 'heading', type: 'text', label: 'Título', value: '¿Listo para pedir?', default: '¿Listo para pedir?' },
        { key: 'subtext', type: 'text', label: 'Subtexto', value: 'Entrega rápida directamente a tu puerta.', default: '' },
        { key: 'cta_text', type: 'text', label: 'Texto del botón', value: 'Ver el menú', default: 'Ver el menú' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#e63946', default: '#e63946' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#ffffff', default: '#ffffff' },
        { key: 'style', type: 'select', label: 'Estilo', value: 'filled', default: 'filled', options: [{ label: 'Relleno', value: 'filled' }, { label: 'Borde', value: 'outline' }] },
      ],
      defaultBlocks: [],
    },

    /* ── HOW IT WORKS ── */
    {
      type: 'how_it_works',
      label: 'Cómo funciona',
      icon: 'i-lucide-list-ordered',
      description: 'Sección de pasos visuales para explicar el proceso de compra',
      category: 'content',
      defaultSettings: [
        { key: 'title', type: 'text', label: 'Título', value: '¿Cómo funciona?', default: '¿Cómo funciona?' },
        { key: 'subtitle', type: 'text', label: 'Subtítulo', value: '', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#f9fafb', default: '#f9fafb' },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'step', displayName: 'Paso 1', order: 0, hidden: false, settings: [{ key: 'icon', type: 'text', label: 'Icono', value: 'map', default: 'map' }, { key: 'title', type: 'text', label: 'Título', value: 'Elige tu pedido', default: '' }, { key: 'description', type: 'textarea', label: 'Descripción', value: 'Explora nuestro menú y añade tus favoritos al carrito.', default: '' }] },
        { id: `blk-${uid()}`, type: 'step', displayName: 'Paso 2', order: 1, hidden: false, settings: [{ key: 'icon', type: 'text', label: 'Icono', value: 'check', default: 'check' }, { key: 'title', type: 'text', label: 'Título', value: 'Confirma el pedido', default: '' }, { key: 'description', type: 'textarea', label: 'Descripción', value: 'Revisa tu carrito y completa el pago de forma segura.', default: '' }] },
        { id: `blk-${uid()}`, type: 'step', displayName: 'Paso 3', order: 2, hidden: false, settings: [{ key: 'icon', type: 'text', label: 'Icono', value: 'truck', default: 'truck' }, { key: 'title', type: 'text', label: 'Título', value: 'Recibe en casa', default: '' }, { key: 'description', type: 'textarea', label: 'Descripción', value: 'Te lo llevamos en menos de 45 minutos.', default: '' }] },
      ],
      maxBlocks: 6,
    },

    /* ── STATS ROW ── */
    {
      type: 'stats_row',
      label: 'Estadísticas',
      icon: 'i-lucide-bar-chart-2',
      description: 'Fila de métricas o logros destacados (números grandes)',
      category: 'content',
      defaultSettings: [
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#111827', default: '#111827' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#ffffff', default: '#ffffff' },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'stat', displayName: 'Estadística 1', order: 0, hidden: false, settings: [{ key: 'value', type: 'text', label: 'Valor', value: '+10.000', default: '' }, { key: 'label', type: 'text', label: 'Etiqueta', value: 'Clientes satisfechos', default: '' }] },
        { id: `blk-${uid()}`, type: 'stat', displayName: 'Estadística 2', order: 1, hidden: false, settings: [{ key: 'value', type: 'text', label: 'Valor', value: '4.9★', default: '' }, { key: 'label', type: 'text', label: 'Etiqueta', value: 'Valoración media', default: '' }] },
        { id: `blk-${uid()}`, type: 'stat', displayName: 'Estadística 3', order: 2, hidden: false, settings: [{ key: 'value', type: 'text', label: 'Valor', value: '<30 min', default: '' }, { key: 'label', type: 'text', label: 'Etiqueta', value: 'Tiempo de entrega', default: '' }] },
        { id: `blk-${uid()}`, type: 'stat', displayName: 'Estadística 4', order: 3, hidden: false, settings: [{ key: 'value', type: 'text', label: 'Valor', value: '100%', default: '' }, { key: 'label', type: 'text', label: 'Etiqueta', value: 'Ingredientes frescos', default: '' }] },
      ],
      maxBlocks: 6,
    },

    /* ── DAILY SPECIAL ── */
    {
      type: 'daily_special',
      label: 'Plato del día',
      icon: 'i-lucide-chef-hat',
      description: 'Destaca un producto estrella con imagen grande y botón de compra',
      category: 'products',
      defaultSettings: [
        { key: 'badge_text', type: 'text', label: 'Texto del badge', value: 'Plato del día', default: 'Plato del día' },
        { key: 'heading', type: 'text', label: 'Título (override)', value: '', default: '' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#fffbf5', default: '#fffbf5' },
        { key: 'productId', type: 'text', label: 'ID de producto', value: '', default: '' },
        { key: 'image_override', type: 'image', label: 'Imagen alternativa', value: '', default: '' },
      ],
      defaultBlocks: [],
    },

    /* ── EDITORIAL HERO ── */
    {
      type: 'editorial_hero',
      label: 'Hero editorial',
      icon: 'i-lucide-image',
      description: 'Hero full-bleed con imagen dominante y copy mínimo. Sin overlay-CTA agresivo.',
      category: 'hero',
      defaultSettings: [
        { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' },
        { key: 'image_mobile', type: 'image', label: 'Imagen mobile (opcional)', value: '', default: '' },
        { key: 'heading', type: 'text', label: 'Título (máx. 5 palabras)', value: '', default: '' },
        { key: 'eyebrow', type: 'text', label: 'Etiqueta (colección/temporada)', value: '', default: '' },
        { key: 'heading_position', type: 'select', label: 'Posición del texto', value: 'bottom-left', default: 'bottom-left', options: [{ label: 'Inferior izquierda', value: 'bottom-left' }, { label: 'Centro', value: 'center' }, { label: 'Inferior derecha', value: 'bottom-right' }, { label: 'Oculto', value: 'hidden' }] },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#ffffff', default: '#ffffff' },
        { key: 'show_cta', type: 'checkbox', label: 'Mostrar CTA', value: false, default: false },
        { key: 'cta_text', type: 'text', label: 'Texto CTA', value: 'Ver carta', default: '' },
        { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/', default: '/' },
        { key: 'height', type: 'select', label: 'Altura', value: 'full', default: 'full', options: [{ label: 'Completa (100vh)', value: 'full' }, { label: 'Grande (80vh)', value: 'large' }, { label: 'Media (60vh)', value: 'medium' }] },
        { key: 'overlay_start', type: 'range', label: 'Gradiente inferior (%)', value: 20, default: 20, min: 0, max: 60 },
      ],
      defaultBlocks: [],
    },

    /* ── EDITORIAL GALLERY ── */
    {
      type: 'editorial_gallery',
      label: 'Galería editorial',
      icon: 'i-lucide-layout-grid',
      description: 'Grid de productos elevado con imágenes dominantes y tipografía tratable editorialmente.',
      category: 'products',
      defaultSettings: [
        { key: 'title', type: 'text', label: 'Título', value: '', default: '' },
        { key: 'title_style', type: 'select', label: 'Estilo de título', value: 'uppercase', default: 'uppercase', options: [{ label: 'Mayúsculas', value: 'uppercase' }, { label: 'Normal', value: 'normal' }] },
        { key: 'subtitle', type: 'text', label: 'Subtítulo', value: '', default: '' },
        { key: 'columns', type: 'select', label: 'Columnas', value: '3', default: '3', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
        { key: 'image_ratio', type: 'select', label: 'Ratio de imagen', value: 'portrait', default: 'portrait', options: [{ label: 'Cuadrado (1:1)', value: 'square' }, { label: 'Retrato (3:4)', value: 'portrait' }, { label: 'Paisaje (4:3)', value: 'landscape' }] },
        { key: 'show_price', type: 'checkbox', label: 'Mostrar precio', value: true, default: true },
        { key: 'show_name', type: 'checkbox', label: 'Mostrar nombre', value: true, default: true },
        { key: 'gap', type: 'select', label: 'Separación', value: 'small', default: 'small', options: [{ label: 'Sin separación', value: 'seamless' }, { label: 'Pequeña', value: 'small' }, { label: 'Media', value: 'medium' }] },
        { key: 'hover_effect', type: 'select', label: 'Efecto hover', value: 'zoom', default: 'zoom', options: [{ label: 'Zoom', value: 'zoom' }, { label: 'Swap de imagen', value: 'swap' }, { label: 'Ninguno', value: 'none' }] },
        { key: 'name_position', type: 'select', label: 'Posición del nombre', value: 'below', default: 'below', options: [{ label: 'Debajo', value: 'below' }, { label: 'Superpuesto', value: 'overlay' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#fafaf8', default: '#fafaf8' },
        { key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' },
        { key: 'max_products', type: 'range', label: 'Máx. productos', value: 6, default: 6, min: 2, max: 16 },
        { key: 'cta_text', type: 'text', label: 'Texto CTA (opcional)', value: '', default: '' },
        { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/', default: '/' },
      ],
      defaultBlocks: [],
    },

    /* ── BRAND MANIFESTO ── */
    {
      type: 'brand_manifesto',
      label: 'Manifiesto de marca',
      icon: 'i-lucide-quote',
      description: 'Sección editorial de storytelling. El copy es el protagonista. Comunica identidad, no vende.',
      category: 'content',
      defaultSettings: [
        { key: 'heading', type: 'text', label: 'Título', value: 'Nuestra filosofía', default: '' },
        { key: 'eyebrow', type: 'text', label: 'Etiqueta superior', value: '', default: '' },
        { key: 'body', type: 'textarea', label: 'Copy editorial', value: '', default: '' },
        { key: 'layout', type: 'select', label: 'Disposición', value: 'centered', default: 'centered', options: [{ label: 'Centrado', value: 'centered' }, { label: 'Alineado a la izquierda', value: 'left-aligned' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#f5efe3', default: '#f5efe3' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#1a1209', default: '#1a1209' },
        { key: 'bg_image', type: 'image', label: 'Imagen de fondo (opcional)', value: '', default: '' },
        { key: 'overlay_opacity', type: 'range', label: 'Opacidad overlay', value: 0, default: 0, min: 0, max: 80 },
        { key: 'show_features', type: 'checkbox', label: 'Mostrar features', value: true, default: true },
        { key: 'cta_text', type: 'text', label: 'Texto CTA (opcional)', value: '', default: '' },
        { key: 'cta_url', type: 'text', label: 'URL CTA', value: '/', default: '/' },
        { key: 'max_width', type: 'select', label: 'Ancho máximo del texto', value: 'medium', default: 'medium', options: [{ label: 'Estrecho', value: 'narrow' }, { label: 'Medio', value: 'medium' }, { label: 'Ancho', value: 'wide' }] },
        { key: 'padding_top', type: 'select', label: 'Padding superior', value: 'lg', default: 'lg', options: [{ label: 'Ninguno', value: 'none' }, { label: 'Pequeño', value: 'sm' }, { label: 'Medio', value: 'md' }, { label: 'Grande', value: 'lg' }, { label: 'Extra grande', value: 'xl' }] },
        { key: 'padding_bottom', type: 'select', label: 'Padding inferior', value: 'lg', default: 'lg', options: [{ label: 'Ninguno', value: 'none' }, { label: 'Pequeño', value: 'sm' }, { label: 'Medio', value: 'md' }, { label: 'Grande', value: 'lg' }, { label: 'Extra grande', value: 'xl' }] },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'manifesto_feature', displayName: 'Feature 1', order: 0, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'leaf', default: 'leaf', options: [{ label: 'Hoja', value: 'leaf' }, { label: 'Escudo', value: 'shield' }, { label: 'Camión', value: 'truck' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Corazón', value: 'heart' }, { label: 'Gema', value: 'gem' }, { label: 'Globe', value: 'globe' }, { label: 'Rayo', value: 'zap' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Producto local', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Ingredientes de proximidad en cada receta.', default: '' }] },
        { id: `blk-${uid()}`, type: 'manifesto_feature', displayName: 'Feature 2', order: 1, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'gem', default: 'leaf', options: [{ label: 'Hoja', value: 'leaf' }, { label: 'Escudo', value: 'shield' }, { label: 'Camión', value: 'truck' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Corazón', value: 'heart' }, { label: 'Gema', value: 'gem' }, { label: 'Globe', value: 'globe' }, { label: 'Rayo', value: 'zap' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Elaboración propia', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Cocinamos todo en nuestro obrador.', default: '' }] },
        { id: `blk-${uid()}`, type: 'manifesto_feature', displayName: 'Feature 3', order: 2, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'shield', default: 'leaf', options: [{ label: 'Hoja', value: 'leaf' }, { label: 'Escudo', value: 'shield' }, { label: 'Camión', value: 'truck' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Corazón', value: 'heart' }, { label: 'Gema', value: 'gem' }, { label: 'Globe', value: 'globe' }, { label: 'Rayo', value: 'zap' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Sin artificiales', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Cero conservantes. Cero aditivos.', default: '' }] },
        { id: `blk-${uid()}`, type: 'manifesto_feature', displayName: 'Feature 4', order: 3, hidden: false, settings: [{ key: 'icon', type: 'select', label: 'Icono', value: 'globe', default: 'leaf', options: [{ label: 'Hoja', value: 'leaf' }, { label: 'Escudo', value: 'shield' }, { label: 'Camión', value: 'truck' }, { label: 'Reloj', value: 'clock' }, { label: 'Estrella', value: 'star' }, { label: 'Corazón', value: 'heart' }, { label: 'Gema', value: 'gem' }, { label: 'Globe', value: 'globe' }, { label: 'Rayo', value: 'zap' }, { label: 'Check', value: 'check' }] }, { key: 'title', type: 'text', label: 'Título', value: 'Origen trazable', default: '' }, { key: 'description', type: 'text', label: 'Descripción', value: 'Conocemos cada uno de nuestros proveedores.', default: '' }] },
      ],
      maxBlocks: 6,
    },

    /* ── COLLECTION SELECTOR ── */
    {
      type: 'collection_selector',
      label: 'Selector de colecciones',
      icon: 'i-lucide-gallery-thumbnails',
      description: 'Tiles cuadrados o rectangulares de colecciones. Editorial, curado. Diferente del grid estándar.',
      category: 'products',
      defaultSettings: [
        { key: 'title', type: 'text', label: 'Título', value: 'Nuestra carta', default: '' },
        { key: 'eyebrow', type: 'text', label: 'Etiqueta superior', value: '', default: '' },
        { key: 'layout', type: 'select', label: 'Disposición', value: 'tiles', default: 'tiles', options: [{ label: 'Cuadrícula', value: 'tiles' }, { label: 'Scroll horizontal', value: 'horizontal-scroll' }] },
        { key: 'tile_ratio', type: 'select', label: 'Ratio del tile', value: 'square', default: 'square', options: [{ label: 'Cuadrado', value: 'square' }, { label: 'Retrato', value: 'portrait' }] },
        { key: 'show_name', type: 'checkbox', label: 'Mostrar nombre', value: true, default: true },
        { key: 'name_style', type: 'select', label: 'Estilo del nombre', value: 'overlay', default: 'overlay', options: [{ label: 'Superpuesto', value: 'overlay' }, { label: 'Debajo', value: 'below' }] },
        { key: 'name_transform', type: 'select', label: 'Transformación nombre', value: 'uppercase', default: 'uppercase', options: [{ label: 'Mayúsculas', value: 'uppercase' }, { label: 'Normal', value: 'normal' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#fafaf8', default: '#fafaf8' },
        { key: 'columns', type: 'select', label: 'Columnas', value: '4', default: '4', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
        { key: 'gap', type: 'select', label: 'Separación', value: 'small', default: 'small', options: [{ label: 'Pequeña', value: 'small' }, { label: 'Media', value: 'medium' }] },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'collection_tile', displayName: 'Tile: Entrantes', order: 0, hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: 'ENTRANTES', default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }, { key: 'badge_text', type: 'text', label: 'Badge', value: '', default: '' }, { key: 'cta_url', type: 'text', label: 'URL destino', value: '/', default: '/' }] },
        { id: `blk-${uid()}`, type: 'collection_tile', displayName: 'Tile: Principales', order: 1, hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: 'PRINCIPALES', default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }, { key: 'badge_text', type: 'text', label: 'Badge', value: '', default: '' }, { key: 'cta_url', type: 'text', label: 'URL destino', value: '/', default: '/' }] },
        { id: `blk-${uid()}`, type: 'collection_tile', displayName: 'Tile: Postres', order: 2, hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: 'POSTRES', default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }, { key: 'badge_text', type: 'text', label: 'Badge', value: '', default: '' }, { key: 'cta_url', type: 'text', label: 'URL destino', value: '/', default: '/' }] },
        { id: `blk-${uid()}`, type: 'collection_tile', displayName: 'Tile: Bebidas', order: 3, hidden: false, settings: [{ key: 'collectionId', type: 'collection-picker', label: 'Colección', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre', value: 'BEBIDAS', default: '' }, { key: 'image', type: 'image', label: 'Imagen', value: '', default: '' }, { key: 'badge_text', type: 'text', label: 'Badge', value: '', default: '' }, { key: 'cta_url', type: 'text', label: 'URL destino', value: '/', default: '/' }] },
      ],
      maxBlocks: 8,
    },

    /* ── SHOP THE LOOK ── */
    {
      type: 'shop_the_look',
      label: 'Shop The Look',
      icon: 'i-lucide-shirt',
      description: 'Cross-sell contextual: imagen editorial del plato/outfit completo + productos individuales con quick-add.',
      category: 'products',
      defaultSettings: [
        { key: 'heading', type: 'text', label: 'Título', value: 'Completa el pedido', default: 'Completa el pedido' },
        { key: 'editorial_image', type: 'image', label: 'Imagen editorial', value: '', default: '' },
        { key: 'image_position', type: 'select', label: 'Posición de imagen', value: 'left', default: 'left', options: [{ label: 'Izquierda', value: 'left' }, { label: 'Derecha', value: 'right' }] },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#ffffff', default: '#ffffff' },
        { key: 'show_total_price', type: 'checkbox', label: 'Mostrar precio total', value: false, default: false },
        { key: 'cta_add_all_text', type: 'text', label: 'Texto "Añadir todo" (opcional)', value: '', default: '' },
        { key: 'image_ratio', type: 'select', label: 'Ratio imagen editorial', value: '4:5', default: '4:5', options: [{ label: '4:5', value: '4:5' }, { label: '3:4', value: '3:4' }, { label: '1:1', value: '1:1' }] },
      ],
      defaultBlocks: [
        { id: `blk-${uid()}`, type: 'look_item', displayName: 'Producto 1', order: 0, hidden: false, settings: [{ key: 'productId', type: 'product-picker', label: 'Producto', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre override', value: '', default: '' }, { key: 'show_sizes', type: 'checkbox', label: 'Mostrar variantes', value: true, default: true }] },
        { id: `blk-${uid()}`, type: 'look_item', displayName: 'Producto 2', order: 1, hidden: false, settings: [{ key: 'productId', type: 'product-picker', label: 'Producto', value: '', default: '' }, { key: 'label', type: 'text', label: 'Nombre override', value: '', default: '' }, { key: 'show_sizes', type: 'checkbox', label: 'Mostrar variantes', value: true, default: true }] },
      ],
      maxBlocks: 4,
    },

    /* ── DROP ANNOUNCEMENT ── */
    {
      type: 'drop_announcement',
      label: 'Barra de lanzamiento',
      icon: 'i-lucide-zap',
      description: 'Barra prominente para anuncio de nuevo drop o novedad. Más visual que el marquee estándar.',
      category: 'promo',
      defaultSettings: [
        { key: 'badge_text', type: 'text', label: 'Texto del badge', value: 'NUEVO', default: 'NUEVO' },
        { key: 'show_badge', type: 'checkbox', label: 'Mostrar badge', value: true, default: true },
        { key: 'badge_animate', type: 'checkbox', label: 'Animar badge (pulso)', value: true, default: true },
        { key: 'heading', type: 'text', label: 'Texto principal', value: 'Nueva carta disponible ahora', default: '' },
        { key: 'tagline', type: 'text', label: 'Texto secundario (opcional)', value: '', default: '' },
        { key: 'cta_text', type: 'text', label: 'Texto del enlace', value: 'Ver carta', default: 'Ver carta' },
        { key: 'cta_url', type: 'text', label: 'URL del enlace', value: '/', default: '/' },
        { key: 'bg_color', type: 'color', label: 'Color de fondo', value: '#0f0f0f', default: '#0f0f0f' },
        { key: 'text_color', type: 'color', label: 'Color de texto', value: '#ffffff', default: '#ffffff' },
        { key: 'dismissible', type: 'checkbox', label: 'Permitir cerrar', value: false, default: false },
        { key: 'height', type: 'select', label: 'Altura', value: 'compact', default: 'compact', options: [{ label: 'Compacta (44px)', value: 'compact' }, { label: 'Media (72px)', value: 'medium' }, { label: 'Alta (200px)', value: 'tall' }] },
      ],
      defaultBlocks: [],
    },
  ]

  const getByType = (type: string) => registry.find(s => s.type === type)

  const getByCategory = (category: string) => registry.filter(s => s.category === category)

  const categories = [
    { key: 'header', label: 'Encabezado', icon: 'i-lucide-panel-top' },
    { key: 'hero', label: 'Hero / Banner', icon: 'i-lucide-image' },
    { key: 'promo', label: 'Promoción', icon: 'i-lucide-badge-percent' },
    { key: 'products', label: 'Productos', icon: 'i-lucide-package' },
    { key: 'content', label: 'Contenido', icon: 'i-lucide-text' },
    { key: 'media', label: 'Media', icon: 'i-lucide-play-circle' },
    { key: 'social', label: 'Social / Confianza', icon: 'i-lucide-heart' },
    { key: 'footer', label: 'Pie de página', icon: 'i-lucide-panel-bottom' },
  ]

  const createSectionFromType = (type: string): ThemeSection | null => {
    const def = getByType(type)
    if (!def) return null
    return {
      id: `sec-${uid()}`,
      type: def.type,
      displayName: def.label,
      order: 0,
      hidden: false,
      settings: JSON.parse(JSON.stringify(def.defaultSettings)),
      blocks: JSON.parse(JSON.stringify(def.defaultBlocks)).map((b: any) => ({ ...b, id: `blk-${uid()}` })),
      maxBlocks: def.maxBlocks,
    }
  }

  return {
    registry,
    getByType,
    getByCategory,
    categories,
    createSectionFromType,
  }
}
