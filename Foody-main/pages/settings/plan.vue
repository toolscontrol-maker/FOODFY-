<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'

const store = useSettingsStore()
const toast = useToast()

const showChangePlanModal = ref(false)
const showCancelPlanModal = ref(false)
const selectedPlan = ref('')

const plans = [
  { name: 'Básico', price: 29, period: 'mes', features: ['Hasta 100 productos', '2 usuarios', 'Soporte por email', 'Informes básicos'] },
  { name: 'Profesional', price: 79, period: 'mes', features: ['Productos ilimitados', '5 usuarios', 'Soporte prioritario', 'Informes avanzados', 'API acceso'] },
  { name: 'Enterprise', price: 199, period: 'mes', features: ['Todo en Profesional', 'Usuarios ilimitados', 'Soporte dedicado', 'SLA garantizado', 'Personalización completa'] },
]

const handleSelectPlan = (planName: string) => {
  selectedPlan.value = planName
  if (planName === store.currentPlan.name) {
    toast.add({ title: 'Ya estás en este plan', description: 'Tu suscripción se ha confirmado.', color: 'blue' })
    showChangePlanModal.value = false
  } else {
    const plan = plans.find(p => p.name === planName)
    if (plan) {
      store.currentPlan = { ...plan }
      toast.add({ title: 'Plan actualizado', description: `Ahora estás en el plan ${planName}.`, color: 'green' })
      showChangePlanModal.value = false
    }
  }
}

const handleCancelPlan = () => {
  toast.add({ title: 'Plan cancelado', description: 'Tu plan ha sido cancelado. Tendrás acceso hasta el final del período de facturación.', color: 'red' })
  showCancelPlanModal.value = false
}
</script>

<template>
  <div class="max-w-3xl space-y-6 pb-10">
    <div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Plan</h2>
      <p class="text-sm text-gray-500 mt-1">Gestiona tu plan de suscripción y funcionalidades.</p>
    </div>

    <!-- Current Plan Info -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Información del plan</h3>
          <UButton color="black" size="sm" class="font-semibold" @click="showChangePlanModal = true">Cambiar plan</UButton>
        </div>
      </template>
      <div class="space-y-4">
        <div class="flex items-baseline gap-3">
          <span class="text-2xl font-extrabold text-gray-900 dark:text-white">{{ store.currentPlan.name }}</span>
          <UBadge color="green" variant="soft" size="xs" class="font-semibold">Activo</UBadge>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ store.currentPlan.price }}€</span>
          <span class="text-sm text-gray-500">/{{ store.currentPlan.period }}</span>
        </div>
        <div class="space-y-2 pt-2">
          <div v-for="feature in store.currentPlan.features" :key="feature" class="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 flex-shrink-0" />
            {{ feature }}
          </div>
        </div>

        <UDivider class="my-4" />

        <div class="flex items-center justify-between">
          <UButton color="gray" variant="soft" size="sm" class="font-medium">
            <UIcon name="i-lucide-list" class="w-4 h-4 mr-1" />
            Ver todas las funciones
          </UButton>
          <UButton color="red" variant="ghost" size="sm" class="font-medium" @click="showCancelPlanModal = true">Cancelar plan</UButton>
        </div>
      </div>
    </UCard>

    <!-- Subscriptions -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Suscripciones</h3>
      </template>
      <div v-if="store.subscriptions.length === 0" class="text-center py-8">
        <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-3">
          <UIcon name="i-lucide-credit-card" class="w-6 h-6 text-gray-400" />
        </div>
        <p class="text-[13px] text-gray-500">No tienes suscripciones adicionales activas.</p>
      </div>
      <div v-else class="space-y-3">
        <div v-for="sub in store.subscriptions" :key="sub.name" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div>
            <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ sub.name }}</p>
            <p class="text-[12px] text-gray-500">Próxima facturación: {{ sub.nextBilling }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] font-semibold text-gray-900 dark:text-white">{{ sub.price }}€/mes</span>
            <UBadge :color="sub.status === 'active' ? 'green' : 'gray'" variant="soft" size="xs">{{ sub.status === 'active' ? 'Activa' : 'Inactiva' }}</UBadge>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Change Plan Modal -->
    <UModal v-model="showChangePlanModal" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Selecciona tu plan</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="showChangePlanModal = false" />
          </div>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="plan in plans"
            :key="plan.name"
            class="border rounded-xl p-4 cursor-pointer transition-all"
            :class="plan.name === store.currentPlan.name
              ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/50 dark:bg-primary-900/10'
              : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'"
            @click="handleSelectPlan(plan.name)"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-[14px] font-bold text-gray-900 dark:text-white">{{ plan.name }}</span>
              <UBadge v-if="plan.name === store.currentPlan.name" color="primary" variant="soft" size="xs">Actual</UBadge>
            </div>
            <div class="flex items-baseline gap-0.5 mb-4">
              <span class="text-2xl font-extrabold text-gray-900 dark:text-white">{{ plan.price }}€</span>
              <span class="text-xs text-gray-500">/{{ plan.period }}</span>
            </div>
            <div class="space-y-1.5">
              <div v-for="f in plan.features" :key="f" class="flex items-start gap-1.5 text-[12px] text-gray-600 dark:text-gray-400">
                <UIcon name="i-lucide-check" class="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                {{ f }}
              </div>
            </div>
            <UButton
              class="w-full mt-4 font-semibold justify-center"
              :color="plan.name === store.currentPlan.name ? 'gray' : 'black'"
              size="sm"
              @click.stop="handleSelectPlan(plan.name)"
            >
              {{ plan.name === store.currentPlan.name ? 'Plan actual' : 'Suscribirse' }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Cancel Plan Modal -->
    <UModal v-model="showCancelPlanModal" :ui="{ width: 'sm:max-w-md' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Cancelar plan</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="showCancelPlanModal = false" />
          </div>
        </template>
        <div class="space-y-4">
          <div class="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/40">
            <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div class="text-[13px] text-red-800 dark:text-red-300">
              <p class="font-semibold mb-1">¿Estás seguro?</p>
              <p>Al cancelar tu plan perderás acceso a las funcionalidades premium al final del período de facturación actual. Esta acción no se puede deshacer fácilmente.</p>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" class="font-medium" @click="showCancelPlanModal = false">Mantener plan</UButton>
            <UButton color="red" size="sm" class="font-semibold" @click="handleCancelPlan">Confirmar cancelación</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
