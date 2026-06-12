import { db, schema } from '~/server/db/index'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ variantId: string; available?: number; incoming?: number; reserved?: number; lowStockThreshold?: number }>(event)

  if (!body.variantId) {
    throw createError({ statusCode: 400, statusMessage: 'variantId is required' })
  }

  const existing = await db.select().from(schema.inventoryLevels)
    .where(eq(schema.inventoryLevels.variantId, body.variantId)).get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Inventory level not found' })
  }

  const updates: Record<string, any> = {}
  if (body.available !== undefined) updates.available = body.available
  if (body.incoming !== undefined) updates.incoming = body.incoming
  if (body.reserved !== undefined) updates.reserved = body.reserved
  if (body.lowStockThreshold !== undefined) updates.lowStockThreshold = body.lowStockThreshold

  await db.update(schema.inventoryLevels).set(updates)
    .where(eq(schema.inventoryLevels.variantId, body.variantId)).run()

  // Sync variant stock on product_variants table
  if (body.available !== undefined) {
    await db.update(schema.productVariants).set({
      inventoryQuantity: body.available,
      availableForSale: body.available > 0,
    }).where(eq(schema.productVariants.id, body.variantId)).run()
  }

  // Return updated level with product info
  const variant = await db.select({
    sku: schema.productVariants.sku,
    variantName: schema.productVariants.name,
    variantImage: schema.productVariants.image,
    productId: schema.productVariants.productId,
  }).from(schema.productVariants).where(eq(schema.productVariants.id, body.variantId)).get()

  const product = variant ? await db.select({ name: schema.products.name })
    .from(schema.products).where(eq(schema.products.id, variant.productId)).get() : null

  const updated = (await db.select().from(schema.inventoryLevels)
    .where(eq(schema.inventoryLevels.variantId, body.variantId)).get())!

  return {
    variantId: updated.variantId,
    productId: variant?.productId ?? '',
    sku: variant?.sku ?? '',
    productName: product?.name ?? '',
    variantName: variant?.variantName ?? '',
    available: updated.available,
    incoming: updated.incoming,
    reserved: updated.reserved,
    tracked: updated.tracked,
    lowStockThreshold: updated.lowStockThreshold,
    image: variant?.variantImage || '',
  }
})
