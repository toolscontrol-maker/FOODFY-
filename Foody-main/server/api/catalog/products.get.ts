import { getAllProducts } from '~/server/db/queries'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let products = await getAllProducts()

  if (query.status && typeof query.status === 'string') {
    products = products.filter(p => p.status === query.status)
  }
  if (query.categoryId && typeof query.categoryId === 'string') {
    products = products.filter(p => p.categoryId === query.categoryId)
  }
  if (query.q && typeof query.q === 'string') {
    const q = query.q.toLowerCase()
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  return products
})
