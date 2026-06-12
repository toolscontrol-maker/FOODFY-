import { db, schema } from '~/server/db/index'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const existing = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.id, id)).get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  // CASCADE deletes variants, images, tags, modifiers automatically
  await db.delete(schema.products).where(eq(schema.products.id, id)).run()
  return { success: true, id }
})
