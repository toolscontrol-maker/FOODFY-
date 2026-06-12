<script setup lang="ts">
import { useOrdersStore } from '~/stores/useOrdersStore'

definePageMeta({
  layout: 'dashboard'
})

const store = useOrdersStore()
const route = useRoute()
const router = useRouter()
const id = route.params.id
const orderId = `#${id}`
const toast = useToast()

const { pending } = await useAsyncData('orders', () => store.fetchOrders())

const originalOrder = computed(() => store.orders.find((o: any) => o.id === orderId))
const order = ref<any>(null)

watch(originalOrder, (newVal) => {
  if (newVal) {
    order.value = JSON.parse(JSON.stringify(newVal))
  }
}, { immediate: true })

const goBack = () => {
  router.push('/orders')
}

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

const currentIndex = computed(() => {
  return store.orders.findIndex((o: any) => o.id === orderId)
})

const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < store.orders.length - 1 && currentIndex.value !== -1)

const goToPrevious = () => {
  if (hasPrevious.value) {
    const prevId = store.orders[currentIndex.value - 1].id.replace('#', '')
    router.push(`/orders/${prevId}`)
  }
}

const goToNext = () => {
  if (hasNext.value) {
    const nextId = store.orders[currentIndex.value + 1].id.replace('#', '')
    router.push(`/orders/${nextId}`)
  }
}

const handleSave = () => {
  const index = store.orders.findIndex((o: any) => o.id === orderId)
  if (index !== -1) {
    store.orders[index] = { ...order.value }
  }
  toast.add({
    title: 'Pedido guardado',
    description: `El pedido ${order.value.id} ha sido actualizado correctamente.`,
    color: 'green'
  })
}

const printTicket = () => {
  toast.add({ title: 'Imprimiendo', description: 'El ticket se está enviando a la impresora...' })
}

const moreActions = [
  [{ label: 'Imprimir ticket', icon: 'i-lucide-printer', click: printTicket }],
  [{ label: 'Cancelar pedido', icon: 'i-lucide-x-circle', color: 'red' }]
]

