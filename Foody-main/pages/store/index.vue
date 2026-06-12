<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h3 class="font-semibold text-gray-900 dark:text-white">Diseño del menú online</h3>
      </template>
      <div class="flex items-start gap-4 p-4 text-left">
        <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0">
          <UIcon name="i-lucide-palette" class="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </div>
        <div>
          <h4 class="font-medium text-gray-900 dark:text-white">Tema de la tienda</h4>
          <p class="text-sm text-gray-500 mt-1">Personaliza colores, logo, e imágenes de cabecera.</p>
          <UButton size="sm" color="gray" variant="outline" label="Personalizar" class="mt-3" />
        </div>
      </div>
    </UCard>
  </div>
</template>
