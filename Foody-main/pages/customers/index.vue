<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">Clientes</h3>
        <UButton color="gray" variant="solid" label="Exportar" icon="i-lucide-download" />
      </div>
    </template>
    <div class="py-8 text-center">
      <UIcon name="i-lucide-users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 font-medium">Gestión de clientes y fidelización</p>
      <p class="text-sm text-gray-400 mt-2">Módulo en construcción.</p>
    </div>
  </UCard>
</template>
