<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'
import { useFormGuard } from '~/composables/useFormGuard'

const store = useSettingsStore()
const toast = useToast()

const { form, isDirty, save, discard, showLeaveModal, confirmLeave, cancelLeave } = useFormGuard(
  () => ({
    checkoutContactMethod: store.checkoutContactMethod,
    checkoutShowTracking: store.checkoutShowTracking,
    checkoutRequireLogin: store.checkoutRequireLogin,
    checkoutCustomerFields: JSON.parse(JSON.stringify(store.checkoutCustomerFields)),
    checkoutMarketingConsent: store.checkoutMarketingConsent,
    checkoutTipsEnabled: store.checkoutTipsEnabled,
    checkoutTipOptions: [...store.checkoutTipOptions],
    checkoutLanguage: store.checkoutLanguage,
    checkoutAddressCollection: store.checkoutAddressCollection,
    checkoutCartLimit: store.checkoutCartLimit,
  }),
  (data) => {
    store.checkoutContactMethod = data.checkoutContactMethod
    store.checkoutShowTracking = data.checkoutShowTracking
    store.checkoutRequireLogin = data.checkoutRequireLogin
    store.checkoutCustomerFields = JSON.parse(JSON.stringify(data.checkoutCustomerFields))
    store.checkoutMarketingConsent = data.checkoutMarketingConsent
    store.checkoutTipsEnabled = data.checkoutTipsEnabled
    store.checkoutTipOptions = [...data.checkoutTipOptions]
    store.checkoutLanguage = data.checkoutLanguage
    store.checkoutAddressCollection = data.checkoutAddressCollection
    store.checkoutCartLimit = data.checkoutCartLimit
  }
)

const contactMethodOptions = [
  { label: 'Número de teléfono o correo electrónico', value: 'phone_or_email' },
  { label: 'Correo electrónico', value: 'email' },
]

const fieldStateOptions = [
  { label: 'No incluir', value: 'hidden' },
  { label: 'Opcional', value: 'optional' },
  { label: 'Obligatorio', value: 'required' },
]

const languageOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Português', value: 'pt' },
  { label: 'Italiano', value: 'it' },
]

const getFieldStateLabel = (state: string) => {
  const opt = fieldStateOptions.find(o => o.value === state)
  return opt ? opt.label : state
}

const getFieldStateColor = (state: string) => {
  switch (state) {
    case 'required': return 'red'
    case 'optional': return 'amber'
    case 'hidden': return 'gray'
    default: return 'gray'
  }
}

const handleSave = () => {
  save()
  toast.add({ title: 'Configuración de pago guardada', description: 'Los ajustes de la pantalla de pago se han actualizado.', color: 'green' })
}

const handleDiscard = () => {
  discard()
  toast.add({ title: 'Cambios descartados', color: 'gray' })
}
</script>

