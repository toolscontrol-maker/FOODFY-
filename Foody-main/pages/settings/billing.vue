<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'
import { useFormGuard } from '~/composables/useFormGuard'

const store = useSettingsStore()
const toast = useToast()

const { form, isDirty, save, discard, showLeaveModal, confirmLeave, cancelLeave } = useFormGuard(
  () => ({
    taxId: store.taxId,
    billingCurrency: store.billingCurrency,
    paymentMethods: JSON.parse(JSON.stringify(store.paymentMethods)),
  }),
  (data) => {
    store.taxId = data.taxId
    store.billingCurrency = data.billingCurrency
    store.paymentMethods = JSON.parse(JSON.stringify(data.paymentMethods))
  }
)

const showAddCardModal = ref(false)
const showCurrencyModal = ref(false)

const newCard = ref({ type: 'Visa', number: '', expiry: '', cvc: '', isDefault: false })

const cardTypeOptions = ['Visa', 'Mastercard', 'American Express']

const handleAddCard = () => {
  if (!newCard.value.number || !newCard.value.expiry) {
    toast.add({ title: 'Error', description: 'Completa todos los campos de la tarjeta.', color: 'red' })
    return
  }
  const last4 = newCard.value.number.slice(-4)
  if (newCard.value.isDefault || form.value.paymentMethods.length === 0) {
    form.value.paymentMethods.forEach((m: any) => (m.isDefault = false))
  }
  form.value.paymentMethods.push({
    id: Date.now(),
    type: newCard.value.type,
    last4,
    expiry: newCard.value.expiry,
    isDefault: newCard.value.isDefault || form.value.paymentMethods.length === 0,
  })
  newCard.value = { type: 'Visa', number: '', expiry: '', cvc: '', isDefault: false }
  showAddCardModal.value = false
}

const handleRemoveCard = (id: number) => {
  form.value.paymentMethods = form.value.paymentMethods.filter((m: any) => m.id !== id)
}

const currencyOptions = ['EUR', 'USD', 'GBP', 'MXN', 'ARS', 'COP']
const tempBillingCurrency = ref(form.value.billingCurrency)

const saveBillingCurrency = () => {
  form.value.billingCurrency = tempBillingCurrency.value
  showCurrencyModal.value = false
}

const handleSave = () => {
  save()
  toast.add({ title: 'Facturación guardada', description: 'Los ajustes de facturación se han actualizado.', color: 'green' })
}

const handleDiscard = () => {
  discard()
  toast.add({ title: 'Cambios descartados', color: 'gray' })
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-3xl space-y-6 pb-10">
    <div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Facturación</h2>
      <p class="text-sm text-gray-500 mt-1">Gestiona tus facturas, formas de pago e información fiscal.</p>
    </div>

    <!-- Próxima factura -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Próxima factura</h3>
          <UButton color="gray" variant="soft" size="sm" class="font-medium">
            <UIcon name="i-lucide-file-text" class="w-4 h-4 mr-1" />
            Ver factura
          </UButton>
        </div>
      </template>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[13px] text-gray-500">Fecha de emisión</p>
          <p class="text-[14px] font-medium text-gray-900 dark:text-white">{{ formatDate(store.nextInvoice.date) }}</p>
        </div>
        <div class="text-right">
          <p class="text-[13px] text-gray-500">Importe</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ store.nextInvoice.amount }}€</p>
        </div>
      </div>
      <UBadge :color="store.nextInvoice.status === 'pending' ? 'amber' : 'green'" variant="soft" size="xs" class="mt-3 font-semibold">
        {{ store.nextInvoice.status === 'pending' ? 'Pendiente' : 'Pagada' }}
      </UBadge>
    </UCard>

    <!-- Perfil de facturación -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Perfil de facturación</h3>
      </template>
      <div class="space-y-6">
        <!-- Formas de pago -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Formas de pago</p>
            <UButton color="gray" variant="soft" size="xs" class="font-medium" @click="showAddCardModal = true">
              <UIcon name="i-lucide-plus" class="w-3.5 h-3.5 mr-1" />
              Agregar o reemplazar forma de pago
            </UButton>
          </div>
          <div v-if="form.paymentMethods.length > 0" class="space-y-2">
            <div v-for="card in form.paymentMethods" :key="card.id" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-7 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p class="text-[13px] font-medium text-gray-900 dark:text-white">
                    {{ card.type }} •••• {{ card.last4 }}
                    <UBadge v-if="card.isDefault" color="primary" variant="soft" size="xs" class="ml-2">Predeterminada</UBadge>
                  </p>
                  <p class="text-[12px] text-gray-500">Expira {{ card.expiry }}</p>
                </div>
              </div>
              <UButton icon="i-lucide-trash" color="gray" variant="ghost" size="xs" class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500" @click="handleRemoveCard(card.id)" />
            </div>
          </div>
          <div v-else class="text-[13px] text-gray-500 text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            No hay formas de pago configuradas.
          </div>
        </div>

        <UDivider />

        <!-- ID fiscal -->
        <UFormGroup label="ID fiscal" help="Tu número de identificación fiscal para las facturas." :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.taxId" placeholder="ES12345678A" />
        </UFormGroup>

        <UDivider />

        <!-- Moneda -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Moneda de facturación</p>
            <p class="text-[12px] text-gray-500 mt-0.5">{{ form.billingCurrency }} — Las opciones de tu moneda de facturación están determinadas por tu país de la empresa.</p>
          </div>
          <UButton color="gray" variant="soft" size="xs" class="font-medium" @click="showCurrencyModal = true">Cambiar</UButton>
        </div>
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

    <!-- Add Card Modal -->
    <UModal v-model="showAddCardModal" :ui="{ width: 'sm:max-w-md' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Añadir tarjeta</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="showAddCardModal = false" />
          </div>
        </template>
        <div class="space-y-4">
          <UFormGroup label="Tipo de tarjeta">
            <USelectMenu v-model="newCard.type" :options="cardTypeOptions" />
          </UFormGroup>
          <UFormGroup label="Número de tarjeta">
            <UInput v-model="newCard.number" placeholder="4242 4242 4242 4242" />
          </UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Fecha de expiración">
              <UInput v-model="newCard.expiry" placeholder="MM/AA" />
            </UFormGroup>
            <UFormGroup label="CVC">
              <UInput v-model="newCard.cvc" placeholder="123" type="password" />
            </UFormGroup>
          </div>
          <UCheckbox v-model="newCard.isDefault" label="Establecer como forma de pago predeterminada" :ui="{ label: 'text-[13px] text-gray-700 dark:text-gray-300' }" />
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" @click="showAddCardModal = false">Cancelar</UButton>
            <UButton color="black" size="sm" class="font-semibold" @click="handleAddCard">Añadir tarjeta</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Currency Modal -->
    <UModal v-model="showCurrencyModal" :ui="{ width: 'sm:max-w-sm' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Moneda de facturación</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="showCurrencyModal = false" />
          </div>
        </template>
        <div>
          <p class="text-[13px] text-gray-500 mb-3">Las opciones de tu moneda de facturación están determinadas por tu país de la empresa.</p>
          <USelectMenu v-model="tempBillingCurrency" :options="currencyOptions" />
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" @click="showCurrencyModal = false">Cancelar</UButton>
            <UButton color="black" size="sm" @click="saveBillingCurrency">Guardar</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
