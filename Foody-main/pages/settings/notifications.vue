<script setup lang="ts">
</script>

<template>
  <div class="max-w-3xl space-y-6 pb-10">
    <div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Notificaciones</h2>
      <p class="text-sm text-gray-500 mt-1">Configura las notificaciones por email, SMS y push de tu tienda.</p>
    </div>
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <div class="text-center py-12">
        <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-4">
          <UIcon name="i-lucide-bell" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-[15px] font-semibold text-gray-900 dark:text-white mb-1">Notificaciones</h3>
        <p class="text-[13px] text-gray-500 max-w-sm mx-auto">Esta sección estará disponible próximamente. Aquí podrás gestionar las plantillas de email, notificaciones de pedidos, envíos y alertas del sistema.</p>
      </div>
    </UCard>
  </div>
</template>
