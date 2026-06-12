import { db, schema } from '~/server/db/index'
import { rawClient } from '~/server/db/index'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const batchId = crypto.randomUUID()

  const batchQty: number = body.batch?.quantity ?? body.currentStock ?? 0

  await db.insert(schema.warehouseItems).values({
    id,
    name: body.name ?? 'Nuevo artículo',
    category: body.category ?? 'otros',
    unit: body.unit ?? 'kg',
    currentStock: batchQty,
    committedStock: 0,
    minimumStock: body.minimumStock ?? 0,
    costPerUnit: body.batch?.costPerUnit ?? body.costPerUnit ?? 0,
    supplier: body.batch?.supplier ?? body.supplier ?? '',
    expiryDate: body.batch?.expiryDate ?? null,
    location: body.location ?? '',
    branchId: body.branchId ?? '',
    notes: body.notes ?? '',
    createdAt: now,
    updatedAt: now,
  }).run()

  await db.insert(schema.warehouseBatches).values({
    id: batchId,
    warehouseItemId: id,
    quantity: batchQty,
    expiryDate: body.batch?.expiryDate ?? null,
    receivedAt: body.batch?.receivedAt ?? now,
    costPerUnit: body.batch?.costPerUnit ?? body.costPerUnit ?? 0,
    supplier: body.batch?.supplier ?? body.supplier ?? '',
    notes: body.batch?.notes ?? '',
    createdAt: now,
    updatedAt: now,
  }).run()

  const row = await rawClient.execute({
    sql: `SELECT wi.*, COALESCE(b.cnt,0) AS batch_count, b.nexp AS nearest_expiry_date
          FROM warehouse_items wi
          LEFT JOIN (
            SELECT warehouse_item_id, COUNT(*) cnt,
                   MIN(CASE WHEN expiry_date IS NOT NULL THEN expiry_date ELSE NULL END) nexp
            FROM warehouse_batches WHERE warehouse_item_id = ?
            GROUP BY warehouse_item_id
          ) b ON b.warehouse_item_id = wi.id
          WHERE wi.id = ?`,
    args: [id, id],
  })

  const r = row.rows[0] as any
  return {
    id: r.id, name: r.name, category: r.category, unit: r.unit,
    currentStock: r.current_stock, committedStock: r.committed_stock,
    minimumStock: r.minimum_stock, costPerUnit: r.cost_per_unit,
    supplier: r.supplier, location: r.location ?? '', branchId: r.branch_id ?? '',
    notes: r.notes ?? '', batchCount: r.batch_count ?? 0,
    nearestExpiryDate: r.nearest_expiry_date ?? null,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
})
