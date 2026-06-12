import { getAllInventoryLevels } from '~/server/db/queries'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let levels = await getAllInventoryLevels()

  if (query.productId && typeof query.productId === 'string') {
    levels = levels.filter(l => l.productId === query.productId)
  }
  if (query.lowStock === 'true') {
    levels = levels.filter(l => l.tracked && l.available <= l.lowStockThreshold && l.available > 0)
  }
  if (query.outOfStock === 'true') {
    levels = levels.filter(l => l.tracked && l.available === 0)
  }

  return levels
})
