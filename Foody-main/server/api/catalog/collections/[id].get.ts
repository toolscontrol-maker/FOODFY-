import { getFullCollection } from '~/server/db/queries'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const collection = await getFullCollection(id)

  if (!collection) {
    throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
  }

  return collection
})
