<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'
import { useFormGuard } from '~/composables/useFormGuard'

const store = useSettingsStore()
const toast = useToast()

const { form, isDirty, save, discard, showLeaveModal, confirmLeave, cancelLeave } = useFormGuard(
  () => ({
    storeName: store.storeName,
    storeAddress: store.storeAddress,
    storePhone: store.storePhone,
    currency: store.currency,
    currencyFormat: store.currencyFormat,
    backupRegion: store.backupRegion,
    unitSystem: store.unitSystem,
    defaultWeightUnit: store.defaultWeightUnit,
    timezone: store.timezone,
    orderPrefix: store.orderPrefix,
    orderSuffix: store.orderSuffix,
    requireConfirmationStep: store.requireConfirmationStep,
    afterPayment: store.afterPayment,
    autoArchiveOrders: store.autoArchiveOrders,
  }),
  (data) => {
    store.storeName = data.storeName
    store.storeAddress = data.storeAddress
    store.storePhone = data.storePhone
    store.currency = data.currency
    store.currencyFormat = data.currencyFormat
    store.backupRegion = data.backupRegion
    store.unitSystem = data.unitSystem
    store.defaultWeightUnit = data.defaultWeightUnit
    store.timezone = data.timezone
    store.orderPrefix = data.orderPrefix
    store.orderSuffix = data.orderSuffix
    store.requireConfirmationStep = data.requireConfirmationStep
    store.afterPayment = data.afterPayment
    store.autoArchiveOrders = data.autoArchiveOrders
  }
)

const timezoneOptions = [
  '(GMT+00:00) Londres',
  '(GMT+01:00) Madrid',
  '(GMT+01:00) París',
  '(GMT+01:00) Berlín',
  '(GMT+02:00) Atenas',
  '(GMT-05:00) Nueva York',
  '(GMT-06:00) Ciudad de México',
  '(GMT-03:00) Buenos Aires',
]

const unitSystemOptions = ['Métrico', 'Imperial']
const weightUnitOptions = ['kg', 'g', 'lb', 'oz']
const currencyOptions = ['EUR', 'USD', 'GBP', 'MXN', 'ARS', 'COP']

const currencyMenuItems = [
  [
    { label: 'Cambiar moneda de la tienda', icon: 'i-lucide-coins', click: () => { showCurrencyModal.value = true } },
    { label: 'Cambiar formato de la tienda', icon: 'i-lucide-type', click: () => { showFormatModal.value = true } },
  ],
]

const showCurrencyModal = ref(false)
const showFormatModal = ref(false)
const tempCurrency = ref(form.value.currency)
const tempFormat = ref(form.value.currencyFormat)

const formatOptions = ['€1.234,56', '1.234,56 €', '1,234.56 €', '€1,234.56']

const handleSave = () => {
  save()
  toast.add({ title: 'Configuración guardada', description: 'Los ajustes generales se han actualizado correctamente.', color: 'green' })
}

const handleDiscard = () => {
  discard()
  toast.add({ title: 'Cambios descartados', color: 'gray' })
}

const saveCurrency = () => {
  form.value.currency = tempCurrency.value
  showCurrencyModal.value = false
}

const saveFormat = () => {
  form.value.currencyFormat = tempFormat.value
  showFormatModal.value = false
}
</script>

