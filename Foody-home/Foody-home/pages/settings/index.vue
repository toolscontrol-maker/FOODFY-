<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <h2 class="text-2xl font-bold tracking-tight px-1">Configuración</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-1 space-y-1">
        <UButton color="gray" variant="ghost" class="w-full justify-start" label="General" icon="i-lucide-settings" />
        <UButton color="gray" variant="ghost" class="w-full justify-start" label="Sucursales" icon="i-lucide-map-pin" />
        <UButton color="gray" variant="ghost" class="w-full justify-start" label="Pagos" icon="i-lucide-credit-card" />
        <UButton color="gray" variant="ghost" class="w-full justify-start" label="Facturación" icon="i-lucide-receipt" />
      </div>
      <div class="md:col-span-2">
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 dark:text-white">Detalles del local</h3>
          </template>
          <form class="space-y-4">
            <UFormGroup label="Nombre del local">
              <UInput model-value="La Buena Mesa" />
            </UFormGroup>
            <UFormGroup label="Teléfono">
              <UInput type="tel" model-value="+54 9 11 1234-5678" />
            </UFormGroup>
            <UFormGroup label="Moneda de la tienda">
              <USelect :options="['ARS - Peso Argentino', 'USD - Dólar', 'EUR - Euro']" model-value="USD - Dólar" />
            </UFormGroup>
            <div class="flex justify-end pt-2">
              <UButton label="Guardar" color="primary" />
            </div>
          </form>
        </UCard>
      </div>
    </div>
  </div>
</template>
