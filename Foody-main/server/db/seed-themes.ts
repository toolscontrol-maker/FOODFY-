/* ─────────────────────────────────────────────────────────
   Theme Seed Data — Inserts default themes with all
   templates, sections, blocks and their settings into SQLite.
   ───────────────────────────────────────────────────────── */
import { db, schema } from './index'
import { count } from 'drizzle-orm'

/* ── Helper: insert a full theme tree ── */
async function insertTheme(theme: {
  id: string; name: string; role: 'main' | 'unpublished'; version: string;
  schemaVersion: number; previewImage: string; lastSaved: string; lastPublished: string;
  globalSettings: any; templates: any[];
}) {
  await db.insert(schema.themes).values({
    id: theme.id, name: theme.name, role: theme.role, version: theme.version,
    schemaVersion: theme.schemaVersion, previewImage: theme.previewImage,
    lastSaved: theme.lastSaved, lastPublished: theme.lastPublished,
    globalSettings: theme.globalSettings,
  }).run()

  for (const tmpl of theme.templates) {
    await db.insert(schema.themeTemplates).values({
      id: tmpl.id, themeId: theme.id, name: tmpl.name, label: tmpl.label,
    }).run()

    for (const sec of tmpl.sections) {
      await db.insert(schema.themeSections).values({
        id: sec.id, templateId: tmpl.id, type: sec.type, displayName: sec.displayName,
        order: sec.order, hidden: sec.hidden, settings: sec.settings,
        maxBlocks: sec.maxBlocks ?? null,
      }).run()

      if (sec.blocks) {
        for (const blk of sec.blocks) {
          await db.insert(schema.themeBlocks).values({
            id: blk.id, sectionId: sec.id, type: blk.type, displayName: blk.displayName,
            order: blk.order, hidden: blk.hidden, settings: blk.settings,
            appId: blk.appId ?? null,
          }).run()
        }
      }
    }
  }
}

/* ── Component style token base ── */
const baseStyle = (overrides: Record<string, number> = {}) => ({
  borderWidth: 0, borderOpacity: 100, radius: 0,
  shadowOpacity: 0, shadowX: 0, shadowY: 4, shadowBlur: 5,
  ...overrides,
})

/* ── Default global settings (matches ThemeGlobalSettings interface) ── */
const defaultGlobalSettings = {
  identity: { logo: '', logoWidth: 50, favicon: '' },
  colors: {
    schemes: [
      { id: 'scheme-1', name: 'Esquema 1', background: '#ffffff', text: '#1a1a2e', primary: '#e63946', secondary: '#f4a261', buttons: '#e63946', borders: '#e5e7eb' },
      { id: 'scheme-2', name: 'Esquema 2', background: '#f8f9fa', text: '#212529', primary: '#0d6efd', secondary: '#6610f2', buttons: '#0d6efd', borders: '#dee2e6' },
      { id: 'scheme-3', name: 'Esquema 3', background: '#1a1a2e', text: '#edf2f4', primary: '#e63946', secondary: '#f4a261', buttons: '#e63946', borders: '#2d2d44' },
      { id: 'scheme-4', name: 'Esquema 4', background: '#fefae0', text: '#283618', primary: '#606c38', secondary: '#bc6c25', buttons: '#606c38', borders: '#d4d4aa' },
    ],
  },
  typography: { headingFont: 'Inter', headingScale: 100, bodyFont: 'Inter', bodyScale: 100 },
  layout: { pageWidth: 1200, sectionSpacing: 0, gridHorizontal: 16, gridVertical: 16 },
  motion: { revealOnScroll: true, hoverEffect: 'none' as const },
  components: {
    buttons: baseStyle({ borderWidth: 1, borderOpacity: 100, radius: 8 }),
    variantPills: baseStyle({ borderWidth: 1, borderOpacity: 55, radius: 4 }),
    inputs: baseStyle({ borderWidth: 1, borderOpacity: 55, radius: 26 }),
    productCards: { ...baseStyle({ borderWidth: 0, borderOpacity: 100, radius: 4 }), style: 'standard' as const, imagePadding: 0, textAlign: 'left' as const, colorScheme: 'scheme-1' },
    containers: baseStyle({ radius: 20, borderOpacity: 10 }),
    media: baseStyle({ radius: 20, borderOpacity: 10 }),
  },
  cart: { type: 'drawer' as const, showVendor: false, enableNote: false, drawerCollection: '', drawerColorScheme: 'scheme-1' },
}