<template>
  <div class="max-w-3xl space-y-6 pb-24">
    <div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">General</h2>
      <p class="text-sm text-gray-500 mt-1">Vista general de la tienda, datos y valores predeterminados.</p>
    </div>

    <!-- Datos de la tienda -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Datos de la tienda</h3>
      </template>
      <div class="space-y-4">
        <UFormGroup label="Nombre de la tienda" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.storeName" placeholder="Mi tienda" />
        </UFormGroup>
        <UFormGroup label="Dirección de la tienda" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.storeAddress" placeholder="Calle, Ciudad, País" />
        </UFormGroup>
        <UFormGroup label="Teléfono" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.storePhone" placeholder="+34 ..." />
        </UFormGroup>
      </div>
    </UCard>

    <!-- Valores predeterminados -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Valores predeterminados de la tienda</h3>
      </template>
      <div class="space-y-5">
        <!-- Currency with 3-dot menu -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Visualización de la moneda</p>
            <p class="text-[12px] text-gray-500 mt-0.5">{{ form.currency }} · {{ form.currencyFormat }}</p>
          </div>
          <UDropdown :items="currencyMenuItems" :popper="{ placement: 'bottom-end' }">
            <UButton icon="i-lucide-more-vertical" color="gray" variant="ghost" size="xs" />
          </UDropdown>
        </div>
        <UDivider />
        <UFormGroup label="Región de copia de seguridad" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.backupRegion" />
        </UFormGroup>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="Sistema de unidades" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
            <USelectMenu v-model="form.unitSystem" :options="unitSystemOptions" />
          </UFormGroup>
          <UFormGroup label="Unidad de peso predeterminada" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
            <USelectMenu v-model="form.defaultWeightUnit" :options="weightUnitOptions" />
          </UFormGroup>
        </div>
        <UFormGroup label="Zona horaria" help="Establece la hora en la que se registran los pedidos y los informes y estadísticas" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <USelectMenu v-model="form.timezone" :options="timezoneOptions" />
        </UFormGroup>
      </div>
    </UCard>

    <!-- Identificadores de pedido -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Identificadores de pedido</h3>
      </template>
      <p class="text-[13px] text-gray-500 mb-4">Se muestra en la página de pedido, las páginas de cliente y las notificaciones de pedido del cliente para identificar el pedido.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormGroup label="Prefijo" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.orderPrefix" placeholder="#" />
        </UFormGroup>
        <UFormGroup label="Sufijo" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.orderSuffix" placeholder="" />
        </UFormGroup>
      </div>
      <p class="text-[12px] text-gray-400 mt-3">El siguiente número de pedido será: <span class="font-semibold text-gray-600 dark:text-gray-300">{{ form.orderPrefix }}{{ store.orderNextNumber }}{{ form.orderSuffix }}</span></p>
    </UCard>

    <!-- Procesamiento de pedidos -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Procesamiento de pedidos</h3>
      </template>
      <div class="space-y-6">
        <!-- While checkout -->
        <div>
          <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-2">Mientras el cliente realiza el pago</p>
          <UCheckbox v-model="form.requireConfirmationStep" label="Requerir un paso de confirmación" :ui="{ label: 'text-[13px] text-gray-700 dark:text-gray-300' }" />
          <p class="text-[12px] text-gray-500 ml-6 mt-1">Los clientes deben revisar los detalles de su pedido antes de comprar.</p>
        </div>

        <UDivider />

        <!-- After payment -->
        <div>
          <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-3">Después de que se ha pagado un pedido</p>
          <URadioGroup
            v-model="form.afterPayment"
            :options="[
              { label: 'Preparar automáticamente las líneas de artículo del pedido', value: 'auto_fulfill_all' },
              { label: 'Preparar automáticamente solo las tarjetas de regalo del pedido', value: 'auto_fulfill_gift_cards' },
              { label: 'No preparar automáticamente ninguna de las líneas de artículo del pedido', value: 'no_auto_fulfill' },
            ]"
            :ui="{ fieldset: 'space-y-3', label: 'text-[13px] text-gray-700 dark:text-gray-300' }"
          />
        </div>

        <UDivider />

        <!-- After fulfilled -->
        <div>
          <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-2">Después de que un pedido se ha preparado y pagado, o cuando todos los artículos se han reembolsado</p>
          <UCheckbox v-model="form.autoArchiveOrders" label="Archivar el pedido automáticamente" :ui="{ label: 'text-[13px] text-gray-700 dark:text-gray-300' }" />
          <p class="text-[12px] text-gray-500 ml-6 mt-1">El pedido se eliminará de tu lista de pedidos abiertos.</p>
        </div>
      </div>
    </UCard>

    <!-- Recursos de la tienda -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Recursos de la tienda</h3>
      </template>
      <div class="space-y-3">
        <NuxtLink to="/settings/metafields" class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <UIcon name="i-lucide-database" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p class="text-[13px] font-medium text-gray-900 dark:text-white">Metacampos</p>
              <p class="text-[12px] text-gray-500">Gestiona los metacampos de tu tienda</p>
            </div>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </NuxtLink>
        <NuxtLink to="/settings/general/brand" class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <UIcon name="i-lucide-palette" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p class="text-[13px] font-medium text-gray-900 dark:text-white">Marca</p>
              <p class="text-[12px] text-gray-500">Logos, colores, eslogan y más</p>
            </div>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </NuxtLink>
      </div>
    </UCard>

    <!-- Sticky Save Bar (only when dirty) -->
    <Transition name="slide-up">
      <div v-if="isDirty" class="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-end gap-3 z-30">
        <UButton color="white" variant="solid" class="font-semibold px-5 border border-gray-300 dark:border-gray-700" @click="handleDiscard">Descartar</UButton>
        <UButton color="black" class="font-semibold px-6" @click="handleSave">Guardar</UButton>
      </div>
    </Transition>

    <!-- Unsaved changes leave modal -->
    <UModal v-model="showLeaveModal" :ui="{ width: 'sm:max-w-md' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Cambios sin guardar</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="cancelLeave" />
          </div>
        </template>
        <div class="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/40">
          <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p class="text-[13px] text-amber-800 dark:text-amber-300">Tienes cambios sin guardar. Si sales ahora, se descartarán todos los cambios realizados.</p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" class="font-medium" @click="cancelLeave">Seguir editando</UButton>
            <UButton color="red" size="sm" class="font-semibold" @click="confirmLeave">Descartar y salir</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Currency Modal -->
    <UModal v-model="showCurrencyModal" :ui="{ width: 'sm:max-w-sm' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Cambiar moneda</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="showCurrencyModal = false" />
          </div>
        </template>
        <UFormGroup label="Moneda de la tienda">
          <USelectMenu v-model="tempCurrency" :options="currencyOptions" />
        </UFormGroup>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" @click="showCurrencyModal = false">Cancelar</UButton>
            <UButton color="black" size="sm" @click="saveCurrency">Guardar</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Format Modal -->
    <UModal v-model="showFormatModal" :ui="{ width: 'sm:max-w-sm' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Cambiar formato</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="showFormatModal = false" />
          </div>
        </template>
        <UFormGroup label="Formato de moneda">
          <USelectMenu v-model="tempFormat" :options="formatOptions" />
        </UFormGroup>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" @click="showFormatModal = false">Cancelar</UButton>
            <UButton color="black" size="sm" @click="saveFormat">Guardar</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
