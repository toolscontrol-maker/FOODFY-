import { getFullProduct } from '~/server/db/queries'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const product = await getFullProduct(id)

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return product
})
