import { db, schema } from '~/server/db/index'
import { rawClient } from '~/server/db/index'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const now = new Date().toISOString()

  await db.update(schema.warehouseItems).set({
    ...(body.name != null && { name: body.name }),
    ...(body.category != null && { category: body.category }),
    ...(body.unit != null && { unit: body.unit }),
    ...(body.minimumStock != null && { minimumStock: body.minimumStock }),
    ...(body.costPerUnit != null && { costPerUnit: body.costPerUnit }),
    ...(body.supplier != null && { supplier: body.supplier }),
    ...(body.location != null && { location: body.location }),
    ...(body.branchId != null && { branchId: body.branchId }),
    ...(body.notes != null && { notes: body.notes }),
    updatedAt: now,
  }).where(eq(schema.warehouseItems.id, id)).run()

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
