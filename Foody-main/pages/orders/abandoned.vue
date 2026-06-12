<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { data: checkouts, pending } = await useAsyncData('abandoned_checkouts', () => $fetch('/api/abandoned_checkouts'))

const q = ref('')
const selected = ref([])

const columns = [
  { key: 'id', label: 'Pago' },
  { key: 'date', label: 'Fecha' },
  { key: 'customer', label: 'Colocados por' },
  { key: 'emailStatus', label: 'Estado del correo electrónico' },
  { key: 'recoveryStatus', label: 'Estado de recuperación' },
  { key: 'total', label: 'Total' }
]

const filteredRows = computed(() => {
  let list = checkouts.value || []

  if (!q.value) return list
  return list.filter((row: any) => {
    return Object.values(row).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})

function getEmailStatusLabel(status: string) {
  switch (status) {
    case 'sent': return 'Enviado'
    case 'not_sent': return 'No enviado'
    default: return status
  }
}

function getEmailStatusColor(status: string) {
  switch (status) {
    case 'sent': return 'gray'
    case 'not_sent': return 'gray'
    default: return 'gray'
  }
}

function getRecoveryStatusLabel(status: string) {
  switch (status) {
    case 'recovered': return 'Recuperado'
    case 'not_recovered': return 'No recuperado'
    default: return status
  }
}

function getRecoveryStatusColor(status: string) {
  switch (status) {
    case 'recovered': return 'primary'
    case 'not_recovered': return 'gray' // simple un-highlighted state
    default: return 'gray'
  }
}

function sendEmailRecuperation() {
  alert('Se enviará un correo de recuperación para los carritos seleccionados.')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Pedidos abandonados</h1>
      </div>
      <div class="flex gap-2">
        <UButton color="gray" variant="solid" label="Exportar" icon="i-lucide-download" />
      </div>
    </div>

    <!-- Description Alert matching image -->
    <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 text-blue-800 dark:text-blue-300 items-start">
      <UIcon name="i-lucide-info" class="w-5 h-5 shrink-0 mt-0.5" />
      <div class="text-sm">
        Aquí se mostrarán los pedidos abandonados cuando los clientes agregan un artículo a su carrito pero no completan el pago. También puedes enviarles por correo electrónico un enlace a su carrito.
      </div>
    </div>

    <UCard :ui="{ body: { padding: 'sm:p-0' } }">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <div class="flex gap-2 items-center">
          <UInput
            v-model="q"
            icon="i-lucide-search"
            placeholder="Buscar carritos abandonados"
            class="w-72"
          />
          <UButton color="gray" variant="ghost" icon="i-lucide-filter" label="Filtros" />
        </div>
        <UButton 
          v-if="selected.length" 
          color="white" 
          label="Enviar por correo electrónico a los clientes" 
          icon="i-lucide-mail"
          @click="sendEmailRecuperation"
        />
      </div>

      <UTable 
        v-model="selected"
        :columns="columns" 
        :rows="filteredRows" 
        :loading="pending"
        class="w-full"
      >
        <template #id-data="{ row }">
          <span class="font-medium text-gray-900 dark:text-white">{{ row.id }}</span>
        </template>
        <template #date-data="{ row }">
          <span class="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">{{ row.date }}</span>
        </template>
        <template #customer-data="{ row }">
          <span class="font-medium text-gray-900 dark:text-white">{{ row.customer }}</span>
        </template>
        <template #emailStatus-data="{ row }">
          <UBadge :color="getEmailStatusColor(row.emailStatus)" :variant="row.emailStatus === 'sent' ? 'subtle' : 'solid'" size="xs" class="font-medium whitespace-nowrap">
            <template v-if="row.emailStatus === 'sent'"><UIcon name="i-lucide-check" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="row.emailStatus === 'not_sent'"><UIcon name="i-lucide-minus" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            {{ getEmailStatusLabel(row.emailStatus) }}
          </UBadge>
        </template>
        <template #recoveryStatus-data="{ row }">
          <UBadge :color="getRecoveryStatusColor(row.recoveryStatus)" :variant="row.recoveryStatus === 'recovered' ? 'subtle' : 'solid'" size="xs" class="font-medium whitespace-nowrap">
            <template v-if="row.recoveryStatus === 'recovered'"><UIcon name="i-lucide-check-circle-2" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            <template v-else-if="row.recoveryStatus === 'not_recovered'"><UIcon name="i-lucide-minus" class="w-3 h-3 mr-1 align-text-bottom"/></template>
            {{ getRecoveryStatusLabel(row.recoveryStatus) }}
          </UBadge>
        </template>
        <template #total-data="{ row }">
          <span>{{ Number(row.total).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</span>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
