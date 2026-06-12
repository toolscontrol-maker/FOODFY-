/* ─────────────────────────────────────────────────────────
   Server Storage — JSON-file persistence via unstorage.
   Provides CRUD helpers and seeds initial data on first run.
   ───────────────────────────────────────────────────────── */
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { resolve } from 'path'
import type {
  Product, ProductVariant, ProductImage, ModifierGroup, ModifierOption,
  Collection, InventoryLevel, AnalyticsEvent, Category,
} from '~/types/commerce'

/* ── Storage instance (JSON files in server/data/) ── */
const dataDir = resolve(process.cwd(), 'server/data')

const storage = createStorage({
  driver: fsDriver({ base: dataDir }),
})

/* ── Generic helpers ── */
export async function getCollection<T>(key: string): Promise<T[]> {
  const raw = await storage.getItem(key)
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as T[] } catch { return [] }
  }
  return []
}

export async function setCollection<T>(key: string, data: T[]): Promise<void> {
  await storage.setItem(key, JSON.stringify(data))
}

export async function getById<T extends { id: string }>(key: string, id: string): Promise<T | null> {
  const items = await getCollection<T>(key)
  return items.find(i => i.id === id) ?? null
}

export async function upsert<T extends { id: string }>(key: string, item: T): Promise<T> {
  const items = await getCollection<T>(key)
  const idx = items.findIndex(i => i.id === item.id)
  if (idx >= 0) items[idx] = item
  else items.push(item)
  await setCollection(key, items)
  return item
}

export async function removeById<T extends { id: string }>(key: string, id: string): Promise<boolean> {
  const items = await getCollection<T>(key)
  const idx = items.findIndex(i => i.id === id)
  if (idx < 0) return false
  items.splice(idx, 1)
  await setCollection(key, items)
  return true
}

/* ── Seed guard ── */
export async function ensureSeeded(): Promise<void> {
  const existing = await storage.getItem('products.json')
  if (existing) return
  await seedAll()
}

