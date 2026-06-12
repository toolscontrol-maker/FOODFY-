import { db, schema } from '~/server/db/index'
import { getFullProduct } from '~/server/db/queries'
import type { Product } from '~/types/commerce'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<Product>>(event)

  if (!body.name) {
    throw createError({ statusCode: 400, statusMessage: 'Product name is required' })
  }

  const now = new Date().toISOString()
  const id = body.id || `prod-${Date.now()}`
  const handle = body.handle || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  // Insert product row
  await db.insert(schema.products).values({
    id,
    handle,
    name: body.name,
    description: body.description ?? '',
    categoryId: body.categoryId || null,
    categoryName: body.categoryName ?? '',
    vendor: body.vendor ?? '',
    type: body.type ?? '',
    status: body.status ?? 'draft',
    publishedAt: body.status === 'active' ? now : null,
    templateSuffix: body.templateSuffix ?? '',
    createdAt: now,
    updatedAt: now,
  }).run()

  // Tags
  if (body.tags && body.tags.length > 0) {
    await db.insert(schema.productTags).values(body.tags.map(tag => ({ productId: id, tag }))).run()
  }

  // Images
  if (body.images && body.images.length > 0) {
    await db.insert(schema.productImages).values(body.images.map(img => ({
      id: img.id,
      productId: id,
      url: img.url,
      alt: img.alt,
      position: img.position,
    }))).run()
  }

  // Variants
  const variants = body.variants ?? [{
    id: `var-${Date.now()}`, productId: id, name: 'Default', price: 0,
    compareAtPrice: null, sku: '', barcode: '', inventoryQuantity: 0,
    availableForSale: false, image: '', options: [], weight: 0, weightUnit: 'g' as const, position: 0,
  }]
  for (const v of variants) {
    await db.insert(schema.productVariants).values({
      id: v.id, productId: id, name: v.name, price: v.price,
      compareAtPrice: v.compareAtPrice, sku: v.sku, barcode: v.barcode,
      inventoryQuantity: v.inventoryQuantity, availableForSale: v.availableForSale,
      image: v.image, weight: v.weight, weightUnit: v.weightUnit, position: v.position,
    }).run()
    if (v.options && v.options.length > 0) {
      await db.insert(schema.variantOptions).values(v.options.map(o => ({ variantId: v.id, name: o.name, value: o.value }))).run()
    }
    await db.insert(schema.inventoryLevels).values({
      variantId: v.id, available: v.inventoryQuantity, tracked: true, lowStockThreshold: 10,
    }).run()
  }

  // Modifiers
  if (body.modifiers) {
    for (const mod of body.modifiers) {
      await db.insert(schema.modifierGroups).values({
        id: mod.id, productId: id, name: mod.name, type: mod.type,
        required: mod.required, maxSelect: mod.maxSelect,
      }).run()
      if (mod.options && mod.options.length > 0) {
        await db.insert(schema.modifierOptions).values(mod.options.map(o => ({
          id: o.id, groupId: mod.id, label: o.label, price: o.price,
        }))).run()
      }
    }
  }

  return await getFullProduct(id)
})