/* ── S = setting shorthand ── */
const S = (key: string, type: string, label: string, value: any, def: any, extra: any = {}) =>
  ({ key, type, label, value, default: def, ...extra })

export async function seedThemes() {
  const [row] = await db.select({ c: count() }).from(schema.themes).all()
  if (row && row.c > 0) return

  const now = new Date().toISOString()

  /* ══════════════════════════════════════════════
     THEME 1: Flavor (main)
     ══════════════════════════════════════════════ */
  await insertTheme({
    id: 'theme-dawn', name: 'Flavor', role: 'main', version: '12.0.0',
    schemaVersion: 1, previewImage: '',
    lastSaved: new Date(Date.now() - 3600000).toISOString(),
    lastPublished: new Date(Date.now() - 7200000).toISOString(),
    globalSettings: defaultGlobalSettings,
    templates: [
      /* ── Home template ── */
      {
        id: 'tmpl-home', name: 'index', label: 'Inicio',
        sections: [
          {
            id: 'sec-header', type: 'header', displayName: 'Encabezado', order: 0, hidden: false,
            settings: [
              S('logo_url', 'image', 'Logo', '', ''),
              S('sticky', 'checkbox', 'Encabezado fijo', true, true),
              S('bg_color', 'color', 'Color de fondo', '#ffffff', '#ffffff'),
            ],
            blocks: [
              { id: 'blk-nav-1', type: 'nav_link', displayName: 'Enlace: Inicio', order: 0, hidden: false, settings: [S('text','text','Texto','Inicio','Inicio'), S('url','text','URL','/','/')] },
              { id: 'blk-nav-2', type: 'nav_link', displayName: 'Enlace: Carta', order: 1, hidden: false, settings: [S('text','text','Texto','Carta','Carta'), S('url','text','URL','/menu','/menu')] },
            ],
          },
          {
            id: 'sec-hero', type: 'hero_banner', displayName: 'Banner principal', order: 1, hidden: false,
            settings: [
              S('heading','text','Título','¡Bienvenidos!','¡Bienvenidos!'),
              S('subheading','text','Subtítulo','Los mejores platos a tu puerta',''),
              S('bg_image','image','Imagen de fondo','',''),
              S('bg_color','color','Color de fondo','#1a1a2e','#1a1a2e'),
              S('text_color','color','Color de texto','#ffffff','#ffffff'),
              S('height','range','Altura (px)',500,500,{min:200,max:800}),
              S('cta_text','text','Texto del botón','Ver menú','Ver menú'),
              S('cta_url','text','URL del botón','/menu','/menu'),
            ],
            blocks: [],
          },
          {
            id: 'sec-featured', type: 'featured_collection', displayName: 'Colección destacada', order: 2, hidden: false,
            settings: [
              S('collectionId','collection-picker','Colección','col-bestsellers',''),
              S('title','text','Título','Platos populares','Destacados'),
              S('columns','select','Columnas','4','4',{options:[{label:'2',value:'2'},{label:'3',value:'3'},{label:'4',value:'4'}]}),
              S('show_price','checkbox','Mostrar precio',true,true),
            ],
            maxBlocks: 12,
            blocks: [
              { id: 'blk-prod-1', type: 'product_card', displayName: 'Producto: Hamburguesa', order: 0, hidden: false, settings: [S('product_name','text','Nombre','Hamburguesa clásica',''), S('price','text','Precio','9.50€','')] },
              { id: 'blk-prod-2', type: 'product_card', displayName: 'Producto: Pizza', order: 1, hidden: false, settings: [S('product_name','text','Nombre','Pizza Margarita',''), S('price','text','Precio','11.00€','')] },
            ],
          },
          {
            id: 'sec-trust', type: 'trust_icons', displayName: 'Iconos de confianza', order: 3, hidden: false,
            settings: [
              S('title','text','Título','',''),
              S('columns','select','Columnas','4','4',{options:[{label:'2',value:'2'},{label:'3',value:'3'},{label:'4',value:'4'}]}),
              S('bg_color','color','Fondo','#ffffff','#ffffff'),
              S('icon_color','color','Color iconos','#059669','#059669'),
            ],
            maxBlocks: 8,
            blocks: [
              { id: 'blk-tr-1', type: 'trust_item', displayName: 'Envío express', order: 0, hidden: false, settings: [S('icon','select','Icono','truck','truck',{options:[{label:'Camión',value:'truck'},{label:'Escudo',value:'shield'},{label:'Reloj',value:'clock'},{label:'Estrella',value:'star'},{label:'Hoja',value:'leaf'},{label:'Check',value:'check'}]}), S('title','text','Título','Envío express',''), S('description','text','Descripción','En menos de 30 min','')] },
              { id: 'blk-tr-2', type: 'trust_item', displayName: 'Ingredientes frescos', order: 1, hidden: false, settings: [S('icon','select','Icono','leaf','leaf',{options:[{label:'Camión',value:'truck'},{label:'Escudo',value:'shield'},{label:'Reloj',value:'clock'},{label:'Estrella',value:'star'},{label:'Hoja',value:'leaf'},{label:'Check',value:'check'}]}), S('title','text','Título','100% frescos',''), S('description','text','Descripción','Ingredientes de temporada','')] },
              { id: 'blk-tr-3', type: 'trust_item', displayName: 'Pago seguro', order: 2, hidden: false, settings: [S('icon','select','Icono','shield','shield',{options:[{label:'Camión',value:'truck'},{label:'Escudo',value:'shield'},{label:'Reloj',value:'clock'},{label:'Estrella',value:'star'},{label:'Hoja',value:'leaf'},{label:'Check',value:'check'}]}), S('title','text','Título','Pago seguro',''), S('description','text','Descripción','SSL y pasarela segura','')] },
              { id: 'blk-tr-4', type: 'trust_item', displayName: 'Satisfacción', order: 3, hidden: false, settings: [S('icon','select','Icono','star','star',{options:[{label:'Camión',value:'truck'},{label:'Escudo',value:'shield'},{label:'Reloj',value:'clock'},{label:'Estrella',value:'star'},{label:'Hoja',value:'leaf'},{label:'Check',value:'check'}]}), S('title','text','Título','4.9★ valoración',''), S('description','text','Descripción','+2.000 clientes satisfechos','')] },
            ],
          },
          {
            id: 'sec-text', type: 'image_with_text', displayName: 'Imagen con texto', order: 4, hidden: false,
            settings: [
              S('heading','text','Título','Nuestra historia',''),
              S('content','textarea','Contenido','Somos un restaurante familiar con más de 10 años de experiencia. Creemos en la cocina honesta, ingredientes de proximidad y sabores que cuentan historias.',''),
              S('image_position','select','Posición imagen','left','left',{options:[{label:'Izquierda',value:'left'},{label:'Derecha',value:'right'}]}),
              S('cta_text','text','Texto botón','Conoce más',''),
              S('cta_url','text','URL botón','/nosotros',''),
              S('bg_color','color','Color de fondo','#ffffff','#ffffff'),
            ],
            blocks: [],
          },
          {
            id: 'sec-testimonials', type: 'testimonials', displayName: 'Opiniones', order: 5, hidden: false,
            settings: [
              S('title','text','Título','Lo que dicen nuestros clientes',''),
              S('columns','select','Columnas','3','3',{options:[{label:'2',value:'2'},{label:'3',value:'3'}]}),
              S('show_stars','checkbox','Mostrar estrellas',true,true),
              S('bg_color','color','Color de fondo','#f9fafb','#f9fafb'),
            ],
            maxBlocks: 8,
            blocks: [
              { id: 'blk-test-1', type: 'testimonial', displayName: 'Opinión 1', order: 0, hidden: false, settings: [S('text','textarea','Texto','Increíble experiencia. La comida llegó caliente y en perfecto estado. ¡Repetiré!',''), S('author','text','Autor','Ana P.',''), S('rating','number','Estrellas',5,5)] },
              { id: 'blk-test-2', type: 'testimonial', displayName: 'Opinión 2', order: 1, hidden: false, settings: [S('text','textarea','Texto','El mejor restaurante de la zona. Calidad-precio insuperable.',''), S('author','text','Autor','Diego M.',''), S('rating','number','Estrellas',5,5)] },
              { id: 'blk-test-3', type: 'testimonial', displayName: 'Opinión 3', order: 2, hidden: false, settings: [S('text','textarea','Texto','Pedimos para toda la familia y nos encantó. El menú infantil es genial.',''), S('author','text','Autor','Sara L.',''), S('rating','number','Estrellas',4,5)] },
            ],
          },
          {
            id: 'sec-newsletter', type: 'newsletter', displayName: 'Newsletter', order: 6, hidden: false,
            settings: [
              S('heading','text','Título','No te pierdas nada',''),
              S('subheading','text','Subtítulo','Suscríbete para recibir ofertas exclusivas y novedades',''),
              S('placeholder','text','Placeholder','Tu email','Tu email'),
              S('button_text','text','Texto botón','Suscribirme','Suscribirme'),
              S('bg_color','color','Color de fondo','#f3f4f6','#f3f4f6'),
              S('text_color','color','Color texto','#111827','#111827'),
            ],
            blocks: [],
          },
          {
            id: 'sec-footer', type: 'footer', displayName: 'Pie de página', order: 7, hidden: false,
            settings: [
              S('show_social','checkbox','Mostrar redes sociales',true,true),
              S('copyright','text','Copyright','',''),
              S('bg_color','color','Color de fondo','#111827','#111827'),
              S('text_color','color','Color texto','#d1d5db','#d1d5db'),
              S('columns_count','select','Columnas','3','3',{options:[{label:'2',value:'2'},{label:'3',value:'3'},{label:'4',value:'4'}]}),
            ],
            blocks: [
              { id: 'blk-foot-1', type: 'footer_column', displayName: 'Contacto', order: 0, hidden: false, settings: [S('heading','text','Encabezado','Contacto',''), S('content','textarea','Contenido','','')] },
              { id: 'blk-foot-2', type: 'footer_column', displayName: 'Horarios', order: 1, hidden: false, settings: [S('heading','text','Encabezado','Horarios',''), S('content','textarea','Contenido','Lun-Vie: 12:00 - 23:00\nSáb-Dom: 12:00 - 00:00','')] },
              { id: 'blk-foot-3', type: 'footer_column', displayName: 'Legal', order: 2, hidden: false, settings: [S('heading','text','Encabezado','Legal',''), S('content','textarea','Contenido','Aviso legal\nPolítica de privacidad\nCondiciones de uso','')] },
            ],
          },
        ],
      },
      /* ── Product template ── */
      {
        id: 'tmpl-product', name: 'product', label: 'Producto',
        sections: [
          {
            id: 'sec-prod-header', type: 'header', displayName: 'Encabezado', order: 0, hidden: false,
            settings: [S('logo_url','image','Logo','',''), S('sticky','checkbox','Encabezado fijo',true,true), S('bg_color','color','Color de fondo','#ffffff','#ffffff')],
            blocks: [
              { id: 'blk-pnav-1', type: 'nav_link', displayName: 'Enlace: Inicio', order: 0, hidden: false, settings: [S('text','text','Texto','Inicio','Inicio'), S('url','text','URL','/','/')] },
              { id: 'blk-pnav-2', type: 'nav_link', displayName: 'Enlace: Carta', order: 1, hidden: false, settings: [S('text','text','Texto','Carta','Carta'), S('url','text','URL','/menu','/menu')] },
              { id: 'blk-pnav-3', type: 'nav_link', displayName: 'Enlace: Contacto', order: 2, hidden: false, settings: [S('text','text','Texto','Contacto','Contacto'), S('url','text','URL','/contacto','/contacto')] },
            ],
          },
          {
            id: 'sec-prod-marquee', type: 'marquee', displayName: 'Barra de anuncios', order: 1, hidden: false,
            settings: [S('text','text','Texto','🔥 Envío gratis a partir de 25€ — Pide ahora',''), S('bg_color','color','Fondo','#111827','#111827'), S('text_color','color','Color texto','#ffffff','#ffffff'), S('speed','range','Velocidad',40,40,{min:10,max:100})],
            blocks: [],
          },
          {
            id: 'sec-prod-main', type: 'product_detail', displayName: 'Detalle de producto', order: 2, hidden: false,
            settings: [
              S('productId','product-picker','Producto','prod-001',''),
              S('show_gallery','checkbox','Mostrar galería',true,true), S('show_reviews','checkbox','Mostrar reseñas',true,true),
              S('show_variants','checkbox','Mostrar variantes',true,true), S('show_quantity','checkbox','Selector de cantidad',true,true),
              S('show_share','checkbox','Botones compartir',true,true), S('bg_color','color','Color de fondo','#ffffff','#ffffff'),
              S('image_ratio','select','Ratio de imagen','square','square',{options:[{label:'Cuadrado',value:'square'},{label:'4:3',value:'4-3'},{label:'16:9',value:'16-9'}]}),
              S('layout','select','Disposición','side-by-side','side-by-side',{options:[{label:'Lado a lado',value:'side-by-side'},{label:'Galería arriba',value:'stacked'}]}),
            ],
            maxBlocks: 12,
            blocks: [
              { id: 'blk-prod-info', type: 'product_info', displayName: 'Info del producto', order: 0, hidden: false, settings: [S('show_vendor','checkbox','Mostrar marca',true,true), S('show_sku','checkbox','Mostrar SKU',false,false)] },
              { id: 'blk-prod-price', type: 'product_price', displayName: 'Precio', order: 1, hidden: false, settings: [S('show_compare','checkbox','Mostrar precio anterior',true,true), S('show_tax_info','checkbox','Info de impuestos',true,true)] },
              { id: 'blk-prod-variants', type: 'product_variants', displayName: 'Selector de variantes', order: 2, hidden: false, settings: [S('style','select','Estilo','buttons','buttons',{options:[{label:'Botones',value:'buttons'},{label:'Dropdown',value:'dropdown'}]})] },
              { id: 'blk-prod-qty', type: 'product_quantity', displayName: 'Cantidad', order: 3, hidden: false, settings: [S('min','number','Mínimo',1,1), S('max','number','Máximo',10,10)] },
              { id: 'blk-prod-cart-btn', type: 'product_buy_button', displayName: 'Botón de compra', order: 4, hidden: false, settings: [S('text','text','Texto','Añadir al carrito','Añadir al carrito'), S('show_dynamic_checkout','checkbox','Pago rápido',true,true)] },
              { id: 'blk-prod-desc', type: 'product_description', displayName: 'Descripción', order: 5, hidden: false, settings: [S('collapsible','checkbox','Contenido plegable',false,false)] },
              { id: 'blk-prod-badges', type: 'product_badges', displayName: 'Badges de confianza', order: 6, hidden: false, settings: [S('badges','text','Badges (separados por coma)','Envío gratis,Sin gluten,Hecho en España','')] },
            ],
          },
          {
            id: 'sec-prod-trust', type: 'trust_icons', displayName: 'Iconos de confianza', order: 3, hidden: false,
            settings: [
              S('title','text','Título','¿Por qué elegirnos?',''),
              S('columns','select','Columnas','4','4',{options:[{label:'2',value:'2'},{label:'3',value:'3'},{label:'4',value:'4'}]}),
              S('bg_color','color','Fondo','#f9fafb','#f9fafb'),
              S('icon_color','color','Color iconos','#059669','#059669'),
            ],
            maxBlocks: 8,
            blocks: [
              { id: 'blk-pt-1', type: 'trust_item', displayName: 'Envío rápido', order: 0, hidden: false, settings: [S('icon','select','Icono','truck','truck',{options:[{label:'Camión',value:'truck'},{label:'Escudo',value:'shield'},{label:'Reloj',value:'clock'},{label:'Estrella',value:'star'},{label:'Hoja',value:'leaf'},{label:'Check',value:'check'}]}), S('title','text','Título','Envío 30 min',''), S('description','text','Descripción','Recibe tu pedido en menos de 30 minutos','')] },
              { id: 'blk-pt-2', type: 'trust_item', displayName: 'Ingredientes frescos', order: 1, hidden: false, settings: [S('icon','select','Icono','leaf','leaf',{options:[{label:'Camión',value:'truck'},{label:'Escudo',value:'shield'},{label:'Reloj',value:'clock'},{label:'Estrella',value:'star'},{label:'Hoja',value:'leaf'},{label:'Check',value:'check'}]}), S('title','text','Título','Ingredientes frescos',''), S('description','text','Descripción','Productos de proximidad y de temporada','')] },
              { id: 'blk-pt-3', type: 'trust_item', displayName: 'Pago seguro', order: 2, hidden: false, settings: [S('icon','select','Icono','shield','shield',{options:[{label:'Camión',value:'truck'},{label:'Escudo',value:'shield'},{label:'Reloj',value:'clock'},{label:'Estrella',value:'star'},{label:'Hoja',value:'leaf'},{label:'Check',value:'check'}]}), S('title','text','Título','Pago 100% seguro',''), S('description','text','Descripción','Tus datos siempre protegidos','')] },
              { id: 'blk-pt-4', type: 'trust_item', displayName: 'Satisfacción', order: 3, hidden: false, settings: [S('icon','select','Icono','star','star',{options:[{label:'Camión',value:'truck'},{label:'Escudo',value:'shield'},{label:'Reloj',value:'clock'},{label:'Estrella',value:'star'},{label:'Hoja',value:'leaf'},{label:'Check',value:'check'}]}), S('title','text','Título','4.9★ satisfacción',''), S('description','text','Descripción','Miles de clientes satisfechos','')] },
            ],
          },
          {
            id: 'sec-prod-related', type: 'related_products', displayName: 'Productos relacionados', order: 4, hidden: false,
            settings: [S('collectionId','collection-picker','Colección fuente','col-bestsellers',''), S('title','text','Título','También te puede gustar','Productos relacionados'), S('max_products','number','Máx. productos',4,4), S('columns','select','Columnas','4','4',{options:[{label:'2',value:'2'},{label:'3',value:'3'},{label:'4',value:'4'}]})],
            blocks: [],
          },
          {
            id: 'sec-prod-testimonials', type: 'testimonials', displayName: 'Opiniones de clientes', order: 5, hidden: false,
            settings: [S('title','text','Título','Lo que opinan nuestros clientes',''), S('columns','select','Columnas','3','3',{options:[{label:'2',value:'2'},{label:'3',value:'3'}]}), S('show_stars','checkbox','Mostrar estrellas',true,true), S('bg_color','color','Color de fondo','#ffffff','#ffffff')],
            maxBlocks: 8,
            blocks: [
              { id: 'blk-ptest-1', type: 'testimonial', displayName: 'Opinión 1', order: 0, hidden: false, settings: [S('text','textarea','Texto','La mejor hamburguesa que he probado. Ingredientes frescos y la salsa es espectacular.',''), S('author','text','Autor','María G.',''), S('rating','number','Estrellas',5,5)] },
              { id: 'blk-ptest-2', type: 'testimonial', displayName: 'Opinión 2', order: 1, hidden: false, settings: [S('text','textarea','Texto','Pedido a domicilio en 25 minutos. Todo perfecto y caliente. Repetiré seguro.',''), S('author','text','Autor','Carlos R.',''), S('rating','number','Estrellas',5,5)] },
              { id: 'blk-ptest-3', type: 'testimonial', displayName: 'Opinión 3', order: 2, hidden: false, settings: [S('text','textarea','Texto','Gran variedad y excelente relación calidad-precio. El menú infantil genial.',''), S('author','text','Autor','Laura M.',''), S('rating','number','Estrellas',4,5)] },
            ],
          },
          {
            id: 'sec-prod-newsletter', type: 'newsletter', displayName: 'Newsletter', order: 6, hidden: false,
            settings: [S('heading','text','Título','¿Te ha gustado? No te pierdas nada','Newsletter'), S('subheading','text','Subtítulo','Suscríbete y recibe ofertas exclusivas y novedades del menú',''), S('placeholder','text','Placeholder','Tu correo electrónico','Tu email'), S('button_text','text','Texto botón','Suscribirme','Suscribirme'), S('bg_color','color','Color de fondo','#f3f4f6','#f3f4f6'), S('text_color','color','Color texto','#111827','#111827')],
            blocks: [],
          },
          {
            id: 'sec-prod-footer', type: 'footer', displayName: 'Pie de página', order: 7, hidden: false,
            settings: [S('show_social','checkbox','Mostrar redes sociales',true,true), S('copyright','text','Copyright','',''), S('bg_color','color','Color de fondo','#111827','#111827'), S('text_color','color','Color texto','#d1d5db','#d1d5db'), S('columns_count','select','Columnas','3','3',{options:[{label:'2',value:'2'},{label:'3',value:'3'},{label:'4',value:'4'}]})],
            blocks: [
              { id: 'blk-pf-1', type: 'footer_column', displayName: 'Contacto', order: 0, hidden: false, settings: [S('heading','text','Encabezado','Contacto',''), S('content','textarea','Contenido','','')] },
              { id: 'blk-pf-2', type: 'footer_column', displayName: 'Horarios', order: 1, hidden: false, settings: [S('heading','text','Encabezado','Horarios',''), S('content','textarea','Contenido','Lun-Vie: 12:00 - 23:00\nSáb-Dom: 12:00 - 00:00','')] },
              { id: 'blk-pf-3', type: 'footer_column', displayName: 'Legal', order: 2, hidden: false, settings: [S('heading','text','Encabezado','Legal',''), S('content','textarea','Contenido','Aviso legal\nPolítica de privacidad\nCookies','')] },
            ],
          },
        ],
      },
      /* ── Collection template ── */
      {
        id: 'tmpl-collection', name: 'collection', label: 'Colección',
        sections: [{
          id: 'sec-coll-grid', type: 'collection_grid', displayName: 'Cuadrícula de colecciones', order: 0, hidden: false,
          settings: [S('title','text','Título','Nuestras categorías',''), S('columns','select','Columnas','3','3',{options:[{label:'2',value:'2'},{label:'3',value:'3'},{label:'4',value:'4'}]}), S('show_filters','checkbox','Mostrar filtros',true,true)],
          blocks: [
            { id: 'blk-col-1', type: 'collection_card', displayName: 'Colección: Más vendidos', order: 0, hidden: false, settings: [S('collectionId','collection-picker','Colección','col-bestsellers',''), S('title','text','Nombre','Los Más Vendidos',''), S('image','image','Imagen','','')] },
            { id: 'blk-col-2', type: 'collection_card', displayName: 'Colección: Hamburguesas', order: 1, hidden: false, settings: [S('collectionId','collection-picker','Colección','col-burgers',''), S('title','text','Nombre','Hamburguesas',''), S('image','image','Imagen','','')] },
            { id: 'blk-col-3', type: 'collection_card', displayName: 'Colección: Entrantes', order: 2, hidden: false, settings: [S('collectionId','collection-picker','Colección','col-starters',''), S('title','text','Nombre','Entrantes',''), S('image','image','Imagen','','')] },
          ],
        }],
      },
      /* ── Page template ── */
      {
        id: 'tmpl-page', name: 'page', label: 'Página',
        sections: [{
          id: 'sec-page-content', type: 'page_content', displayName: 'Contenido de página', order: 0, hidden: false,
          settings: [S('show_title','checkbox','Mostrar título',true,true), S('max_width','select','Ancho máximo','md','md',{options:[{label:'Estrecho',value:'sm'},{label:'Mediano',value:'md'},{label:'Ancho',value:'lg'}]})],
          blocks: [],
        }],
      },
    ],
  })

  /* ══════════════════════════════════════════════
     THEME 2: Starter (unpublished)
     ══════════════════════════════════════════════ */
  const starterSettings = {
    ...defaultGlobalSettings,
    typography: { headingFont: 'Poppins', headingScale: 100, bodyFont: 'Open Sans', bodyScale: 100 },
    colors: {
      schemes: [
        { id: 'scheme-1', name: 'Esquema 1', background: '#fafafa', text: '#18181b', primary: '#6366f1', secondary: '#8b5cf6', buttons: '#6366f1', borders: '#e4e4e7' },
        { id: 'scheme-2', name: 'Esquema 2', background: '#ffffff', text: '#1f2937', primary: '#2563eb', secondary: '#3b82f6', buttons: '#2563eb', borders: '#d1d5db' },
        { id: 'scheme-3', name: 'Esquema 3', background: '#18181b', text: '#fafafa', primary: '#f59e0b', secondary: '#fbbf24', buttons: '#f59e0b', borders: '#3f3f46' },
        { id: 'scheme-4', name: 'Esquema 4', background: '#f5f3ff', text: '#4c1d95', primary: '#7c3aed', secondary: '#8b5cf6', buttons: '#7c3aed', borders: '#ddd6fe' },
      ],
    },
    layout: { pageWidth: 1140, sectionSpacing: 0, gridHorizontal: 24, gridVertical: 24 },
  }

  // Starter only has a basic home template (reusing the same structure with different IDs)
  await insertTheme({
    id: 'theme-refresh', name: 'Starter', role: 'unpublished', version: '3.0.0',
    schemaVersion: 1, previewImage: '',
    lastSaved: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastPublished: '',
    globalSettings: starterSettings,
    templates: [{
      id: 'tmpl-starter-home', name: 'index', label: 'Inicio',
      sections: [{
        id: 'sec-starter-hero', type: 'hero_banner', displayName: 'Banner principal', order: 0, hidden: false,
        settings: [S('heading','text','Título','Starter Theme',''), S('subheading','text','Subtítulo','A clean start',''), S('bg_color','color','Color de fondo','#6366f1','#6366f1'), S('text_color','color','Color de texto','#ffffff','#ffffff'), S('height','range','Altura (px)',400,400,{min:200,max:800})],
        blocks: [],
      }],
    }],
  })

  console.log('[DB] Theme seed complete.')
}
