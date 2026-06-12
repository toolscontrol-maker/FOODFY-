<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="font-semibold text-gray-900 dark:text-white">Descuentos</h3>
        <UButton icon="i-lucide-plus" label="Crear código" color="primary" />
      </div>
    </template>
    <div class="py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg text-center mt-4">
      <UIcon name="i-lucide-tag" class="w-10 h-10 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">No hay descuentos activos</p>
      <p class="text-sm text-gray-400 mt-1">Crea promociones para atraer más ventas.</p>
    </div>
  </UCard>
</template>
