import { db, schema } from '~/server/db/index'
import { rawClient } from '~/server/db/index'
import { eq, sum } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const itemId = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const now = new Date().toISOString()
  const batchId = crypto.randomUUID()

  await db.insert(schema.warehouseBatches).values({
    id: batchId,
    warehouseItemId: itemId,
    quantity: body.quantity ?? 0,
    expiryDate: body.expiryDate ?? null,
    receivedAt: body.receivedAt ?? now,
    costPerUnit: body.costPerUnit ?? 0,
    supplier: body.supplier ?? '',
    notes: body.notes ?? '',
    createdAt: now,
    updatedAt: now,
  }).run()

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
