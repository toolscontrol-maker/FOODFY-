/* ─────────────────────────────────────────────────────────
   Database Seed — Populates tables with initial data.
   Only runs if the products table is empty.
   ───────────────────────────────────────────────────────── */
import { db, schema } from './index'
import { eq, count } from 'drizzle-orm'
import { seedThemes } from './seed-themes'

export async function seedDatabase() {
  // Check if already seeded
  const [row] = await db.select({ c: count() }).from(schema.products).all()
  if (row && row.c > 0) return

  const now = new Date().toISOString()

  /* ── Categories ── */
  await db.insert(schema.categories).values([
    { id: 'cat-burgers', name: 'Hamburguesas', slug: 'hamburguesas', position: 0 },
    { id: 'cat-pizzas', name: 'Pizzas', slug: 'pizzas', position: 1 },
    { id: 'cat-starters', name: 'Entrantes', slug: 'entrantes', position: 2 },
    { id: 'cat-salads', name: 'Ensaladas', slug: 'ensaladas', position: 3 },
    { id: 'cat-drinks', name: 'Bebidas', slug: 'bebidas', position: 4 },
    { id: 'cat-desserts', name: 'Postres', slug: 'postres', position: 5 },
  ]).run()

  /* ── Products ── */
  const productsData = [
    { id: 'prod-001', handle: 'hamburguesa-clasica', name: 'Hamburguesa Clásica', description: 'Carne 100% vacuno, lechuga, tomate, cebolla roja y salsa especial en pan brioche.', categoryId: 'cat-burgers', categoryName: 'Hamburguesas', vendor: 'Foodfy Kitchen', type: 'Plato principal', status: 'active' as const, publishedAt: now, templateSuffix: '', createdAt: now, updatedAt: now },
    { id: 'prod-002', handle: 'doble-smash-bacon', name: 'Doble Smash Bacon', description: 'Doble smash patty, cuádruple cheddar, bacon crujiente y salsa BBQ.', categoryId: 'cat-burgers', categoryName: 'Hamburguesas', vendor: 'Foodfy Kitchen', type: 'Plato principal', status: 'active' as const, publishedAt: now, templateSuffix: '', createdAt: now, updatedAt: now },
    { id: 'prod-003', handle: 'pizza-margherita', name: 'Pizza Margherita', description: 'Masa artesanal, tomate San Marzano, mozzarella fresca y albahaca.', categoryId: 'cat-pizzas', categoryName: 'Pizzas', vendor: 'Foodfy Kitchen', type: 'Plato principal', status: 'active' as const, publishedAt: now, templateSuffix: '', createdAt: now, updatedAt: now },
    { id: 'prod-004', handle: 'ensalada-cesar', name: 'Ensalada César', description: 'Lechuga romana, pollo a la plancha, croutons, parmesano y salsa César casera.', categoryId: 'cat-salads', categoryName: 'Ensaladas', vendor: 'Foodfy Fresh', type: 'Ensalada', status: 'active' as const, publishedAt: now, templateSuffix: '', createdAt: now, updatedAt: now },
    { id: 'prod-005', handle: 'nachos-guacamole', name: 'Nachos con Guacamole', description: 'Nachos crujientes con guacamole fresco, pico de gallo, crema agria y jalapeños.', categoryId: 'cat-starters', categoryName: 'Entrantes', vendor: 'Foodfy Snacks', type: 'Entrante', status: 'active' as const, publishedAt: now, templateSuffix: '', createdAt: now, updatedAt: now },
    { id: 'prod-006', handle: 'smoothie-tropical', name: 'Smoothie Tropical', description: 'Mango, piña, plátano y leche de coco. Refrescante y natural.', categoryId: 'cat-drinks', categoryName: 'Bebidas', vendor: 'Foodfy Drinks', type: 'Bebida', status: 'active' as const, publishedAt: now, templateSuffix: '', createdAt: now, updatedAt: now },
    { id: 'prod-007', handle: 'wrap-pollo-bbq', name: 'Wrap de Pollo BBQ', description: 'Tortilla de trigo, pollo marinado BBQ, lechuga, maíz y salsa ranch.', categoryId: 'cat-burgers', categoryName: 'Hamburguesas', vendor: 'Foodfy Kitchen', type: 'Plato principal', status: 'active' as const, publishedAt: now, templateSuffix: '', createdAt: now, updatedAt: now },
    { id: 'prod-008', handle: 'tarta-chocolate', name: 'Tarta de Chocolate', description: 'Bizcocho esponjoso de cacao con ganache de chocolate belga y frutos rojos.', categoryId: 'cat-desserts', categoryName: 'Postres', vendor: 'Foodfy Pastry', type: 'Postre', status: 'active' as const, publishedAt: now, templateSuffix: '', createdAt: now, updatedAt: now },
    { id: 'prod-009', handle: 'truffle-mushroom', name: 'Truffle Mushroom Burger', description: 'Hamburguesa con setas silvestres, queso suizo y mahonesa de trufa negra.', categoryId: 'cat-burgers', categoryName: 'Hamburguesas', vendor: 'Foodfy Kitchen', type: 'Plato principal', status: 'draft' as const, publishedAt: null, templateSuffix: '', createdAt: now, updatedAt: now },
    { id: 'prod-010', handle: 'patatas-fritas', name: 'Patatas Fritas', description: 'Patatas crujientes cortadas a mano con sal marina y especias.', categoryId: 'cat-starters', categoryName: 'Entrantes', vendor: 'Foodfy Kitchen', type: 'Guarnición', status: 'active' as const, publishedAt: now, templateSuffix: '', createdAt: now, updatedAt: now },
  ]
  await db.insert(schema.products).values(productsData).run()

  /* ── Product Tags ── */
  const tags = [
    { productId: 'prod-001', tag: 'popular' }, { productId: 'prod-001', tag: 'carne' }, { productId: 'prod-001', tag: 'hamburguesa' },
    { productId: 'prod-002', tag: 'popular' }, { productId: 'prod-002', tag: 'carne' }, { productId: 'prod-002', tag: 'hamburguesa' }, { productId: 'prod-002', tag: 'bacon' },
    { productId: 'prod-003', tag: 'pizza' }, { productId: 'prod-003', tag: 'vegetariano' }, { productId: 'prod-003', tag: 'italiano' },
    { productId: 'prod-004', tag: 'ensalada' }, { productId: 'prod-004', tag: 'pollo' }, { productId: 'prod-004', tag: 'saludable' },
    { productId: 'prod-005', tag: 'entrante' }, { productId: 'prod-005', tag: 'compartir' }, { productId: 'prod-005', tag: 'mexicano' },
    { productId: 'prod-006', tag: 'bebida' }, { productId: 'prod-006', tag: 'smoothie' }, { productId: 'prod-006', tag: 'tropical' }, { productId: 'prod-006', tag: 'vegano' },
    { productId: 'prod-007', tag: 'wrap' }, { productId: 'prod-007', tag: 'pollo' }, { productId: 'prod-007', tag: 'bbq' },
    { productId: 'prod-008', tag: 'postre' }, { productId: 'prod-008', tag: 'chocolate' }, { productId: 'prod-008', tag: 'dulce' },
    { productId: 'prod-009', tag: 'hamburguesa' }, { productId: 'prod-009', tag: 'trufa' }, { productId: 'prod-009', tag: 'premium' },
    { productId: 'prod-010', tag: 'entrante' }, { productId: 'prod-010', tag: 'patatas' }, { productId: 'prod-010', tag: 'guarnicion' },
  ]
  await db.insert(schema.productTags).values(tags).run()

  /* ── Product Images ── */
  await db.insert(schema.productImages).values([
    { id: 'img-001a', productId: 'prod-001', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', alt: 'Hamburguesa Clásica', position: 0 },
    { id: 'img-001b', productId: 'prod-001', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop', alt: 'Hamburguesa Clásica lateral', position: 1 },
    { id: 'img-002a', productId: 'prod-002', url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=600&auto=format&fit=crop', alt: 'Doble Smash Bacon', position: 0 },
    { id: 'img-003a', productId: 'prod-003', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop', alt: 'Pizza Margherita', position: 0 },
    { id: 'img-004a', productId: 'prod-004', url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=600&auto=format&fit=crop', alt: 'Ensalada César', position: 0 },
    { id: 'img-005a', productId: 'prod-005', url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=600&auto=format&fit=crop', alt: 'Nachos con Guacamole', position: 0 },
    { id: 'img-006a', productId: 'prod-006', url: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=600&auto=format&fit=crop', alt: 'Smoothie Tropical', position: 0 },
    { id: 'img-007a', productId: 'prod-007', url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=600&auto=format&fit=crop', alt: 'Wrap de Pollo BBQ', position: 0 },
    { id: 'img-008a', productId: 'prod-008', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop', alt: 'Tarta de Chocolate', position: 0 },
    { id: 'img-009a', productId: 'prod-009', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop', alt: 'Truffle Mushroom Burger', position: 0 },
    { id: 'img-010a', productId: 'prod-010', url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=600&auto=format&fit=crop', alt: 'Patatas Fritas', position: 0 },
  ]).run()

  /* ── Variants ── */
  const variants = [
    { id: 'var-001a', productId: 'prod-001', name: 'Normal', price: 9.50, compareAtPrice: 12.00, sku: 'BUR-CLA-N', barcode: '', inventoryQuantity: 45, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 0 },
    { id: 'var-001b', productId: 'prod-001', name: 'Doble', price: 13.50, compareAtPrice: 16.00, sku: 'BUR-CLA-D', barcode: '', inventoryQuantity: 30, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 1 },
    { id: 'var-001c', productId: 'prod-001', name: 'Triple', price: 16.50, compareAtPrice: null, sku: 'BUR-CLA-T', barcode: '', inventoryQuantity: 15, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 2 },
    { id: 'var-002a', productId: 'prod-002', name: 'Normal', price: 15.00, compareAtPrice: null, sku: 'BUR-SMB-N', barcode: '', inventoryQuantity: 25, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 0 },
    { id: 'var-003a', productId: 'prod-003', name: 'Mediana', price: 11.90, compareAtPrice: null, sku: 'PIZ-MAR-M', barcode: '', inventoryQuantity: 40, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 0 },
    { id: 'var-003b', productId: 'prod-003', name: 'Familiar', price: 16.90, compareAtPrice: 19.00, sku: 'PIZ-MAR-F', barcode: '', inventoryQuantity: 20, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 1 },
    { id: 'var-004a', productId: 'prod-004', name: 'Normal', price: 8.75, compareAtPrice: 10.50, sku: 'ENS-CES-N', barcode: '', inventoryQuantity: 35, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 0 },
    { id: 'var-004b', productId: 'prod-004', name: 'Grande', price: 11.50, compareAtPrice: null, sku: 'ENS-CES-G', barcode: '', inventoryQuantity: 20, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 1 },
    { id: 'var-005a', productId: 'prod-005', name: 'Normal', price: 6.50, compareAtPrice: 8.00, sku: 'NAC-GUA-N', barcode: '', inventoryQuantity: 50, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 0 },
    { id: 'var-005b', productId: 'prod-005', name: 'Para compartir', price: 10.50, compareAtPrice: null, sku: 'NAC-GUA-C', barcode: '', inventoryQuantity: 30, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 1 },
    { id: 'var-006a', productId: 'prod-006', name: '350ml', price: 4.90, compareAtPrice: null, sku: 'SMO-TRO-S', barcode: '', inventoryQuantity: 60, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 0 },
    { id: 'var-006b', productId: 'prod-006', name: '500ml', price: 6.50, compareAtPrice: null, sku: 'SMO-TRO-L', barcode: '', inventoryQuantity: 40, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 1 },
    { id: 'var-007a', productId: 'prod-007', name: 'Normal', price: 7.20, compareAtPrice: null, sku: 'WRP-POL-N', barcode: '', inventoryQuantity: 35, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 0 },
    { id: 'var-008a', productId: 'prod-008', name: 'Ración', price: 5.50, compareAtPrice: null, sku: 'TAR-CHO-R', barcode: '', inventoryQuantity: 25, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 0 },
    { id: 'var-008b', productId: 'prod-008', name: 'Tarta entera', price: 28.00, compareAtPrice: 32.00, sku: 'TAR-CHO-E', barcode: '', inventoryQuantity: 5, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 1 },
    { id: 'var-009a', productId: 'prod-009', name: 'Normal', price: 14.00, compareAtPrice: null, sku: 'BUR-TRU-N', barcode: '', inventoryQuantity: 0, availableForSale: false, image: '', weight: 0, weightUnit: 'g', position: 0 },
    { id: 'var-010a', productId: 'prod-010', name: 'Normal', price: 4.50, compareAtPrice: null, sku: 'PAT-FRI-N', barcode: '', inventoryQuantity: 80, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 0 },
    { id: 'var-010b', productId: 'prod-010', name: 'Grande', price: 6.50, compareAtPrice: null, sku: 'PAT-FRI-G', barcode: '', inventoryQuantity: 50, availableForSale: true, image: '', weight: 0, weightUnit: 'g', position: 1 },
  ]
  await db.insert(schema.productVariants).values(variants).run()

  /* ── Variant Options ── */
  const varOpts = [
    { variantId: 'var-001a', name: 'Tamaño', value: 'Normal' },
    { variantId: 'var-001b', name: 'Tamaño', value: 'Doble' },
    { variantId: 'var-001c', name: 'Tamaño', value: 'Triple' },
    { variantId: 'var-002a', name: 'Tamaño', value: 'Normal' },
    { variantId: 'var-003a', name: 'Tamaño', value: 'Mediana' },
    { variantId: 'var-003b', name: 'Tamaño', value: 'Familiar' },
    { variantId: 'var-004a', name: 'Tamaño', value: 'Normal' },
    { variantId: 'var-004b', name: 'Tamaño', value: 'Grande' },
    { variantId: 'var-005a', name: 'Tamaño', value: 'Normal' },
    { variantId: 'var-005b', name: 'Tamaño', value: 'Para compartir' },
    { variantId: 'var-006a', name: 'Tamaño', value: '350ml' },
    { variantId: 'var-006b', name: 'Tamaño', value: '500ml' },
    { variantId: 'var-007a', name: 'Tamaño', value: 'Normal' },
    { variantId: 'var-008a', name: 'Tamaño', value: 'Ración' },
    { variantId: 'var-008b', name: 'Tamaño', value: 'Tarta entera' },
    { variantId: 'var-009a', name: 'Tamaño', value: 'Normal' },
    { variantId: 'var-010a', name: 'Tamaño', value: 'Normal' },
    { variantId: 'var-010b', name: 'Tamaño', value: 'Grande' },
  ]
  await db.insert(schema.variantOptions).values(varOpts).run()

  /* ── Modifier Groups ── */
  await db.insert(schema.modifierGroups).values([
    { id: 'mod-001a', productId: 'prod-001', name: 'Punto de la carne', type: 'single', required: true, maxSelect: 1 },
    { id: 'mod-001b', productId: 'prod-001', name: 'Extras', type: 'multiple', required: false, maxSelect: 3 },
    { id: 'mod-002a', productId: 'prod-002', name: 'Extras', type: 'multiple', required: false, maxSelect: 3 },
    { id: 'mod-003a', productId: 'prod-003', name: 'Extras', type: 'multiple', required: false, maxSelect: 4 },
    { id: 'mod-010a', productId: 'prod-010', name: 'Salsas', type: 'multiple', required: false, maxSelect: 2 },
  ]).run()

  /* ── Modifier Options ── */
  await db.insert(schema.modifierOptions).values([
    { id: 'mo-001a1', groupId: 'mod-001a', label: 'Poco hecha', price: 0 },
    { id: 'mo-001a2', groupId: 'mod-001a', label: 'Al punto', price: 0 },
    { id: 'mo-001a3', groupId: 'mod-001a', label: 'Muy hecha', price: 0 },
    { id: 'mo-001b1', groupId: 'mod-001b', label: 'Extra queso cheddar', price: 1.50 },
    { id: 'mo-001b2', groupId: 'mod-001b', label: 'Bacon ahumado', price: 2.00 },
    { id: 'mo-001b3', groupId: 'mod-001b', label: 'Huevo frito', price: 1.20 },
    { id: 'mo-002a1', groupId: 'mod-002a', label: 'Extra bacon', price: 2.50 },
    { id: 'mo-002a2', groupId: 'mod-002a', label: 'Jalapeños', price: 1.00 },
    { id: 'mo-003a1', groupId: 'mod-003a', label: 'Extra mozzarella', price: 2.00 },
    { id: 'mo-003a2', groupId: 'mod-003a', label: 'Rúcula', price: 1.50 },
    { id: 'mo-003a3', groupId: 'mod-003a', label: 'Jamón serrano', price: 3.00 },
    { id: 'mo-010a1', groupId: 'mod-010a', label: 'Ketchup', price: 0 },
    { id: 'mo-010a2', groupId: 'mod-010a', label: 'Mayonesa', price: 0 },
    { id: 'mo-010a3', groupId: 'mod-010a', label: 'Salsa brava', price: 0.50 },
    { id: 'mo-010a4', groupId: 'mod-010a', label: 'Alioli', price: 0.50 },
  ]).run()

  /* ── Inventory Levels ── */
  const invLevels = variants.map(v => ({
    variantId: v.id,
    available: v.inventoryQuantity,
    incoming: 0,
    reserved: 0,
    tracked: true,
    lowStockThreshold: 10,
  }))
  await db.insert(schema.inventoryLevels).values(invLevels).run()

  /* ── Collections ── */
  await db.insert(schema.collections).values([
    { id: 'col-bestsellers', handle: 'los-mas-vendidos', title: 'Los Más Vendidos', description: 'Los productos favoritos de nuestros clientes.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop', type: 'manual', status: 'active', sortOrder: 'manual', themeTemplate: '', createdAt: now, updatedAt: now },
    { id: 'col-burgers', handle: 'hamburguesas', title: 'Hamburguesas', description: 'Todas nuestras hamburguesas artesanales.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', type: 'manual', status: 'active', sortOrder: 'manual', themeTemplate: '', createdAt: now, updatedAt: now },
    { id: 'col-summer', handle: 'oferta-verano', title: 'Oferta Especial Verano', description: 'Combos y productos frescos para el calor.', image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=600&auto=format&fit=crop', type: 'manual', status: 'draft', sortOrder: 'manual', themeTemplate: '', createdAt: now, updatedAt: now },
    { id: 'col-starters', handle: 'entrantes', title: 'Entrantes', description: 'Para empezar con buen pie.', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=600&auto=format&fit=crop', type: 'manual', status: 'active', sortOrder: 'manual', themeTemplate: '', createdAt: now, updatedAt: now },
  ]).run()

  /* ── Collection ↔ Product ── */
  await db.insert(schema.collectionProducts).values([
    { collectionId: 'col-bestsellers', productId: 'prod-001', position: 0 },
    { collectionId: 'col-bestsellers', productId: 'prod-002', position: 1 },
    { collectionId: 'col-bestsellers', productId: 'prod-003', position: 2 },
    { collectionId: 'col-bestsellers', productId: 'prod-005', position: 3 },
    { collectionId: 'col-burgers', productId: 'prod-001', position: 0 },
    { collectionId: 'col-burgers', productId: 'prod-002', position: 1 },
    { collectionId: 'col-burgers', productId: 'prod-007', position: 2 },
    { collectionId: 'col-burgers', productId: 'prod-009', position: 3 },
    { collectionId: 'col-summer', productId: 'prod-004', position: 0 },
    { collectionId: 'col-summer', productId: 'prod-005', position: 1 },
    { collectionId: 'col-summer', productId: 'prod-006', position: 2 },
    { collectionId: 'col-starters', productId: 'prod-005', position: 0 },
    { collectionId: 'col-starters', productId: 'prod-010', position: 1 },
  ]).run()

  /* ── Orders ── */
  await db.insert(schema.orders).values([
    { id: '#1001', date: '14:30', customer: 'Juan Pérez', itemsText: '2x Burger Clásica, 1x Patatas', total: 45.50, paymentStatus: 'paid', fulfillmentStatus: 'delivered', deliveryMethod: 'delivery', createdAt: now },
    { id: '#1002', date: '13:15', customer: 'María Gómez', itemsText: '1x Pizza Margarita, 2x Coca-Cola', total: 22.00, paymentStatus: 'paid', fulfillmentStatus: 'preparing', deliveryMethod: 'dine_in', createdAt: now },
    { id: '#1003', date: '12:45', customer: 'Carlos Ramírez', itemsText: '1x Ensalada César', total: 18.50, paymentStatus: 'pending', fulfillmentStatus: 'received', deliveryMethod: 'pickup', createdAt: now },
    { id: '#1004', date: 'Ayer 20:00', customer: 'Ana Torres', itemsText: '3x Tacos, 1x Guacamole, 2x Agua', total: 60.00, paymentStatus: 'paid', fulfillmentStatus: 'delivered', deliveryMethod: 'delivery', createdAt: now },
    { id: '#1005', date: 'Ayer 18:30', customer: 'Luis Silva', itemsText: '1x Ramen Tonkotsu', total: 32.10, paymentStatus: 'pending', fulfillmentStatus: 'ready', deliveryMethod: 'pickup', createdAt: now },
    { id: '#1006', date: '15 feb 14:00', customer: 'Carmen Rosa', itemsText: '2x Sushi Roll, 1x Edamame', total: 12.00, paymentStatus: 'refunded', fulfillmentStatus: 'cancelled', deliveryMethod: 'delivery', createdAt: now },
    { id: '#1007', date: '14:00', customer: 'Mesa 5', itemsText: '1x Paella Valenciana, 2x Sangría', total: 38.90, paymentStatus: 'paid', fulfillmentStatus: 'preparing', deliveryMethod: 'dine_in', createdAt: now },
    { id: '#1008', date: '13:50', customer: 'Roberto Díaz', itemsText: '1x Wrap Pollo, 1x Smoothie', total: 15.20, paymentStatus: 'paid', fulfillmentStatus: 'delivering', deliveryMethod: 'delivery', createdAt: now },
  ]).run()

  /* ── Settings ── */
  await db.insert(schema.settings).values([
    { key: 'store.name', value: JSON.stringify('Mi tienda'), updatedAt: now },
    { key: 'store.address', value: JSON.stringify('Calle Ejemplo 123, Valencia, España'), updatedAt: now },
    { key: 'store.phone', value: JSON.stringify('+34 612 345 678'), updatedAt: now },
    { key: 'store.currency', value: JSON.stringify('EUR'), updatedAt: now },
    { key: 'store.timezone', value: JSON.stringify('(GMT+01:00) Madrid'), updatedAt: now },
    { key: 'brand.colorPrimary', value: JSON.stringify('#16a34a'), updatedAt: now },
    { key: 'brand.colorSecondary', value: JSON.stringify('#f59e0b'), updatedAt: now },
  ]).run()

  /* ══════════════════════════════════════════════════════════
     STUDIO — WAREHOUSE, RECIPES, PURCHASE ORDERS
     ══════════════════════════════════════════════════════════ */

  const tomorrow = new Date(Date.now() + 86400000).toISOString()
  const in3days = new Date(Date.now() + 3 * 86400000).toISOString()
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString()
  const in14days = new Date(Date.now() + 14 * 86400000).toISOString()
  const yesterday = new Date(Date.now() - 86400000).toISOString()

  /* ── Warehouse Items ── */
  await db.insert(schema.warehouseItems).values([
    { id: 'wh-001', name: 'Carne de ternera', category: 'carnes', unit: 'kg', currentStock: 25, committedStock: 8.5, minimumStock: 5, costPerUnit: 12.50, supplier: 'Carnes del Norte', expiryDate: in3days, location: 'Cámara fría A', notes: '', createdAt: now, updatedAt: now },
    { id: 'wh-002', name: 'Pollo entero', category: 'carnes', unit: 'kg', currentStock: 15, committedStock: 6, minimumStock: 4, costPerUnit: 5.80, supplier: 'Avícola Sur', expiryDate: in7days, location: 'Cámara fría A', notes: '', createdAt: now, updatedAt: now },
    { id: 'wh-003', name: 'Pan de hamburguesa', category: 'panadería', unit: 'unidades', currentStock: 120, committedStock: 40, minimumStock: 30, costPerUnit: 0.35, supplier: 'Panadería Artesana', expiryDate: tomorrow, location: 'Estantería B1', notes: 'Pedir cada día', createdAt: now, updatedAt: now },
    { id: 'wh-004', name: 'Lechuga iceberg', category: 'verduras', unit: 'kg', currentStock: 8, committedStock: 3, minimumStock: 2, costPerUnit: 1.20, supplier: 'Huerta Local', expiryDate: in3days, location: 'Cámara fría B', notes: '', createdAt: now, updatedAt: now },
    { id: 'wh-005', name: 'Tomate', category: 'verduras', unit: 'kg', currentStock: 12, committedStock: 4.5, minimumStock: 3, costPerUnit: 1.80, supplier: 'Huerta Local', expiryDate: in7days, location: 'Cámara fría B', notes: '', createdAt: now, updatedAt: now },
    { id: 'wh-006', name: 'Queso cheddar', category: 'lácteos', unit: 'kg', currentStock: 6, committedStock: 2.5, minimumStock: 2, costPerUnit: 8.90, supplier: 'Lácteos Premium', expiryDate: in14days, location: 'Cámara fría A', notes: '', createdAt: now, updatedAt: now },
    { id: 'wh-007', name: 'Salsa BBQ', category: 'salsas', unit: 'L', currentStock: 5, committedStock: 1.5, minimumStock: 2, costPerUnit: 4.50, supplier: 'Salsas Gourmet', expiryDate: in14days, location: 'Estantería C2', notes: '', createdAt: now, updatedAt: now },
    { id: 'wh-008', name: 'Patatas', category: 'verduras', unit: 'kg', currentStock: 30, committedStock: 10, minimumStock: 8, costPerUnit: 0.90, supplier: 'Huerta Local', expiryDate: in14days, location: 'Almacén seco', notes: '', createdAt: now, updatedAt: now },
    { id: 'wh-009', name: 'Aceite de oliva', category: 'salsas', unit: 'L', currentStock: 10, committedStock: 2, minimumStock: 3, costPerUnit: 6.00, supplier: 'Aceites del Sur', expiryDate: null, location: 'Estantería C1', notes: 'Virgen extra', createdAt: now, updatedAt: now },
    { id: 'wh-010', name: 'Harina de trigo', category: 'panadería', unit: 'kg', currentStock: 20, committedStock: 5, minimumStock: 5, costPerUnit: 0.80, supplier: 'Molinos Castilla', expiryDate: null, location: 'Almacén seco', notes: '', createdAt: now, updatedAt: now },
    { id: 'wh-011', name: 'Mozzarella', category: 'lácteos', unit: 'kg', currentStock: 4, committedStock: 3, minimumStock: 2, costPerUnit: 7.50, supplier: 'Lácteos Premium', expiryDate: in3days, location: 'Cámara fría A', notes: 'Stock bajo', createdAt: now, updatedAt: now },
    { id: 'wh-012', name: 'Salmón fresco', category: 'pescados', unit: 'kg', currentStock: 3, committedStock: 1.5, minimumStock: 1, costPerUnit: 22.00, supplier: 'Pescados Atlántico', expiryDate: tomorrow, location: 'Cámara fría C', notes: 'Caduca pronto', createdAt: now, updatedAt: now },
    { id: 'wh-013', name: 'Coca-Cola 33cl', category: 'bebidas', unit: 'unidades', currentStock: 200, committedStock: 30, minimumStock: 50, costPerUnit: 0.45, supplier: 'Distribuidora Bebidas', expiryDate: null, location: 'Almacén seco', notes: '', createdAt: now, updatedAt: now },
    { id: 'wh-014', name: 'Cebolla', category: 'verduras', unit: 'kg', currentStock: 10, committedStock: 3, minimumStock: 3, costPerUnit: 1.10, supplier: 'Huerta Local', expiryDate: in14days, location: 'Almacén seco', notes: '', createdAt: now, updatedAt: now },
    { id: 'wh-015', name: 'Bacon', category: 'carnes', unit: 'kg', currentStock: 5, committedStock: 2, minimumStock: 2, costPerUnit: 9.50, supplier: 'Carnes del Norte', expiryDate: in7days, location: 'Cámara fría A', notes: '', createdAt: now, updatedAt: now },
  ]).run()

  /* ── Recipes (linked to products — only for the 3 store products) ── */
  await db.insert(schema.recipes).values([
    { id: 'rec-001', name: 'Hamburguesa Clásica', description: 'Hamburguesa clásica con carne de ternera, queso cheddar, lechuga y tomate en pan artesano.', productId: 'prod-001', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop', yield: 1, prepTime: 10, cookTime: 8, status: 'active', createdAt: now, updatedAt: now },
    { id: 'rec-002', name: 'Doble Smash Bacon', description: 'Doble carne con bacon crujiente, queso cheddar y salsa BBQ ahumada.', productId: 'prod-002', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=400&auto=format&fit=crop', yield: 1, prepTime: 12, cookTime: 10, status: 'active', createdAt: now, updatedAt: now },
    { id: 'rec-003', name: 'Truffle Mushroom', description: 'Hamburguesa gourmet con setas silvestres salteadas, queso suizo fundido y mahonesa de trufa negra.', productId: 'prod-009', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop', yield: 1, prepTime: 15, cookTime: 10, status: 'active', createdAt: now, updatedAt: now },
  ]).run()

  /* ── Recipe Ingredients (connects recipes ↔ warehouse) ── */
  await db.insert(schema.recipeIngredients).values([
    // Hamburguesa Clásica (rec-001 → prod-001)
    { id: 'ri-001', recipeId: 'rec-001', warehouseItemId: 'wh-001', quantity: 0.18, unit: 'kg' },   // Carne de ternera
    { id: 'ri-002', recipeId: 'rec-001', warehouseItemId: 'wh-003', quantity: 1, unit: 'unidades' }, // Pan de hamburguesa
    { id: 'ri-003', recipeId: 'rec-001', warehouseItemId: 'wh-006', quantity: 0.04, unit: 'kg' },   // Queso cheddar
    { id: 'ri-004', recipeId: 'rec-001', warehouseItemId: 'wh-004', quantity: 0.03, unit: 'kg' },   // Lechuga iceberg
    { id: 'ri-005', recipeId: 'rec-001', warehouseItemId: 'wh-005', quantity: 0.05, unit: 'kg' },   // Tomate
    // Doble Smash Bacon (rec-002 → prod-002)
    { id: 'ri-006', recipeId: 'rec-002', warehouseItemId: 'wh-001', quantity: 0.36, unit: 'kg' },   // Carne de ternera (doble)
    { id: 'ri-007', recipeId: 'rec-002', warehouseItemId: 'wh-003', quantity: 1, unit: 'unidades' }, // Pan de hamburguesa
    { id: 'ri-008', recipeId: 'rec-002', warehouseItemId: 'wh-015', quantity: 0.06, unit: 'kg' },   // Bacon
    { id: 'ri-009', recipeId: 'rec-002', warehouseItemId: 'wh-006', quantity: 0.06, unit: 'kg' },   // Queso cheddar
    { id: 'ri-010', recipeId: 'rec-002', warehouseItemId: 'wh-007', quantity: 0.03, unit: 'L' },    // Salsa BBQ
    // Truffle Mushroom (rec-003 → prod-009)
    { id: 'ri-011', recipeId: 'rec-003', warehouseItemId: 'wh-001', quantity: 0.20, unit: 'kg' },   // Carne de ternera
    { id: 'ri-012', recipeId: 'rec-003', warehouseItemId: 'wh-003', quantity: 1, unit: 'unidades' }, // Pan de hamburguesa
    { id: 'ri-013', recipeId: 'rec-003', warehouseItemId: 'wh-014', quantity: 0.04, unit: 'kg' },   // Cebolla (caramelizada)
    { id: 'ri-014', recipeId: 'rec-003', warehouseItemId: 'wh-009', quantity: 0.01, unit: 'L' },    // Aceite de oliva (trufa)
  ]).run()

  /* ── Purchase Orders ── */
  await db.insert(schema.purchaseOrders).values([
    { id: 'po-001', supplier: 'Carnes del Norte', status: 'received', totalCost: 312.50, orderDate: yesterday, expectedDelivery: now, receivedDate: now, notes: 'Entrega matutina completada', createdAt: now, updatedAt: now },
    { id: 'po-002', supplier: 'Huerta Local', status: 'ordered', totalCost: 89.00, orderDate: now, expectedDelivery: tomorrow, receivedDate: null, notes: 'Verduras frescas semanales', createdAt: now, updatedAt: now },
    { id: 'po-003', supplier: 'Lácteos Premium', status: 'draft', totalCost: 163.00, orderDate: now, expectedDelivery: in3days, receivedDate: null, notes: 'Pendiente de confirmación', createdAt: now, updatedAt: now },
    { id: 'po-004', supplier: 'Pescados Atlántico', status: 'ordered', totalCost: 220.00, orderDate: yesterday, expectedDelivery: tomorrow, receivedDate: null, notes: 'Salmón fresco — urgente', createdAt: now, updatedAt: now },
  ]).run()

  /* ── Purchase Order Items ── */
  await db.insert(schema.purchaseOrderItems).values([
    { id: 'poi-001', purchaseOrderId: 'po-001', warehouseItemId: 'wh-001', quantity: 25, unit: 'kg', unitCost: 12.50, receivedQuantity: 25 },
    { id: 'poi-002', purchaseOrderId: 'po-002', warehouseItemId: 'wh-004', quantity: 10, unit: 'kg', unitCost: 1.20, receivedQuantity: 0 },
    { id: 'poi-003', purchaseOrderId: 'po-002', warehouseItemId: 'wh-005', quantity: 15, unit: 'kg', unitCost: 1.80, receivedQuantity: 0 },
    { id: 'poi-004', purchaseOrderId: 'po-002', warehouseItemId: 'wh-008', quantity: 30, unit: 'kg', unitCost: 0.90, receivedQuantity: 0 },
    { id: 'poi-005', purchaseOrderId: 'po-002', warehouseItemId: 'wh-014', quantity: 10, unit: 'kg', unitCost: 1.10, receivedQuantity: 0 },
    { id: 'poi-006', purchaseOrderId: 'po-003', warehouseItemId: 'wh-006', quantity: 10, unit: 'kg', unitCost: 8.90, receivedQuantity: 0 },
    { id: 'poi-007', purchaseOrderId: 'po-003', warehouseItemId: 'wh-011', quantity: 8, unit: 'kg', unitCost: 7.50, receivedQuantity: 0 },
    { id: 'poi-008', purchaseOrderId: 'po-004', warehouseItemId: 'wh-012', quantity: 10, unit: 'kg', unitCost: 22.00, receivedQuantity: 0 },
  ]).run()

  console.log('[DB] Seed complete — all tables populated.')

  // Seed themes (has its own guard)
  await seedThemes()
}
