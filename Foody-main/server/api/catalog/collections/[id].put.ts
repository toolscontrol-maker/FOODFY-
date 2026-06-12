import { db, schema } from '~/server/db/index'
import { getFullCollection } from '~/server/db/queries'
import { eq } from 'drizzle-orm'
import type { Collection } from '~/types/commerce'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const existing = await db.select({ id: schema.collections.id }).from(schema.collections).where(eq(schema.collections.id, id)).get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
  }

  const body = await readBody<Partial<Collection>>(event)
  const now = new Date().toISOString()

  await db.update(schema.collections).set({
    ...(body.title != null && { title: body.title }),
    ...(body.handle != null && { handle: body.handle }),
    ...(body.description != null && { description: body.description }),
    ...(body.image != null && { image: body.image }),
    ...(body.type != null && { type: body.type }),
    ...(body.status != null && { status: body.status }),
    ...(body.sortOrder != null && { sortOrder: body.sortOrder }),
    ...(body.themeTemplate != null && { themeTemplate: body.themeTemplate }),
    updatedAt: now,
  }).where(eq(schema.collections.id, id)).run()

  // Replace product associations if provided
  if (body.productIds) {
    await db.delete(schema.collectionProducts).where(eq(schema.collectionProducts.collectionId, id)).run()
    if (body.productIds.length > 0) {
      await db.insert(schema.collectionProducts).values(
        body.productIds.map((pid, i) => ({ collectionId: id, productId: pid, position: i }))
      ).run()
    }
  }

  return await getFullCollection(id)
})
