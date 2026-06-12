import { db, schema } from '~/server/db/index'
import { getFullProduct } from '~/server/db/queries'
import { eq } from 'drizzle-orm'
import type { Product } from '~/types/commerce'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const existing = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.id, id)).get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const body = await readBody<Partial<Product>>(event)
  const now = new Date().toISOString()

  let publishedAt: string | null | undefined = undefined
  if (body.status === 'active') {
    const cur = await db.select({ publishedAt: schema.products.publishedAt }).from(schema.products).where(eq(schema.products.id, id)).get()
    if (!cur?.publishedAt) publishedAt = now
  } else if (body.status && body.status !== 'active') {
    publishedAt = null
  }

  // Update product row
  await db.update(schema.products).set({
    ...(body.name != null && { name: body.name }),
    ...(body.handle != null && { handle: body.handle }),
    ...(body.description != null && { description: body.description }),
    ...(body.categoryId != null && { categoryId: body.categoryId }),
    ...(body.categoryName != null && { categoryName: body.categoryName }),
    ...(body.vendor != null && { vendor: body.vendor }),
    ...(body.type != null && { type: body.type }),
    ...(body.status != null && { status: body.status }),
    ...(publishedAt !== undefined && { publishedAt }),
    ...(body.templateSuffix != null && { templateSuffix: body.templateSuffix }),
    updatedAt: now,
  }).where(eq(schema.products.id, id)).run()

  // Replace tags if provided
  if (body.tags) {
    await db.delete(schema.productTags).where(eq(schema.productTags.productId, id)).run()
    if (body.tags.length > 0) {
      await db.insert(schema.productTags).values(body.tags.map(tag => ({ productId: id, tag }))).run()
    }
  }

  // Replace images if provided
  if (body.images) {
    await db.delete(schema.productImages).where(eq(schema.productImages.productId, id)).run()
    if (body.images.length > 0) {
      await db.insert(schema.productImages).values(body.images.map(img => ({
        id: img.id,
        productId: id,
        url: img.url,
        alt: img.alt,
        position: img.position,
      }))).run()
    }
  }

  // Replace variants if provided
  if (body.variants) {
    // Delete old variants (cascade deletes options + inventory)
    await db.delete(schema.productVariants).where(eq(schema.productVariants.productId, id)).run()
    for (const v of body.variants) {
      await db.insert(schema.productVariants).values({
        id: v.id,
        productId: id,
        name: v.name,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        sku: v.sku,
        barcode: v.barcode,
        inventoryQuantity: v.inventoryQuantity,
        availableForSale: v.availableForSale,
        image: v.image,
        weight: v.weight,
        weightUnit: v.weightUnit,
        position: v.position,
      }).run()
      if (v.options && v.options.length > 0) {
        await db.insert(schema.variantOptions).values(v.options.map(o => ({
          variantId: v.id,
          name: o.name,
          value: o.value,
        }))).run()
      }
      // Upsert inventory level
      await db.insert(schema.inventoryLevels).values({
        variantId: v.id,
        available: v.inventoryQuantity,
        tracked: true,
        lowStockThreshold: 10,
      }).onConflictDoUpdate({
        target: schema.inventoryLevels.variantId,
        set: { available: v.inventoryQuantity },
      }).run()
    }
  }

  // Replace modifiers if provided
  if (body.modifiers) {
    await db.delete(schema.modifierGroups).where(eq(schema.modifierGroups.productId, id)).run()
    for (const mod of body.modifiers) {
      await db.insert(schema.modifierGroups).values({
        id: mod.id,
        productId: id,
        name: mod.name,
        type: mod.type,
        required: mod.required,
        maxSelect: mod.maxSelect,
      }).run()
      if (mod.options && mod.options.length > 0) {
        await db.insert(schema.modifierOptions).values(mod.options.map(o => ({
          id: o.id,
          groupId: mod.id,
          label: o.label,
          price: o.price,
        }))).run()
      }
    }
  }

  return await getFullProduct(id)
})
