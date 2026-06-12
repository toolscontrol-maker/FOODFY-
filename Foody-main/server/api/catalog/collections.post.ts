import { db, schema } from '~/server/db/index'
import { getFullCollection } from '~/server/db/queries'
import type { Collection } from '~/types/commerce'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<Collection>>(event)

  if (!body.title) {
    throw createError({ statusCode: 400, statusMessage: 'Collection title is required' })
  }

  const now = new Date().toISOString()
  const id = body.id || `col-${Date.now()}`
  const handle = body.handle || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  await db.insert(schema.collections).values({
    id,
    handle,
    title: body.title,
    description: body.description ?? '',
    image: body.image ?? '',
    type: body.type ?? 'manual',
    status: body.status ?? 'draft',
    sortOrder: body.sortOrder ?? 'manual',
    themeTemplate: body.themeTemplate ?? '',
    createdAt: now,
    updatedAt: now,
  }).run()

  if (body.productIds && body.productIds.length > 0) {
    await db.insert(schema.collectionProducts).values(
      body.productIds.map((pid, i) => ({ collectionId: id, productId: pid, position: i }))
    ).run()
  }

  return await getFullCollection(id)
})
