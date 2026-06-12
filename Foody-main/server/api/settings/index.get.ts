import { db, schema } from '~/server/db/index'

export default defineEventHandler(async () => {
  const rows = await db.select().from(schema.settings).all()
  const result: Record<string, any> = {}
  for (const row of rows) {
    result[row.key] = row.value
  }
  return result
})
