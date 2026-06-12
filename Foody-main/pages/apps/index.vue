<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="font-semibold text-gray-900 dark:text-white">Apps e integraciones</h3>
        <UButton icon="i-lucide-search" color="gray" variant="ghost" />
      </div>
    </template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer dark:border-gray-800">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-truck" class="w-8 h-8 text-orange-500" />
          <div>
            <h4 class="font-medium">PedidosYa Delivery</h4>
            <p class="text-xs text-gray-500">Sincroniza el inventario en tiempo real.</p>
          </div>
        </div>
      </div>
      <div class="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer dark:border-gray-800">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-smartphone" class="w-8 h-8 text-green-500" />
          <div>
            <h4 class="font-medium">WhatsApp Notify</h4>
            <p class="text-xs text-gray-500">Envía alertas a tus clientes.</p>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
