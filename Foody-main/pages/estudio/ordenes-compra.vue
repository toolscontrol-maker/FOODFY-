<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudioStore } from '~/stores/useStudioStore'
import type { PurchaseOrder } from '~/types/studio'
import { purchaseOrderStatusLabels, purchaseOrderStatusColors, warehouseUnitLabels } from '~/types/studio'

definePageMeta({ layout: 'dashboard' })

const store = useStudioStore()
const toast = useToast()
await store.fetchAll()

const searchQuery = ref('')
const filterStatus = ref('')

const statusOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Pedido', value: 'ordered' },
  { label: 'Parcial', value: 'partial' },
  { label: 'Recibido', value: 'received' },
  { label: 'Cancelado', value: 'cancelled' },
]

const filteredOrders = computed(() => {
  let list = [...store.purchaseOrders]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(po => po.supplier.toLowerCase().includes(q) || po.id.toLowerCase().includes(q))
  }
  if (filterStatus.value) list = list.filter(po => po.status === filterStatus.value)
  return list
})

const expandedId = ref<string | null>(null)
const toggleExpand = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id
}

const formatEur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

const totalPending = computed(() =>
  store.purchaseOrders.filter(po => po.status === 'ordered' || po.status === 'draft').reduce((s, po) => s + po.totalCost, 0)
)
const totalReceived = computed(() =>
  store.purchaseOrders.filter(po => po.status === 'received').reduce((s, po) => s + po.totalCost, 0)
)

const markAsReceived = async (po: PurchaseOrder) => {
  const now = new Date().toISOString()
  const updated = await store.updatePurchaseOrder(po.id, { status: 'received', receivedDate: now })
  if (updated) {
    toast.add({ title: 'Orden recibida', description: `La orden ${po.id} de ${po.supplier} ha sido marcada como recibida.`, color: 'green' })
    await store.fetchPurchaseOrders()
  }
}

const getStatusColor = (s: string) => (purchaseOrderStatusColors[s as keyof typeof purchaseOrderStatusColors] || 'gray') as any
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-truck" class="w-5 h-5" />
          Órdenes de Compra
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">Pedidos a proveedores para reabastecer el almacén.</p>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="flex-shrink-0 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 grid grid-cols-3 gap-4">
      <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ store.purchaseOrders.length }}</div>
        <div class="text-xs text-gray-500">Total órdenes</div>
      </div>
      <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ formatEur(totalPending) }}</div>
        <div class="text-xs text-blue-600">Pendiente</div>
      </div>
      <div class="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 text-center">
        <div class="text-2xl font-bold text-green-600">{{ formatEur(totalReceived) }}</div>
        <div class="text-xs text-green-600">Recibido</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex-shrink-0 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-wrap items-center gap-3">
      <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Buscar por proveedor o ID…" class="w-64" size="sm" />
      <USelectMenu v-model="filterStatus" :options="statusOptions" value-attribute="value" size="sm" class="w-44" />
      <div class="ml-auto text-xs text-gray-400">{{ filteredOrders.length }} orden{{ filteredOrders.length !== 1 ? 'es' : '' }}</div>
    </div>

    <!-- Orders -->
    <div class="flex-1 overflow-y-auto p-6 space-y-3">
      <div v-if="filteredOrders.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <UIcon name="i-lucide-inbox" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p class="text-sm text-gray-500">No se encontraron órdenes de compra.</p>
        </div>
      </div>

      <UCard
        v-for="po in filteredOrders" :key="po.id"
        :ui="{ body: { padding: 'p-0' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }"
      >
        <!-- Order header (clickable) -->
        <div
          class="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
          @click="toggleExpand(po.id)"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              <UIcon name="i-lucide-truck" class="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-semibold text-sm text-gray-900 dark:text-white">{{ po.supplier }}</h4>
                <UBadge :color="getStatusColor(po.status)" variant="subtle" size="xs">
                  {{ purchaseOrderStatusLabels[po.status as keyof typeof purchaseOrderStatusLabels] || po.status }}
                </UBadge>
              </div>
              <div class="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                <span>{{ po.id }}</span>
                <span>Pedido: {{ formatDate(po.orderDate) }}</span>
                <span v-if="po.expectedDelivery">Entrega: {{ formatDate(po.expectedDelivery) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="font-bold text-gray-900 dark:text-white">{{ formatEur(po.totalCost) }}</div>
              <div class="text-xs text-gray-500">{{ po.items.length }} artículo{{ po.items.length !== 1 ? 's' : '' }}</div>
            </div>

            <div class="flex items-center gap-2">
              <UButton
                v-if="po.status === 'ordered'"
                icon="i-lucide-package-check"
                color="green"
                variant="soft"
                size="xs"
                @click.stop="markAsReceived(po)"
              >Recibir</UButton>
              <UIcon
                :name="expandedId === po.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="w-4 h-4 text-gray-400 transition-transform"
              />
            </div>
          </div>
        </div>

        <!-- Expanded: items table -->
        <Transition name="expand">
          <div v-if="expandedId === po.id" class="border-t border-gray-100 dark:border-gray-800">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="px-5 py-2 text-[11px] font-semibold text-gray-500 uppercase text-left">Artículo</th>
                  <th class="px-4 py-2 text-[11px] font-semibold text-gray-500 uppercase text-right">Cantidad</th>
                  <th class="px-4 py-2 text-[11px] font-semibold text-gray-500 uppercase text-right">Coste/ud</th>
                  <th class="px-4 py-2 text-[11px] font-semibold text-gray-500 uppercase text-right">Subtotal</th>
                  <th class="px-4 py-2 text-[11px] font-semibold text-gray-500 uppercase text-right pr-5">Recibido</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="item in po.items" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/10">
                  <td class="px-5 py-2.5 font-medium text-gray-900 dark:text-white">{{ item.warehouseItemName || 'Desconocido' }}</td>
                  <td class="px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">
                    {{ item.quantity }} {{ warehouseUnitLabels[item.unit as keyof typeof warehouseUnitLabels] || item.unit }}
                  </td>
                  <td class="px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">{{ formatEur(item.unitCost) }}</td>
                  <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{{ formatEur(item.quantity * item.unitCost) }}</td>
                  <td class="px-4 py-2.5 text-right pr-5">
                    <span :class="item.receivedQuantity >= item.quantity ? 'text-green-600' : item.receivedQuantity > 0 ? 'text-yellow-600' : 'text-gray-400'">
                      {{ item.receivedQuantity }} / {{ item.quantity }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="po.notes" class="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <p class="text-xs text-gray-500 flex items-center gap-1.5">
                <UIcon name="i-lucide-message-square" class="w-3.5 h-3.5" />
                {{ po.notes }}
              </p>
            </div>
          </div>
        </Transition>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.expand-enter-to, .expand-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
