import { db, schema } from '~/server/db/index'
import { rawClient } from '~/server/db/index'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const itemId = getRouterParam(event, 'id')!
  const batchId = getRouterParam(event, 'batchId')!
  const now = new Date().toISOString()

  await db.delete(schema.warehouseBatches)
    .where(eq(schema.warehouseBatches.id, batchId)).run()

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

  return { ok: true, newStock: total }
})