/* ── Seed all data ── */
async function seedAll(): Promise<void> {
  const now = new Date().toISOString()

  const categories: Category[] = [
    { id: 'cat-burgers', name: 'Hamburguesas', slug: 'hamburguesas', position: 0 },
    { id: 'cat-pizzas', name: 'Pizzas', slug: 'pizzas', position: 1 },
    { id: 'cat-starters', name: 'Entrantes', slug: 'entrantes', position: 2 },
    { id: 'cat-salads', name: 'Ensaladas', slug: 'ensaladas', position: 3 },
    { id: 'cat-drinks', name: 'Bebidas', slug: 'bebidas', position: 4 },
    { id: 'cat-desserts', name: 'Postres', slug: 'postres', position: 5 },
  ]

  /* ── Helper factories ── */
  const mkVariant = (
    id: string, productId: string, name: string, price: number,
    compareAt: number | null, sku: string, stock: number, pos: number,
    options: { name: string; value: string }[] = [],
    image = '',
  ): ProductVariant => ({
    id, productId, name, price, compareAtPrice: compareAt, sku, barcode: '',
    inventoryQuantity: stock, availableForSale: stock > 0, image,
    options, weight: 0, weightUnit: 'g', position: pos,
  })

  const mkImage = (id: string, url: string, alt: string, pos: number): ProductImage => ({
    id, url, alt, position: pos,
  })

  const mkModOption = (id: string, label: string, price = 0): ModifierOption => ({ id, label, price })

  const mkModGroup = (
    id: string, name: string, type: 'single' | 'multiple',
    required: boolean, maxSelect: number, options: ModifierOption[],
  ): ModifierGroup => ({ id, name, type, required, maxSelect, options })

  /* ── Products ── */
  const products: Product[] = [
    {
      id: 'prod-001',
      handle: 'hamburguesa-clasica',
      name: 'Hamburguesa Clásica',
      description: 'Carne 100% vacuno, lechuga, tomate, cebolla roja y salsa especial en pan brioche.',
      categoryId: 'cat-burgers',
      categoryName: 'Hamburguesas',
      vendor: 'Foodfy Kitchen',
      type: 'Plato principal',
      tags: ['popular', 'carne', 'hamburguesa'],
      status: 'active',
      publishedAt: now,
      images: [
        mkImage('img-001a', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', 'Hamburguesa Clásica', 0),
        mkImage('img-001b', 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop', 'Hamburguesa Clásica lateral', 1),
      ],
      variants: [
        mkVariant('var-001a', 'prod-001', 'Normal', 9.50, 12.00, 'BUR-CLA-N', 45, 0, [{ name: 'Tamaño', value: 'Normal' }]),
        mkVariant('var-001b', 'prod-001', 'Doble', 13.50, 16.00, 'BUR-CLA-D', 30, 1, [{ name: 'Tamaño', value: 'Doble' }]),
        mkVariant('var-001c', 'prod-001', 'Triple', 16.50, null, 'BUR-CLA-T', 15, 2, [{ name: 'Tamaño', value: 'Triple' }]),
      ],
      modifiers: [
        mkModGroup('mod-001a', 'Punto de la carne', 'single', true, 1, [
          mkModOption('mo-001a1', 'Poco hecha'), mkModOption('mo-001a2', 'Al punto'), mkModOption('mo-001a3', 'Muy hecha'),
        ]),
        mkModGroup('mod-001b', 'Extras', 'multiple', false, 3, [
          mkModOption('mo-001b1', 'Extra queso cheddar', 1.50),
          mkModOption('mo-001b2', 'Bacon ahumado', 2.00),
          mkModOption('mo-001b3', 'Huevo frito', 1.20),
        ]),
      ],
      templateSuffix: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-002',
      handle: 'doble-smash-bacon',
      name: 'Doble Smash Bacon',
      description: 'Doble smash patty, cuádruple cheddar, bacon crujiente y salsa BBQ.',
      categoryId: 'cat-burgers',
      categoryName: 'Hamburguesas',
      vendor: 'Foodfy Kitchen',
      type: 'Plato principal',
      tags: ['popular', 'carne', 'hamburguesa', 'bacon'],
      status: 'active',
      publishedAt: now,
      images: [
        mkImage('img-002a', 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=600&auto=format&fit=crop', 'Doble Smash Bacon', 0),
      ],
      variants: [
        mkVariant('var-002a', 'prod-002', 'Normal', 15.00, null, 'BUR-SMB-N', 25, 0, [{ name: 'Tamaño', value: 'Normal' }]),
      ],
      modifiers: [
        mkModGroup('mod-002a', 'Extras', 'multiple', false, 3, [
          mkModOption('mo-002a1', 'Extra bacon', 2.50), mkModOption('mo-002a2', 'Jalapeños', 1.00),
        ]),
      ],
      templateSuffix: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-003',
      handle: 'pizza-margherita',
      name: 'Pizza Margherita',
      description: 'Masa artesanal, tomate San Marzano, mozzarella fresca y albahaca.',
      categoryId: 'cat-pizzas',
      categoryName: 'Pizzas',
      vendor: 'Foodfy Kitchen',
      type: 'Plato principal',
      tags: ['pizza', 'vegetariano', 'italiano'],
      status: 'active',
      publishedAt: now,
      images: [
        mkImage('img-003a', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop', 'Pizza Margherita', 0),
      ],
      variants: [
        mkVariant('var-003a', 'prod-003', 'Mediana', 11.90, null, 'PIZ-MAR-M', 40, 0, [{ name: 'Tamaño', value: 'Mediana' }]),
        mkVariant('var-003b', 'prod-003', 'Familiar', 16.90, 19.00, 'PIZ-MAR-F', 20, 1, [{ name: 'Tamaño', value: 'Familiar' }]),
      ],
      modifiers: [
        mkModGroup('mod-003a', 'Extras', 'multiple', false, 4, [
          mkModOption('mo-003a1', 'Extra mozzarella', 2.00),
          mkModOption('mo-003a2', 'Rúcula', 1.50),
          mkModOption('mo-003a3', 'Jamón serrano', 3.00),
        ]),
      ],
      templateSuffix: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-004',
      handle: 'ensalada-cesar',
      name: 'Ensalada César',
      description: 'Lechuga romana, pollo a la plancha, croutons, parmesano y salsa César casera.',
      categoryId: 'cat-salads',
      categoryName: 'Ensaladas',
      vendor: 'Foodfy Fresh',
      type: 'Ensalada',
      tags: ['ensalada', 'pollo', 'saludable'],
      status: 'active',
      publishedAt: now,
      images: [
        mkImage('img-004a', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=600&auto=format&fit=crop', 'Ensalada César', 0),
      ],
      variants: [
        mkVariant('var-004a', 'prod-004', 'Normal', 8.75, 10.50, 'ENS-CES-N', 35, 0, [{ name: 'Tamaño', value: 'Normal' }]),
        mkVariant('var-004b', 'prod-004', 'Grande', 11.50, null, 'ENS-CES-G', 20, 1, [{ name: 'Tamaño', value: 'Grande' }]),
      ],
      modifiers: [],
      templateSuffix: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-005',
      handle: 'nachos-guacamole',
      name: 'Nachos con Guacamole',
      description: 'Nachos crujientes con guacamole fresco, pico de gallo, crema agria y jalapeños.',
      categoryId: 'cat-starters',
      categoryName: 'Entrantes',
      vendor: 'Foodfy Snacks',
      type: 'Entrante',
      tags: ['entrante', 'compartir', 'mexicano'],
      status: 'active',
      publishedAt: now,
      images: [
        mkImage('img-005a', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=600&auto=format&fit=crop', 'Nachos con Guacamole', 0),
      ],
      variants: [
        mkVariant('var-005a', 'prod-005', 'Normal', 6.50, 8.00, 'NAC-GUA-N', 50, 0, [{ name: 'Tamaño', value: 'Normal' }]),
        mkVariant('var-005b', 'prod-005', 'Para compartir', 10.50, null, 'NAC-GUA-C', 30, 1, [{ name: 'Tamaño', value: 'Para compartir' }]),
      ],
      modifiers: [],
      templateSuffix: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-006',
      handle: 'smoothie-tropical',
      name: 'Smoothie Tropical',
      description: 'Mango, piña, plátano y leche de coco. Refrescante y natural.',
      categoryId: 'cat-drinks',
      categoryName: 'Bebidas',
      vendor: 'Foodfy Drinks',
      type: 'Bebida',
      tags: ['bebida', 'smoothie', 'tropical', 'vegano'],
      status: 'active',
      publishedAt: now,
      images: [
        mkImage('img-006a', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=600&auto=format&fit=crop', 'Smoothie Tropical', 0),
      ],
      variants: [
        mkVariant('var-006a', 'prod-006', '350ml', 4.90, null, 'SMO-TRO-S', 60, 0, [{ name: 'Tamaño', value: '350ml' }]),
        mkVariant('var-006b', 'prod-006', '500ml', 6.50, null, 'SMO-TRO-L', 40, 1, [{ name: 'Tamaño', value: '500ml' }]),
      ],
      modifiers: [],
      templateSuffix: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-007',
      handle: 'wrap-pollo-bbq',
      name: 'Wrap de Pollo BBQ',
      description: 'Tortilla de trigo, pollo marinado BBQ, lechuga, maíz y salsa ranch.',
      categoryId: 'cat-burgers',
      categoryName: 'Hamburguesas',
      vendor: 'Foodfy Kitchen',
      type: 'Plato principal',
      tags: ['wrap', 'pollo', 'bbq'],
      status: 'active',
      publishedAt: now,
      images: [
        mkImage('img-007a', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=600&auto=format&fit=crop', 'Wrap de Pollo BBQ', 0),
      ],
      variants: [
        mkVariant('var-007a', 'prod-007', 'Normal', 7.20, null, 'WRP-POL-N', 35, 0, [{ name: 'Tamaño', value: 'Normal' }]),
      ],
      modifiers: [],
      templateSuffix: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-008',
      handle: 'tarta-chocolate',
      name: 'Tarta de Chocolate',
      description: 'Bizcocho esponjoso de cacao con ganache de chocolate belga y frutos rojos.',
      categoryId: 'cat-desserts',
      categoryName: 'Postres',
      vendor: 'Foodfy Pastry',
      type: 'Postre',
      tags: ['postre', 'chocolate', 'dulce'],
      status: 'active',
      publishedAt: now,
      images: [
        mkImage('img-008a', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop', 'Tarta de Chocolate', 0),
      ],
      variants: [
        mkVariant('var-008a', 'prod-008', 'Ración', 5.50, null, 'TAR-CHO-R', 25, 0, [{ name: 'Tamaño', value: 'Ración' }]),
        mkVariant('var-008b', 'prod-008', 'Tarta entera', 28.00, 32.00, 'TAR-CHO-E', 5, 1, [{ name: 'Tamaño', value: 'Tarta entera' }]),
      ],
      modifiers: [],
      templateSuffix: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-009',
      handle: 'truffle-mushroom',
      name: 'Truffle Mushroom Burger',
      description: 'Hamburguesa con setas silvestres, queso suizo y mahonesa de trufa negra.',
      categoryId: 'cat-burgers',
      categoryName: 'Hamburguesas',
      vendor: 'Foodfy Kitchen',
      type: 'Plato principal',
      tags: ['hamburguesa', 'trufa', 'premium'],
      status: 'draft',
      publishedAt: null,
      images: [
        mkImage('img-009a', 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop', 'Truffle Mushroom Burger', 0),
      ],
      variants: [
        mkVariant('var-009a', 'prod-009', 'Normal', 14.00, null, 'BUR-TRU-N', 0, 0, [{ name: 'Tamaño', value: 'Normal' }]),
      ],
      modifiers: [],
      templateSuffix: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-010',
      handle: 'patatas-fritas',
      name: 'Patatas Fritas',
      description: 'Patatas crujientes cortadas a mano con sal marina y especias.',
      categoryId: 'cat-starters',
      categoryName: 'Entrantes',
      vendor: 'Foodfy Kitchen',
      type: 'Guarnición',
      tags: ['entrante', 'patatas', 'guarnicion'],
      status: 'active',
      publishedAt: now,
      images: [
        mkImage('img-010a', 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=600&auto=format&fit=crop', 'Patatas Fritas', 0),
      ],
      variants: [
        mkVariant('var-010a', 'prod-010', 'Normal', 4.50, null, 'PAT-FRI-N', 80, 0, [{ name: 'Tamaño', value: 'Normal' }]),
        mkVariant('var-010b', 'prod-010', 'Grande', 6.50, null, 'PAT-FRI-G', 50, 1, [{ name: 'Tamaño', value: 'Grande' }]),
      ],
      modifiers: [
        mkModGroup('mod-010a', 'Salsas', 'multiple', false, 2, [
          mkModOption('mo-010a1', 'Ketchup', 0),
          mkModOption('mo-010a2', 'Mayonesa', 0),
          mkModOption('mo-010a3', 'Salsa brava', 0.50),
          mkModOption('mo-010a4', 'Alioli', 0.50),
        ]),
      ],
      templateSuffix: '',
      createdAt: now,
      updatedAt: now,
    },
  ]

  /* ── Collections ── */
  const collections: Collection[] = [
    {
      id: 'col-bestsellers',
      handle: 'los-mas-vendidos',
      title: 'Los Más Vendidos',
      description: 'Los productos favoritos de nuestros clientes.',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop',
      type: 'manual',
      status: 'active',
      productIds: ['prod-001', 'prod-002', 'prod-003', 'prod-005'],
      sortOrder: 'manual',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'col-burgers',
      handle: 'hamburguesas',
      title: 'Hamburguesas',
      description: 'Todas nuestras hamburguesas artesanales.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
      type: 'manual',
      status: 'active',
      productIds: ['prod-001', 'prod-002', 'prod-007', 'prod-009'],
      sortOrder: 'manual',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'col-summer',
      handle: 'oferta-verano',
      title: 'Oferta Especial Verano',
      description: 'Combos y productos frescos para el calor.',
      image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=600&auto=format&fit=crop',
      type: 'manual',
      status: 'draft',
      productIds: ['prod-004', 'prod-005', 'prod-006'],
      sortOrder: 'manual',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'col-starters',
      handle: 'entrantes',
      title: 'Entrantes',
      description: 'Para empezar con buen pie.',
      image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=600&auto=format&fit=crop',
      type: 'manual',
      status: 'active',
      productIds: ['prod-005', 'prod-010'],
      sortOrder: 'manual',
      createdAt: now,
      updatedAt: now,
    },
  ]

  /* ── Inventory levels (derived from variant stock) ── */
  const inventory: InventoryLevel[] = products.flatMap(p =>
    p.variants.map(v => ({
      variantId: v.id,
      productId: p.id,
      sku: v.sku,
      productName: p.name,
      variantName: v.name,
      available: v.inventoryQuantity,
      incoming: 0,
      reserved: 0,
      tracked: true,
      lowStockThreshold: 10,
      image: v.image || p.images[0]?.url || '',
    }))
  )

  /* ── Write all seed files ── */
  await setCollection('products.json', products)
  await setCollection('collections.json', collections)
  await setCollection('inventory.json', inventory)
  await setCollection('categories.json', categories)
  await setCollection('analytics.json', [] as AnalyticsEvent[])
}
