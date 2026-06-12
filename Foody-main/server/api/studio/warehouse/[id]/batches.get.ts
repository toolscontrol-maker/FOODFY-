import { db, schema } from '~/server/db/index'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  return db.select()
    .from(schema.warehouseBatches)
    .where(eq(schema.warehouseBatches.warehouseItemId, id))
    .orderBy(asc(schema.warehouseBatches.createdAt))
    .all()
})
