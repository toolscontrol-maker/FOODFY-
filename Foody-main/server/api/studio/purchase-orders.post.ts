import { db, schema } from '~/server/db/index'
import { eq } from 'drizzle-orm'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const now = new Date().toISOString()

  const poId = `po-${uid()}`

  await db.insert(schema.purchaseOrders).values({
    id: poId,
    supplier: body.supplier,
    status: body.status ?? 'ordered',
    totalCost: body.totalCost ?? 0,
    orderDate: now,
    expectedDelivery: body.expectedDelivery ?? null,
    receivedDate: null,
    notes: body.notes ?? '',
    createdAt: now,
    updatedAt: now,
  }).run()

  if (Array.isArray(body.items)) {
    for (const item of body.items) {
      await db.insert(schema.purchaseOrderItems).values({
        id: `poi-${uid()}`,
        purchaseOrderId: poId,
        warehouseItemId: item.warehouseItemId ?? '',
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        receivedQuantity: 0,
      }).run()
    }
  }

  const po = await db.select().from(schema.purchaseOrders)
    .where(eq(schema.purchaseOrders.id, poId)).get()

  const items = await db.select().from(schema.purchaseOrderItems)
    .where(eq(schema.purchaseOrderItems.purchaseOrderId, poId)).all()

  return { ...po, items }
})
