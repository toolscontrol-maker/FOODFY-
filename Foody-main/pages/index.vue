<script setup lang="ts">
import { useOrdersStore } from '~/stores/useOrdersStore'

import { AreaChart } from 'vue-chrts'

definePageMeta({ layout: 'dashboard' })

const chartData = [
  { day: 'Mon', revenue: 400 },
  { day: 'Tue', revenue: 600 },
  { day: 'Wed', revenue: 300 },
  { day: 'Thu', revenue: 800 },
  { day: 'Fri', revenue: 500 },
  { day: 'Sat', revenue: 900 },
  { day: 'Sun', revenue: 700 },
]

const chartCategories = {
  revenue: {
    name: 'Revenue',
    color: '#3b82f6'
  }
}

const xFormatter = (i: number) => chartData[i].day

const ordersStore = useOrdersStore()
const { pending } = await useAsyncData('dashboard-orders', () => ordersStore.fetchOrders())

const columns = [
  { key: 'id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
  { key: 'time', label: 'Time' },
]

function getStatusColor(status: string) {
  if (!status) return 'gray'
  switch (status.toLowerCase()) {
    case 'received': return 'amber'
    case 'preparing': return 'blue'
    case 'ready': return 'cyan'
    case 'delivering': return 'orange'
    case 'delivered': return 'green'
    case 'cancelled': return 'red'
    default: return 'gray'
  }
}

function getStatusLabel(status: string) {
  if (!status) return '—'
  switch (status) {
    case 'received': return 'Recibido'
    case 'preparing': return 'En cocina'
    case 'ready': return 'Listo'
    case 'delivering': return 'En camino'
    case 'delivered': return 'Entregado'
    case 'cancelled': return 'Cancelado'
    default: return status
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="mb-2">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
        <UIcon name="i-lucide-radio-tower" class="text-primary-500" />
        Torre de Control
      </h2>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Supervisa el volumen de pedidos, tiempos de cocina y flota de reparto en tiempo real.</p>
    </div>

    <!-- Indicadores Principales (KPIs) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard class="border-l-4 border-l-orange-500 shadow-sm relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <UIcon name="i-lucide-chef-hat" class="w-32 h-32" />
        </div>
        <div class="flex items-center justify-between relative z-10">
          <div>
            <div class="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Pedidos en curso</div>
            <div class="text-5xl font-extrabold font-sans text-gray-900 dark:text-white">12</div>
          </div>
          <div class="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl ring-1 ring-orange-200 dark:ring-orange-800">
            <UIcon name="i-lucide-chef-hat" class="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-medium text-orange-600 dark:text-orange-400">
          <UIcon name="i-lucide-trending-up" class="w-4 h-4 mr-1" />
          <span>Alta demanda en cocina</span>
        </div>
      </UCard>

      <UCard class="border-l-4 border-l-blue-500 shadow-sm relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <UIcon name="i-lucide-timer" class="w-32 h-32" />
        </div>
        <div class="flex items-center justify-between relative z-10">
          <div>
            <div class="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Tiempo de preparación</div>
            <div class="text-5xl font-extrabold font-sans text-gray-900 dark:text-white">
              18<span class="text-2xl text-gray-400 dark:text-gray-500 font-semibold ml-1">min</span>
            </div>
          </div>
          <div class="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl ring-1 ring-blue-200 dark:ring-blue-800">
            <UIcon name="i-lucide-timer" class="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-medium text-green-600 dark:text-green-400">
          <UIcon name="i-lucide-check-circle-2" class="w-4 h-4 mr-1" />
          <span>Flujo óptimo (-2 min vs ayer)</span>
        </div>
      </UCard>

      <UCard class="border-l-4 border-l-green-500 shadow-sm relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <UIcon name="i-lucide-bike" class="w-32 h-32" />
        </div>
        <div class="flex items-center justify-between relative z-10">
          <div>
            <div class="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Repartidores activos</div>
            <div class="text-5xl font-extrabold font-sans text-gray-900 dark:text-white">5</div>
          </div>
          <div class="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl ring-1 ring-green-200 dark:ring-green-800">
            <UIcon name="i-lucide-bike" class="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
          <span>2 despachos en camino</span>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Revenue Chart Mock -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">Ingresos (Últimos 7 Días)</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-download" />
          </div>
        </template>
        <div class="h-64 mt-4 w-full">
          <ClientOnly>
            <AreaChart
              v-if="chartData.length"
              :data="chartData"
              :categories="chartCategories"
              :height="250"
              :xFormatter="xFormatter"
              xLabel="Día"
              yLabel="Ingresos ($)"
            />
          </ClientOnly>
        </div>
      </UCard>

      <!-- Active Orders Summary -->
      <UCard>
        <template #header>
          <h3 class="font-semibold text-gray-900 dark:text-white">Estado de Pedidos</h3>
        </template>
        <div class="space-y-4 pt-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-yellow-400 pt-0 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></span>
              <span class="text-sm font-medium">Pendientes</span>
            </div>
            <span class="text-sm font-semibold tabular-nums">4</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></span>
              <span class="text-sm font-medium">Preparando</span>
            </div>
            <span class="text-sm font-semibold tabular-nums">5</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]"></span>
              <span class="text-sm font-medium">En camino</span>
            </div>
            <span class="text-sm font-semibold tabular-nums">3</span>
          </div>
          <UDivider class="my-2" />
          <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded relative overflow-hidden">
             <span class="text-xs font-semibold uppercase text-gray-500">Total Hoy</span>
             <span class="font-bold text-gray-900 dark:text-white">45</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent orders table -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
            <h3 class="font-semibold text-gray-900 dark:text-white">Últimos pedidos</h3>
            <UButton color="black" variant="soft" size="sm">Ver todos</UButton>
        </div>
      </template>
      <UTable :columns="[
        { key: 'id', label: 'ID Pedido' },
        { key: 'customer', label: 'Cliente' },
        { key: 'total', label: 'Total' },
        { key: 'fulfillmentStatus', label: 'Estado' },
        { key: 'date', label: 'Hora' }
      ]" :rows="ordersStore.orders || []" :loading="pending">
        <template #fulfillmentStatus-data="{ row }">
          <UBadge :color="getStatusColor(row.fulfillmentStatus)" variant="subtle" size="xs" class="font-semibold">
            {{ getStatusLabel(row.fulfillmentStatus) }}
          </UBadge>
        </template>
        <template #total-data="{ row }">
          <span class="font-bold text-gray-900 dark:text-white">{{ Number(row.total).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</span>
        </template>
        <template #id-data="{ row }">
           <span class="font-mono text-xs text-gray-500">{{ row.id }}</span>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
