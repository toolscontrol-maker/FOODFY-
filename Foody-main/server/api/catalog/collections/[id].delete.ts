import { db, schema } from '~/server/db/index'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const existing = await db.select({ id: schema.collections.id }).from(schema.collections).where(eq(schema.collections.id, id)).get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
  }

  await db.delete(schema.collections).where(eq(schema.collections.id, id)).run()
  return { success: true, id }
})
