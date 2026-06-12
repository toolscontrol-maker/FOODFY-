<script setup lang="ts">
import { useProductsStore } from '~/stores/useProductsStore'

definePageMeta({ layout: 'dashboard' })

const productsStore = useProductsStore()
const { pending } = await useAsyncData('products', () => productsStore.fetchProducts())

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' }
]
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold text-gray-900 dark:text-white">Catálogo de Productos</h3>
    </template>
    <UTable :columns="columns" :rows="productsStore.products" :loading="pending">
      <template #price-data="{ row }">
        <span class="font-medium">${{ row.price.toFixed(2) }}</span>
      </template>
    </UTable>
  </UCard>
</template>
