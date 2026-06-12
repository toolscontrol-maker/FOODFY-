import { getAllCollections } from '~/server/db/queries'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let collections = await getAllCollections()

  if (query.status && typeof query.status === 'string') {
    collections = collections.filter(c => c.status === query.status)
  }
  if (query.q && typeof query.q === 'string') {
    const q = query.q.toLowerCase()
    collections = collections.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    )
  }

  return collections
})
