import { db, schema } from '~/server/db/index'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const now = new Date().toISOString()

  await db.update(schema.purchaseOrders).set({
    ...(body.status != null && { status: body.status }),
    ...(body.notes != null && { notes: body.notes }),
    ...(body.receivedDate !== undefined && { receivedDate: body.receivedDate }),
    updatedAt: now,
  }).where(eq(schema.purchaseOrders.id, id)).run()

  return db.select().from(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id)).get()
})
