import { db, schema } from '~/server/db/index'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db.select().from(schema.purchaseOrders).orderBy(desc(schema.purchaseOrders.createdAt)).all()

  return Promise.all(rows.map(async (po) => {
    const items = await db.select().from(schema.purchaseOrderItems)
      .where(eq(schema.purchaseOrderItems.purchaseOrderId, po.id)).all()

    const enriched = await Promise.all(items.map(async (item) => {
      const wh = await db.select({ name: schema.warehouseItems.name }).from(schema.warehouseItems)
        .where(eq(schema.warehouseItems.id, item.warehouseItemId)).get()
      return { ...item, warehouseItemName: wh?.name ?? 'Desconocido' }
    }))

    return { ...po, items: enriched }
  }))
})
