import { getAllCategories } from '~/server/db/queries'

export default defineEventHandler(async () => {
  return await getAllCategories()
})
