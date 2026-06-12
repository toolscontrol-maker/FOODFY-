<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold text-gray-900 dark:text-white">Marketing</h3>
    </template>
    <div class="py-12 flex flex-col items-center justify-center text-center">
      <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
        <UIcon name="i-lucide-megaphone" class="w-8 h-8 text-primary" />
      </div>
      <p class="text-lg font-medium text-gray-900 dark:text-white">Campañas de Marketing</p>
      <p class="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Crea compañas para email, SMS y notificaciones push para tus clientes.</p>
      <UButton label="Crear campaña" color="primary" class="mt-6" />
    </div>
  </UCard>
</template>
