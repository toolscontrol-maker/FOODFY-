import { db, schema } from '~/server/db/index'
import { rawClient } from '~/server/db/index'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const itemId = getRouterParam(event, 'id')!
  const batchId = getRouterParam(event, 'batchId')!
  const body = await readBody(event)
  const now = new Date().toISOString()

  await db.update(schema.warehouseBatches).set({
    ...(body.quantity != null && { quantity: body.quantity }),
    ...(body.expiryDate !== undefined && { expiryDate: body.expiryDate }),
    ...(body.receivedAt !== undefined && { receivedAt: body.receivedAt }),
    ...(body.costPerUnit != null && { costPerUnit: body.costPerUnit }),
    ...(body.supplier != null && { supplier: body.supplier }),
    ...(body.notes != null && { notes: body.notes }),
    updatedAt: now,
  }).where(eq(schema.warehouseBatches.id, batchId)).run()

  /* Recalculate currentStock */
  const agg = await rawClient.execute({
    sql: 'SELECT COALESCE(SUM(quantity),0) AS total FROM warehouse_batches WHERE warehouse_item_id = ?',
    args: [itemId],
  })
  const total = (agg.rows[0] as any).total ?? 0
  await rawClient.execute({
    sql: 'UPDATE warehouse_items SET current_stock = ?, updated_at = ? WHERE id = ?',
    args: [total, now, itemId],
  })

  return db.select().from(schema.warehouseBatches)
    .where(eq(schema.warehouseBatches.id, batchId)).get()
})