const paymentOptions = [
  { label: 'Pagado', value: 'paid' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Reembolsado', value: 'refunded' }
]

const fulfillmentOptions = [
  { label: 'Recibido', value: 'received' },
  { label: 'En cocina', value: 'preparing' },
  { label: 'Listo para recoger', value: 'ready' },
  { label: 'En camino', value: 'delivering' },
  { label: 'Entregado', value: 'delivered' },
  { label: 'Cancelado', value: 'cancelled' }
]

const parsedItems = computed(() => {
  if (!order.value?.itemsText) return []
  return order.value.itemsText.split(', ').map((i: string) => {
    const match = i.trim().match(/^(\d+)x\s*(.*)$/)
    if (match) {
      return { quantity: parseInt(match[1]), name: match[2] }
    }
    return { quantity: 1, name: i.trim() }
  })
})
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden relative">
    <!-- Sticky Top Header -->
    <div class="sticky top-0 z-20 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 pb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-arrow-left"
          color="gray"
          variant="ghost"
          size="sm"
          @click="goBack"
        />
        <div class="flex items-center gap-2 text-[14px]" v-if="order">
          <span class="font-bold text-gray-900 dark:text-white">{{ order.id }}</span>
          <span class="text-gray-500 text-[13px] border-l border-gray-300 dark:border-gray-700 pl-2 h-4 flex items-center">{{ order.date }}</span>
          
          <UBadge :color="getPaymentBadgeColor(order.paymentStatus)" :variant="getPaymentBadgeColor(order.paymentStatus) === 'gray' ? 'solid' : 'subtle'" size="xs" class="font-medium whitespace-nowrap ml-2 hidden sm:inline-flex">
            <template v-if="order.paymentStatus === 'paid'"><UIcon name="i-lucide-check-circle" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="order.paymentStatus === 'pending'"><UIcon name="i-lucide-circle" class="w-3 h-3 mr-1 opacity-50 align-text-bottom"/></template>
            <template v-else><UIcon name="i-lucide-corner-down-left" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            {{ getPaymentBadgeLabel(order.paymentStatus) }}
          </UBadge>

          <UBadge :color="getFulfillmentBadgeColor(order.fulfillmentStatus)" :variant="getFulfillmentBadgeColor(order.fulfillmentStatus) === 'gray' ? 'solid' : 'subtle'" size="xs" class="font-medium whitespace-nowrap hidden sm:inline-flex">
            <template v-if="order.fulfillmentStatus === 'delivered'"><UIcon name="i-lucide-check-circle" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="order.fulfillmentStatus === 'cancelled'"><UIcon name="i-lucide-x-circle" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="order.fulfillmentStatus === 'received'"><UIcon name="i-lucide-bell" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="order.fulfillmentStatus === 'preparing'"><UIcon name="i-lucide-chef-hat" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="order.fulfillmentStatus === 'ready'"><UIcon name="i-lucide-package-check" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else><UIcon name="i-lucide-circle" class="w-3 h-3 mr-1 opacity-50 align-text-bottom"/></template>
            {{ getFulfillmentBadgeLabel(order.fulfillmentStatus) }}
          </UBadge>
        </div>
        <div v-else class="text-[14px] font-bold text-gray-900 dark:text-white">Cargando...</div>
      </div>
      
      <div class="flex items-center gap-2">
        <template v-if="order">
          <UButton color="gray" variant="soft" size="sm" class="font-semibold text-gray-700 dark:text-gray-300">Reembolsar</UButton>
          <UDropdown :items="moreActions">
            <UButton color="gray" variant="soft" size="sm" trailing-icon="i-lucide-chevron-down" class="font-semibold text-gray-700 dark:text-gray-300">Más</UButton>
          </UDropdown>
          <div class="flex items-center gap-1 border-l border-gray-200 dark:border-gray-800 ml-1 pl-1">
            <UButton icon="i-lucide-chevron-up" color="gray" variant="ghost" size="xs" :disabled="!hasPrevious" @click="goToPrevious" />
            <UButton icon="i-lucide-chevron-down" color="gray" variant="ghost" size="xs" :disabled="!hasNext" @click="goToNext" />
          </div>
        </template>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 scroll-smooth">
      <div v-if="pending && !order" class="max-w-7xl mx-auto flex justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-gray-400" />
      </div>
      <div v-else-if="order" class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 pb-20">
        
        <!-- Left Column (Main Content) -->
        <div class="flex-1 flex flex-col gap-5">
          
          <!-- Items Card -->
          <UCard :ui="{ body: { padding: 'p-0' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
             <template #header>
               <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Detalles de la comanda</h3>
             </template>
             <div class="divide-y divide-gray-100 dark:divide-gray-800">
               <div v-for="(item, idx) in parsedItems" :key="idx" class="p-4 sm:p-5 flex gap-4 items-start hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                  <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                    <UIcon name="i-lucide-image" class="w-5 h-5 text-gray-400" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                      <h4 class="text-[14px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{{ item.name }}</h4>
                      <div class="text-[14px] font-medium text-gray-900 dark:text-white">{{ Number((order.total / parsedItems.length) * 0.8).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</div>
                    </div>
                    <div class="text-[13px] text-gray-500 mt-1">
                      {{ Number((order.total / parsedItems.length) * 0.8).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }} x {{ item.quantity }}
                    </div>
                  </div>
                  <div class="font-medium text-gray-900 dark:text-white text-[14px] shrink-0 text-right w-20">
                    {{ Number(((order.total / parsedItems.length) * 0.8) * item.quantity).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}
                  </div>
               </div>
             </div>
             <div class="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 rounded-b-xl">
               <div class="space-y-2 text-[13px]">
                 <div class="flex justify-between text-gray-600 dark:text-gray-400">
                   <span>Subtotal</span>
                   <span>{{ Number(order.total * 0.8).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</span>
                 </div>
                 <div class="flex justify-between text-gray-600 dark:text-gray-400">
                   <span>Impuestos (21%)</span>
                   <span>{{ Number(order.total * 0.2).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</span>
                 </div>
                 <div class="flex justify-between font-bold text-[15px] pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                   <span>Total</span>
                   <span>{{ Number(order.total).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</span>
                 </div>
               </div>
             </div>
          </UCard>

          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
             <template #header>
               <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Pago</h3>
             </template>
             <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div class="flex items-center gap-3">
                  <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-gray-500" />
                  <div>
                    <div class="text-[14px] font-medium text-gray-900 dark:text-white">{{ getPaymentBadgeLabel(order.paymentStatus) }}</div>
                    <div class="text-[12px] text-gray-500">Mastercard terminada en 4242</div>
                  </div>
                </div>
                <div class="font-bold text-[14px]">{{ Number(order.total).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</div>
             </div>
          </UCard>

        </div>

        <!-- Right Column (Sidebar) -->
        <div class="w-full lg:w-[320px] flex flex-col gap-5">
          
          <!-- Actions Card -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Estado del pedido</h3>
            </template>
            <div class="space-y-4">
               <UFormGroup label="Realización" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1' } }">
                 <USelectMenu v-model="order.fulfillmentStatus" :options="fulfillmentOptions" value-attribute="value" size="sm" color="gray" />
               </UFormGroup>
               <UFormGroup label="Estado del pago" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1' } }">
                 <USelectMenu v-model="order.paymentStatus" :options="paymentOptions" value-attribute="value" size="sm" color="gray" />
               </UFormGroup>
            </div>
          </UCard>

          <!-- Customer Card -->
          <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Cliente</h3>
                <UButton icon="i-lucide-pencil" color="gray" variant="ghost" size="xs" />
              </div>
            </template>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <UAvatar :alt="order.customer" size="md" />
                <div>
                  <div class="text-[14px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{{ order.customer }}</div>
                  <div class="text-[12px] text-gray-500">1 pedido</div>
                </div>
              </div>
              
              <div class="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2 text-[13px]">
                <h4 class="font-bold text-gray-900 dark:text-white mb-1">Información de contacto</h4>
                <div class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">cliente@ejemplo.com</div>
                <div class="text-gray-600 dark:text-gray-400">+34 600 00 00 00</div>
              </div>
              
              <div class="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2 text-[13px]">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900 dark:text-white">Dirección de entrega</h4>
                  <UBadge :color="getDeliveryBadgeColor(order.deliveryMethod)" variant="subtle" size="xs">
                    <UIcon :name="getDeliveryIcon(order.deliveryMethod)" class="w-3 h-3 mr-1 align-text-bottom"/>
                    {{ getDeliveryLabel(order.deliveryMethod) }}
                  </UBadge>
                </div>
                <div class="text-gray-600 dark:text-gray-400" v-if="order.deliveryMethod === 'delivery'">
                  Calle Principal 123, 2ºB<br>
                  28001 Madrid<br>
                  España
                </div>
                <div class="text-gray-600 dark:text-gray-400" v-else>
                  El cliente recogerá el pedido o comerá en el local.
                </div>
              </div>
            </div>
          </UCard>
          
        </div>

      </div>
    </div>

    <!-- Sticky Bottom Footer for Saving -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 backdrop-blur-md flex justify-end gap-3 z-30" v-if="order">
       <UButton color="white" variant="solid" class="font-bold px-6 border border-gray-300 dark:border-gray-700" @click="goBack">Volver</UButton>
       <UButton color="black" class="font-bold px-8" @click="handleSave">Guardar cambios</UButton>
    </div>
  </div>
</template>
