<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto w-full">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Transferencias</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Mueve el inventario entre tus diferentes ubicaciones.</p>
      </div>
      <UButton color="black" icon="i-lucide-plus">Crear transferencia</UButton>
    </div>
    
    <UCard :ui="{ shadow: 'shadow-sm', rounded: 'rounded-xl' }" class="border border-gray-200 dark:border-gray-800">
      <div class="text-center py-16 px-4">
        <div class="bg-gray-50 dark:bg-gray-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-lucide-arrow-right-left" class="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Aún no hay transferencias</h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
          Transfiere productos o variaciones de una sucursal o almacén central hacia otros puntos de venta de forma controlada.
        </p>
        <UButton color="black" size="lg">Crear transferencia</UButton>
      </div>
    </UCard>
  </div>
</template>