<template>
  <div class="max-w-3xl space-y-6 pb-24">
    <div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Pago (Checkout)</h2>
      <p class="text-sm text-gray-500 mt-1">Configura la experiencia de la pantalla de pago para tus clientes.</p>
    </div>

    <!-- BLOQUE 1: Pantalla de pago -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Pantalla de pago</h3>
      </template>
      <div class="space-y-5">
        <div>
          <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-2">Método de contacto del cliente</p>
          <p class="text-[12px] text-gray-500 mb-3">El método de contacto que los clientes introducen en la pantalla de pago recibirá las notificaciones del pedido y del envío.</p>
          <URadioGroup
            v-model="form.checkoutContactMethod"
            :options="contactMethodOptions"
            :ui="{ fieldset: 'space-y-2', label: 'text-[13px] text-gray-700 dark:text-gray-300' }"
          />
          <p v-if="form.checkoutContactMethod === 'phone_or_email'" class="text-[12px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <UIcon name="i-lucide-info" class="w-3.5 h-3.5" />
            Se requiere una app de SMS para enviar actualizaciones por SMS.
          </p>
        </div>

        <UDivider />

        <div class="flex items-center justify-between">
          <div>
            <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Mostrar enlace de seguimiento</p>
            <p class="text-[12px] text-gray-500 mt-0.5">Muestra un enlace para que los clientes hagan un seguimiento de su pedido.</p>
          </div>
          <UToggle v-model="form.checkoutShowTracking" color="primary" />
        </div>

        <UDivider />

        <div class="flex items-center justify-between">
          <div>
            <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Requerir inicio de sesión</p>
            <p class="text-[12px] text-gray-500 mt-0.5">Requerir que los clientes inicien sesión en su cuenta antes del pago.</p>
          </div>
          <UToggle v-model="form.checkoutRequireLogin" color="primary" />
        </div>
      </div>
    </UCard>

    <!-- BLOQUE 2: Información del cliente -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Información del cliente</h3>
      </template>
      <p class="text-[12px] text-gray-500 mb-4">Elige cuáles son los datos que vas a exigir a tu cliente antes de la compra. Puedes no incluir, hacer opcional, o hacer obligatorio. Cuantos más datos pides, mayor puede ser el porcentaje de pérdida por disuasión.</p>
      <div class="space-y-3">
        <div v-for="field in form.checkoutCustomerFields" :key="field.key" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
          <span class="text-[13px] font-medium text-gray-700 dark:text-gray-300">{{ field.label }}</span>
          <div class="flex items-center gap-2">
            <UBadge :color="getFieldStateColor(field.state)" variant="soft" size="xs" class="font-medium">{{ getFieldStateLabel(field.state) }}</UBadge>
            <USelectMenu
              v-model="field.state"
              :options="fieldStateOptions"
              value-attribute="value"
              size="xs"
              class="w-32"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- BLOQUE 3: Opciones de marketing -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Opciones de marketing</h3>
      </template>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Consentimiento de marketing</p>
          <p class="text-[12px] text-gray-500 mt-0.5">Mostrar opción a los clientes para recibir comunicaciones de marketing durante el checkout.</p>
        </div>
        <UToggle v-model="form.checkoutMarketingConsent" color="primary" />
      </div>
    </UCard>

    <!-- BLOQUE 4: Propinas -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Propinas</h3>
          <UToggle v-model="form.checkoutTipsEnabled" color="primary" />
        </div>
      </template>
      <div v-if="form.checkoutTipsEnabled" class="space-y-4">
        <p class="text-[12px] text-gray-500">Los clientes pueden elegir entre 3 opciones predefinidas o introducir una cantidad personalizada.</p>
        <div class="grid grid-cols-3 gap-3">
          <UFormGroup v-for="(tip, idx) in form.checkoutTipOptions" :key="idx" :label="`Opción ${idx + 1}`" :ui="{ label: { text: 'text-[12px] font-medium text-gray-500' } }">
            <UInput
              :model-value="tip"
              @update:model-value="(val: any) => form.checkoutTipOptions[idx] = Number(val)"
              type="number"
              trailing-icon="i-lucide-percent"
              size="sm"
            />
          </UFormGroup>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 flex items-center gap-2 text-[12px] text-gray-500">
          <UIcon name="i-lucide-info" class="w-3.5 h-3.5 flex-shrink-0" />
          Además de estas opciones, el cliente podrá introducir una cantidad personalizada.
        </div>
      </div>
      <div v-else class="text-[13px] text-gray-500">
        Las propinas están desactivadas. Los clientes no verán la opción de dejar propina.
      </div>
    </UCard>

    <!-- BLOQUE 5: Idioma -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Idioma de la pantalla de pago</h3>
      </template>
      <USelectMenu v-model="form.checkoutLanguage" :options="languageOptions" value-attribute="value" />
    </UCard>

    <!-- BLOQUE 6: Preferencias avanzadas -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Preferencias avanzadas</h3>
      </template>
      <div class="space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Recopilación de direcciones</p>
            <p class="text-[12px] text-gray-500 mt-0.5">Activar la recopilación de direcciones de envío en el checkout.</p>
          </div>
          <UToggle v-model="form.checkoutAddressCollection" color="primary" />
        </div>

        <UDivider />

        <div>
          <div class="flex items-center gap-2 mb-2">
            <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Límite de agregar al carrito</p>
            <UBadge color="amber" variant="soft" size="xs" class="font-medium">Recomendado</UBadge>
          </div>
          <p class="text-[12px] text-gray-500 mb-3">Número máximo de artículos que un cliente puede agregar al carrito.</p>
          <UInput v-model.number="form.checkoutCartLimit" type="number" class="w-32" />
        </div>
      </div>
    </UCard>

    <!-- BLOQUE 7: Reglas de pago -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Reglas de pago</h3>
      </template>
      <div class="text-center py-6">
        <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-3">
          <UIcon name="i-lucide-scale" class="w-6 h-6 text-gray-400" />
        </div>
        <p class="text-[13px] text-gray-500">No hay reglas de pago configuradas.</p>
        <UButton color="gray" variant="soft" size="sm" class="mt-3 font-medium">
          <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" />
          Crear regla
        </UButton>
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
  </div>
</template>
