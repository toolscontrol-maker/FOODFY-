<script setup lang="ts">
import { useOrdersStore } from '~/stores/useOrdersStore'

definePageMeta({ layout: 'dashboard' })

const router = useRouter()
const ordersStore = useOrdersStore()
const { pending } = await useAsyncData('orders', () => ordersStore.fetchOrders())

const q = ref('')
const selected = ref([])
const activeTab = ref(0) // 0: All, 1: Unfulfilled, 2: Unpaid

const filters = ref({
  paymentStatus: [],
  fulfillmentStatus: [],
  deliveryMethod: [],
  dateOption: 'all',
  dateExact: null as Date | null,
  dateRange: { start: new Date(), end: new Date() } as { start: Date, end: Date }
})

const activeFiltersCount = computed(() => {
  let count = filters.value.paymentStatus.length + filters.value.fulfillmentStatus.length + filters.value.deliveryMethod.length
  if (filters.value.dateOption !== 'all') count++
  return count
})

function clearFilters() {
  filters.value = {
    paymentStatus: [],
    fulfillmentStatus: [],
    deliveryMethod: [],
    dateOption: 'all',
    dateExact: null,
    dateRange: { start: new Date(), end: new Date() }
  }
}

const paymentOptions = [
  { label: 'Pagado', value: 'paid' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Reembolsado', value: 'refunded' }
]

const fulfillmentOptions = [
  { label: 'Recibido', value: 'received' },
  { label: 'En cocina', value: 'preparing' },
  { label: 'Listo', value: 'ready' },
  { label: 'En camino', value: 'delivering' },
  { label: 'Entregado', value: 'delivered' },
  { label: 'Cancelado', value: 'cancelled' }
]

const deliveryOptions = [
  { label: 'A domicilio', value: 'delivery' },
  { label: 'Para recoger', value: 'pickup' },
  { label: 'En local', value: 'dine_in' }
]

const tabs = computed(() => {
  const all = ordersStore.orders || []
  return [
    { label: 'Todos', badge: all.length },
    { label: 'Nuevos', badge: all.filter((r: any) => r.fulfillmentStatus === 'received').length },
    { label: 'En cocina', badge: all.filter((r: any) => r.fulfillmentStatus === 'preparing').length },
    { label: 'Listos/En camino', badge: all.filter((r: any) => r.fulfillmentStatus === 'ready' || r.fulfillmentStatus === 'delivering').length }
  ]
})

const columns = [
  { key: 'id', label: 'Pedido', sortable: true },
  { key: 'date', label: 'Fecha' },
  { key: 'customer', label: 'Cliente/Mesa' },
  { key: 'itemsText', label: 'Comanda' },
  { key: 'paymentStatus', label: 'Pago' },
  { key: 'fulfillmentStatus', label: 'Estado' },
  { key: 'total', label: 'Total', sortable: true },
  { key: 'deliveryMethod', label: 'Tipo' }
]

const filteredRows = computed(() => {
  let list = ordersStore.orders

  function parseOrderDate(dateString: string) {
    const now = new Date()
    if (dateString.includes(':') && !dateString.includes('Ayer') && !dateString.includes('feb')) {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...dateString.split(':').map(Number))
    }
    if (dateString.includes('Ayer')) {
      const timeInfo = dateString.split(' ')[1]
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, ...timeInfo.split(':').map(Number))
    }
    if (dateString.includes('feb')) {
      const parts = dateString.split(' ')
      const day = Number(parts[0])
      const timeInfo = parts[2].split(':')
      return new Date(now.getFullYear(), 1, day, ...timeInfo.map(Number))
    }
    return now
  }

  if (filters.value.dateOption === 'exact' && filters.value.dateExact) {
    const filterDate = new Date(filters.value.dateExact)
    list = list.filter((r: any) => {
      const d = parseOrderDate(r.date)
      return d.toDateString() === filterDate.toDateString()
    })
  } else if (filters.value.dateOption === 'range' && filters.value.dateRange?.start && filters.value.dateRange?.end) {
    const start = new Date(filters.value.dateRange.start)
    start.setHours(0, 0, 0, 0)
    const end = new Date(filters.value.dateRange.end)
    end.setHours(23, 59, 59, 999)
    
    list = list.filter((r: any) => {
      const d = parseOrderDate(r.date)
      if (d < start) return false
      if (d > end) return false
      return true
    })
  }

  if (activeTab.value === 1) {
    list = list.filter((r: any) => r.fulfillmentStatus === 'received')
  } else if (activeTab.value === 2) {
    list = list.filter((r: any) => r.fulfillmentStatus === 'preparing')
  } else if (activeTab.value === 3) {
    list = list.filter((r: any) => r.fulfillmentStatus === 'ready' || r.fulfillmentStatus === 'delivering')
  }

  if (filters.value.paymentStatus.length > 0) {
    list = list.filter((r: any) => filters.value.paymentStatus.includes(r.paymentStatus as never))
  }
  if (filters.value.fulfillmentStatus.length > 0) {
    list = list.filter((r: any) => filters.value.fulfillmentStatus.includes(r.fulfillmentStatus as never))
  }
  if (filters.value.deliveryMethod.length > 0) {
    list = list.filter((r: any) => filters.value.deliveryMethod.includes(r.deliveryMethod as never))
  }

  if (!q.value) return list
  return list.filter((row: any) => {
    return Object.values(row).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})

function getPaymentBadgeLabel(status: string) {
  switch (status) {
    case 'paid': return 'Pagado'
    case 'pending': return 'Pendiente'
    case 'refunded': return 'Reembolsado'
    default: return status
  }
}

function getPaymentBadgeColor(status: string) {
  switch (status) {
    case 'paid': return 'gray'
    case 'pending': return 'amber'
    case 'refunded': return 'red'
    default: return 'gray'
  }
}

function getFulfillmentBadgeLabel(status: string) {
  switch (status) {
    case 'received': return 'Recibido'
    case 'preparing': return 'En cocina'
    case 'ready': return 'Listo para recoger'
    case 'delivering': return 'En camino'
    case 'delivered': return 'Entregado'
    case 'cancelled': return 'Cancelado'
    default: return status
  }
}

function getFulfillmentBadgeColor(status: string) {
  switch (status) {
    case 'received': return 'amber'
    case 'preparing': return 'orange'
    case 'ready': return 'blue'
    case 'delivering': return 'indigo'
    case 'delivered': return 'green'
    case 'cancelled': return 'red'
    default: return 'gray'
  }
}

function getDeliveryLabel(method: string) {
  switch (method) {
    case 'delivery': return 'A domicilio'
    case 'pickup': return 'Para recoger'
    case 'dine_in': return 'En local'
    default: return method
  }
}

function getDeliveryBadgeColor(method: string) {
  switch (method) {
    case 'delivery': return 'blue'
    case 'pickup': return 'indigo'
    case 'dine_in': return 'orange'
    default: return 'gray'
  }
}

function getDeliveryIcon(method: string) {
  switch (method) {
    case 'delivery': return 'i-lucide-bike'
    case 'pickup': return 'i-lucide-shopping-bag'
    case 'dine_in': return 'i-lucide-utensils'
    default: return 'i-lucide-package'
  }
}

function onCreateOrder() {
  alert('Aquí se manejará la creación manual de pedidos.')
}

function onRowSelect(row: any) {
  router.push(`/orders/${row.id.replace('#', '')}`)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-package" class="text-gray-900 dark:text-white w-5 h-5" />
          Pedidos
        </h2>
      </div>
      <div class="flex gap-2">
        <UButton color="gray" variant="solid" label="Exportar" icon="i-lucide-download" />
        <UButton color="primary" label="Crear pedido" @click="onCreateOrder" />
      </div>
    </div>

    <UCard :ui="{ body: { padding: 'sm:p-0' } }">
      <div class="border-b border-gray-200 dark:border-gray-800 px-4 pt-4 flex gap-4 overflow-x-auto">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="activeTab = index"
          class="pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap"
          :class="[
            activeTab === index 
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          ]"
        >
          {{ tab.label }}
          <UBadge v-if="tab.badge !== undefined" color="gray" variant="subtle" size="xs" class="flex items-center justify-center min-w-[1.5rem] px-1 pb-0 pt-0 text-[11px] h-5">{{ tab.badge }}</UBadge>
        </button>
      </div>

      <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <div class="flex gap-2 items-center">
          <UInput
            v-model="q"
            icon="i-lucide-search"
            placeholder="Buscar pedidos"
            class="w-64"
          />
          <UPopover :popper="{ placement: 'bottom-start' }" :ui="{ base: 'overflow-visible focus:outline-none flex flex-col' }">
            <UButton color="gray" variant="ghost" icon="i-lucide-filter" label="Filtros">
              <template #trailing v-if="activeFiltersCount > 0">
                <UBadge color="primary" variant="solid" size="xs" :ui="{ rounded: 'rounded-full' }">{{ activeFiltersCount }}</UBadge>
              </template>
            </UButton>

            <template #panel>
              <div class="p-4 w-auto min-w-[340px] space-y-4 max-h-[70vh] overflow-visible">
                <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span class="font-medium text-sm">Filtros</span>
                  <UButton v-if="activeFiltersCount > 0" label="Limpiar" color="gray" variant="ghost" size="xs" @click="clearFilters" />
                </div>
                
                <UFormGroup label="Fecha">
                  <div class="space-y-2">
                    <USelectMenu v-model="filters.dateOption" :options="[
                      { label: 'Cualquier fecha', value: 'all' },
                      { label: 'Fecha exacta', value: 'exact' },
                      { label: 'Rango de fechas', value: 'range' }
                    ]" value-attribute="value" class="w-full" :popper="{ strategy: 'fixed' }" :ui="{ width: 'w-full sm:w-full' }" />
                    
                    <div v-if="filters.dateOption === 'exact'" class="w-full flex justify-center bg-gray-50/50 dark:bg-gray-800/10 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                      <DatePicker v-model="filters.dateExact" mode="date" />
                    </div>
                    
                    <div v-else-if="filters.dateOption === 'range'" class="w-full flex justify-center bg-gray-50/50 dark:bg-gray-800/10 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                      <DatePicker v-model="filters.dateRange" :columns="2" />
                    </div>
                  </div>
                </UFormGroup>

                <UFormGroup label="Estado de pago">
                  <USelectMenu v-model="filters.paymentStatus" :options="paymentOptions" value-attribute="value" multiple placeholder="Todos los pagos" class="w-full" :popper="{ strategy: 'fixed' }" :ui="{ width: 'w-full sm:w-full' }">
                    <template #label>
                      <div v-if="filters.paymentStatus.length" class="flex gap-1 flex-wrap">
                        <UBadge v-for="v in filters.paymentStatus" :key="v" :color="getPaymentBadgeColor(v)" :variant="getPaymentBadgeColor(v) === 'gray' ? 'solid' : 'subtle'" size="xs" class="font-medium whitespace-nowrap">
                          <template v-if="v === 'paid'"><UIcon name="i-lucide-check-circle" class="w-3 h-3 mr-1 align-text-bottom"/></template>
                          <template v-else-if="v === 'pending'"><UIcon name="i-lucide-circle" class="w-3 h-3 mr-1 opacity-50 align-text-bottom"/></template>
                          <template v-else><UIcon name="i-lucide-corner-down-left" class="w-3 h-3 mr-1 align-text-bottom"/></template>
                          {{ getPaymentBadgeLabel(v) }}
                        </UBadge>
                      </div>
                      <span v-else>Todos los pagos</span>
                    </template>
                  </USelectMenu>
                </UFormGroup>
                
                <UFormGroup label="Estado del pedido">
                  <USelectMenu v-model="filters.fulfillmentStatus" :options="fulfillmentOptions" value-attribute="value" multiple placeholder="Todos los estados" class="w-full" :popper="{ strategy: 'fixed' }" :ui="{ width: 'w-full sm:w-full' }">
                    <template #label>
                      <div v-if="filters.fulfillmentStatus.length" class="flex gap-1 flex-wrap">
                        <UBadge v-for="v in filters.fulfillmentStatus" :key="v" :color="getFulfillmentBadgeColor(v)" :variant="getFulfillmentBadgeColor(v) === 'gray' ? 'solid' : 'subtle'" size="xs" class="font-medium whitespace-nowrap">
                          <template v-if="v === 'delivered'"><UIcon name="i-lucide-check-circle" class="w-3 h-3 mr-1 align-text-bottom"/></template>
                          <template v-else-if="v === 'cancelled'"><UIcon name="i-lucide-x-circle" class="w-3 h-3 mr-1 align-text-bottom"/></template>
                          <template v-else-if="v === 'received'"><UIcon name="i-lucide-bell" class="w-3 h-3 mr-1 align-text-bottom"/></template>
                          <template v-else-if="v === 'preparing'"><UIcon name="i-lucide-chef-hat" class="w-3 h-3 mr-1 align-text-bottom"/></template>
                          <template v-else-if="v === 'ready'"><UIcon name="i-lucide-package-check" class="w-3 h-3 mr-1 align-text-bottom"/></template>
                          <template v-else><UIcon name="i-lucide-circle" class="w-3 h-3 mr-1 opacity-50 align-text-bottom"/></template>
                          {{ getFulfillmentBadgeLabel(v) }}
                        </UBadge>
                      </div>
                      <span v-else>Todos los estados</span>
                    </template>
                  </USelectMenu>
                </UFormGroup>
                
                <UFormGroup label="Método de entrega">
                  <USelectMenu v-model="filters.deliveryMethod" :options="deliveryOptions" value-attribute="value" multiple placeholder="Todos los métodos" class="w-full" :popper="{ strategy: 'fixed' }" :ui="{ width: 'w-full sm:w-full' }">
                    <template #label>
                      <div v-if="filters.deliveryMethod.length" class="flex gap-1 flex-wrap">
                        <UBadge v-for="v in filters.deliveryMethod" :key="v" :color="getDeliveryBadgeColor(v)" variant="subtle" size="xs" class="font-medium whitespace-nowrap">
                          <UIcon :name="getDeliveryIcon(v)" class="w-3 h-3 mr-1 align-text-bottom"/>
                          {{ getDeliveryLabel(v) }}
                        </UBadge>
                      </div>
                      <span v-else>Todos los métodos</span>
                    </template>
                  </USelectMenu>
                </UFormGroup>
              </div>
            </template>
          </UPopover>
        </div>
        <UButton v-if="selected.length" color="white" label="Acciones en lote" icon="i-lucide-chevron-down" />
      </div>

      <UTable 
        v-model="selected"
        :columns="columns" 
        :rows="filteredRows" 
        :loading="pending"
        class="w-full cursor-pointer"
        @select="onRowSelect"
      >
        <template #id-data="{ row }">
          <span class="font-medium text-gray-900 dark:text-white">
            {{ row.id }}
          </span>
        </template>
        <template #date-data="{ row }">
          <span class="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">{{ row.date }}</span>
        </template>
        <template #customer-data="{ row }">
          <span class="font-medium text-gray-900 dark:text-white">{{ row.customer }}</span>
        </template>
        <template #paymentStatus-data="{ row }">
          <UBadge :color="getPaymentBadgeColor(row.paymentStatus)" :variant="getPaymentBadgeColor(row.paymentStatus) === 'gray' ? 'solid' : 'subtle'" size="xs" class="font-medium whitespace-nowrap">
            <template v-if="row.paymentStatus === 'paid'"><UIcon name="i-lucide-check-circle" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="row.paymentStatus === 'pending'"><UIcon name="i-lucide-circle" class="w-3 h-3 mr-1 opacity-50 align-text-bottom"/></template>
            <template v-else><UIcon name="i-lucide-corner-down-left" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            {{ getPaymentBadgeLabel(row.paymentStatus) }}
          </UBadge>
        </template>
        <template #fulfillmentStatus-data="{ row }">
          <UBadge :color="getFulfillmentBadgeColor(row.fulfillmentStatus)" :variant="getFulfillmentBadgeColor(row.fulfillmentStatus) === 'gray' ? 'solid' : 'subtle'" size="xs" class="font-medium whitespace-nowrap">
            <template v-if="row.fulfillmentStatus === 'delivered'"><UIcon name="i-lucide-check-circle" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="row.fulfillmentStatus === 'cancelled'"><UIcon name="i-lucide-x-circle" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="row.fulfillmentStatus === 'received'"><UIcon name="i-lucide-bell" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="row.fulfillmentStatus === 'preparing'"><UIcon name="i-lucide-chef-hat" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="row.fulfillmentStatus === 'ready'"><UIcon name="i-lucide-package-check" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else><UIcon name="i-lucide-circle" class="w-3 h-3 mr-1 opacity-50 align-text-bottom"/></template>
            {{ getFulfillmentBadgeLabel(row.fulfillmentStatus) }}
          </UBadge>
        </template>
        <template #itemsText-data="{ row }">
          <span class="text-sm truncate max-w-[200px] inline-block" :title="row.itemsText">{{ row.itemsText }}</span>
        </template>
        <template #total-data="{ row }">
          <span>{{ Number(row.total).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</span>
        </template>
        <template #deliveryMethod-data="{ row }">
          <UBadge :color="getDeliveryBadgeColor(row.deliveryMethod)" variant="subtle" size="xs" class="font-medium whitespace-nowrap">
            <UIcon :name="getDeliveryIcon(row.deliveryMethod)" class="w-3 h-3 mr-1 align-text-bottom"/>
            {{ getDeliveryLabel(row.deliveryMethod) }}
          </UBadge>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
