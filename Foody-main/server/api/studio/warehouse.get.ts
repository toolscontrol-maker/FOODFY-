import { rawClient } from '~/server/db/index'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const rows = await rawClient.execute(`
    SELECT
      wi.*,
      COALESCE(b.batch_count, 0)    AS batch_count,
      b.nearest_expiry               AS nearest_expiry_date
    FROM warehouse_items wi
    LEFT JOIN (
      SELECT
        warehouse_item_id,
        COUNT(*)                          AS batch_count,
        MIN(CASE WHEN expiry_date IS NOT NULL AND expiry_date >= date('now') THEN expiry_date
                 WHEN expiry_date IS NOT NULL AND expiry_date < date('now')  THEN expiry_date
                 ELSE NULL END)           AS nearest_expiry
      FROM warehouse_batches
      GROUP BY warehouse_item_id
    ) b ON b.warehouse_item_id = wi.id
    ORDER BY wi.name ASC
  `)

  let items = rows.rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    unit: r.unit,
    currentStock: r.current_stock,
    committedStock: r.committed_stock,
    minimumStock: r.minimum_stock,
    costPerUnit: r.cost_per_unit,
    supplier: r.supplier,
    location: r.location ?? '',
    branchId: r.branch_id ?? '',
    notes: r.notes ?? '',
    batchCount: r.batch_count ?? 0,
    nearestExpiryDate: r.nearest_expiry_date ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))

  if (query.category && typeof query.category === 'string') {
    items = items.filter((i: any) => i.category === query.category)
  }
  if (query.q && typeof query.q === 'string') {
    const q = query.q.toLowerCase()
    items = items.filter((i: any) => i.name.toLowerCase().includes(q) || i.supplier.toLowerCase().includes(q))
  }

  return items
})
