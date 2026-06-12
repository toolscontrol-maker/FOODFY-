import { db, schema } from '~/server/db/index'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const existing = await db.select({ id: schema.themes.id }).from(schema.themes).where(eq(schema.themes.id, id)).get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Theme not found' })
  }

  // CASCADE deletes templates, sections, blocks
  await db.delete(schema.themes).where(eq(schema.themes.id, id)).run()
  return { success: true, id }
})
