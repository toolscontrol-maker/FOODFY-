import { db, schema } from '~/server/db/index'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, any>>(event)
  const now = new Date().toISOString()

  for (const [key, value] of Object.entries(body)) {
    await db.insert(schema.settings).values({
      key,
      value: typeof value === 'string' ? JSON.parse(value) : value,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: schema.settings.key,
      set: { value: typeof value === 'string' ? JSON.parse(value) : value, updatedAt: now },
    }).run()
  }

  return { success: true }
})
