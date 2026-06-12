import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const activeOrders = computed(() => orders.value.filter((o: any) => o.status !== 'delivered'))

  async function fetchOrders() {
    if (orders.value.length) return orders.value
    const data = await $fetch('/api/orders')
    orders.value = data as any
    return data
  }

  return {
    orders,
    activeOrders,
    fetchOrders
  }
})
