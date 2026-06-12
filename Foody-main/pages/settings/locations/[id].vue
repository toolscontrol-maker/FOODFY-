<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLocationsStore, type Location } from '~/stores/useLocationsStore'

const route = useRoute()
const router = useRouter()
const store = useLocationsStore()
const toast = useToast()

const id = computed(() => route.params.id as string)
const location = computed(() => store.getById(id.value))

/* ── Redirect if not found ── */
watch(location, (loc) => {
  if (!loc) router.replace('/settings/locations')
}, { immediate: true })

/* ── Form state ── */
const form = ref<Omit<Location, 'id' | 'createdAt' | 'updatedAt'>>({
  name: '',
  status: 'active',
  type: 'physical',
  address: '',
  city: '',
  country: '',
  postalCode: '',
  phone: '',
  email: '',
  notes: '',
  channels: [],
  isDefault: false,
  inventoryEnabled: true,
  fulfillmentEnabled: true,
  pickupEnabled: false,
})

const isDirty = ref(false)

const initForm = () => {
  const loc = location.value
  if (!loc) return
  form.value = {
    name: loc.name,
    status: loc.status,
    type: loc.type,
    address: loc.address,
    city: loc.city,
    country: loc.country,
    postalCode: loc.postalCode,
    phone: loc.phone,
    email: loc.email,
    notes: loc.notes,
    channels: [...loc.channels],
    isDefault: loc.isDefault,
    inventoryEnabled: loc.inventoryEnabled,
    fulfillmentEnabled: loc.fulfillmentEnabled,
    pickupEnabled: loc.pickupEnabled,
  }
  isDirty.value = false
}

watch(location, initForm, { immediate: true })
watch(form, () => { isDirty.value = true }, { deep: true })

/* ── Type helpers ── */
const typeConfig: Record<Location['type'], { label: string; icon: string; color: string }> = {
  physical:  { label: 'Tienda física',  icon: 'i-lucide-store',     color: 'blue' },
  warehouse: { label: 'Almacén',        icon: 'i-lucide-warehouse',  color: 'orange' },
  app:       { label: 'App',            icon: 'i-lucide-puzzle',     color: 'purple' },
  custom:    { label: 'Personalizada',  icon: 'i-lucide-map-pin',    color: 'gray' },
}
const channelIcons: Record<string, string> = {
  online: 'i-lucide-globe',
  pos:    'i-lucide-monitor',
  shop:   'i-lucide-shopping-bag',
}
const channelLabels: Record<string, string> = {
  online: 'Tienda online',
  pos:    'Point of Sale',
  shop:   'Shop',
}

const toggleChannel = (ch: 'online' | 'pos' | 'shop') => {
  const idx = form.value.channels.indexOf(ch)
  if (idx >= 0) form.value.channels.splice(idx, 1)
  else form.value.channels.push(ch)
}

/* ── Save ── */
const saving = ref(false)
const save = async () => {
  if (!form.value.name.trim()) return
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  store.updateLocation(id.value, form.value)
  isDirty.value = false
  saving.value = false
  toast.add({ title: 'Cambios guardados', description: `"${form.value.name}" actualizada.`, color: 'green' })
}

/* ── Delete ── */
const showDeleteModal = ref(false)
const handleDelete = () => { showDeleteModal.value = true }
const confirmDelete = () => {
  const name = location.value?.name
  store.deleteLocation(id.value)
  toast.add({ title: 'Sucursal eliminada', description: `"${name}" eliminada.`, color: 'orange' })
  router.push('/settings/locations')
}

/* ── Toggle status ── */
const toggleStatus = () => {
  const next = form.value.status === 'active' ? 'inactive' : 'active'
  form.value.status = next
}
</script>

<template>
  <div v-if="location" class="max-w-4xl pb-16">

    <!-- ── Breadcrumb ── -->
    <div class="flex items-center gap-2 text-[13px] text-gray-500 mb-6">
      <NuxtLink to="/settings/locations" class="hover:text-gray-900 dark:hover:text-white transition-colors">
        Sucursales
      </NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-gray-900 dark:text-white font-medium truncate">{{ location.name }}</span>
    </div>

    <!-- ── Page header ── -->
    <div class="flex items-start justify-between gap-4 mb-8">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="`bg-${typeConfig[location.type].color}-50 dark:bg-${typeConfig[location.type].color}-900/10`"
        >
          <UIcon
            :name="typeConfig[location.type].icon"
            class="w-5 h-5"
            :class="`text-${typeConfig[location.type].color}-600 dark:text-${typeConfig[location.type].color}-400`"
          />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ location.name }}</h2>
            <UBadge v-if="location.isDefault" color="gray" variant="subtle" size="xs">Principal</UBadge>
            <UBadge :color="location.status === 'active' ? 'green' : 'gray'" variant="subtle" size="xs">
              {{ location.status === 'active' ? 'Activa' : 'Inactiva' }}
            </UBadge>
          </div>
          <p class="text-[13px] text-gray-500 mt-0.5">{{ location.city }}, {{ location.country }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0">
        <UBadge v-if="isDirty" color="yellow" variant="subtle" size="sm" class="hidden sm:flex">
          <UIcon name="i-lucide-circle-dot" class="w-3 h-3 mr-1" />
          Sin guardar
        </UBadge>
        <UButton color="gray" variant="ghost" size="sm" :to="'/settings/locations'">Cancelar</UButton>
        <UButton
          color="black"
          size="sm"
          :loading="saving"
          :disabled="!form.name.trim()"
          icon="i-lucide-save"
          label="Guardar cambios"
          @click="save"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ── LEFT COLUMN: Main form ── -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Información general -->
        <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
          <template #header>
            <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Información general</h3>
          </template>
          <div class="space-y-4">
            <UFormGroup label="Nombre de la sucursal" required>
              <UInput v-model="form.name" placeholder="Ej: Sede Principal Valencia" size="sm" />
            </UFormGroup>
            <div class="grid grid-cols-2 gap-3">
              <UFormGroup label="Tipo">
                <USelectMenu
                  v-model="form.type"
                  :options="[
                    { label: 'Tienda física', value: 'physical' },
                    { label: 'Almacén', value: 'warehouse' },
                    { label: 'App', value: 'app' },
                    { label: 'Personalizada', value: 'custom' },
                  ]"
                  value-attribute="value"
                  size="sm"
                />
              </UFormGroup>
              <UFormGroup label="Estado">
                <USelectMenu
                  v-model="form.status"
                  :options="[{ label: 'Activa', value: 'active' }, { label: 'Inactiva', value: 'inactive' }]"
                  value-attribute="value"
                  size="sm"
                />
              </UFormGroup>
            </div>
            <UFormGroup label="Notas internas">
              <UTextarea v-model="form.notes" placeholder="Información adicional sobre esta sucursal…" :rows="2" size="sm" />
            </UFormGroup>
          </div>
        </UCard>

        <!-- Dirección -->
        <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
          <template #header>
            <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Dirección</h3>
          </template>
          <div class="space-y-4">
            <UFormGroup label="Dirección">
              <UInput v-model="form.address" placeholder="Calle, número, piso…" size="sm" />
            </UFormGroup>
            <div class="grid grid-cols-2 gap-3">
              <UFormGroup label="Ciudad">
                <UInput v-model="form.city" placeholder="Valencia" size="sm" />
              </UFormGroup>
              <UFormGroup label="Código postal">
                <UInput v-model="form.postalCode" placeholder="46001" size="sm" />
              </UFormGroup>
            </div>
            <UFormGroup label="País">
              <UInput v-model="form.country" placeholder="España" size="sm" />
            </UFormGroup>
          </div>
        </UCard>

        <!-- Contacto -->
        <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
          <template #header>
            <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Contacto</h3>
          </template>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Teléfono">
              <UInput v-model="form.phone" placeholder="+34 600 000 000" size="sm" icon="i-lucide-phone" />
            </UFormGroup>
            <UFormGroup label="Email">
              <UInput v-model="form.email" placeholder="sucursal@empresa.com" size="sm" icon="i-lucide-mail" />
            </UFormGroup>
          </div>
        </UCard>

        <!-- Canales de venta -->
        <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
          <template #header>
            <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Canales de venta</h3>
          </template>
          <p class="text-[12px] text-gray-500 mb-3">Selecciona en qué canales opera esta sucursal.</p>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="ch in (['online', 'pos', 'shop'] as const)" :key="ch"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all"
              :class="form.channels.includes(ch)
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'"
              @click="toggleChannel(ch)"
            >
              <UIcon :name="channelIcons[ch]" class="w-4 h-4" />
              {{ channelLabels[ch] }}
              <UIcon v-if="form.channels.includes(ch)" name="i-lucide-check" class="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </UCard>

        <!-- Logística -->
        <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Preparación y logística</h3>
              <UBadge color="yellow" variant="subtle" size="xs">Próximamente</UBadge>
            </div>
          </template>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Gestión de inventario</p>
                <p class="text-[11px] text-gray-500">Controla el stock desde esta sucursal</p>
              </div>
              <UToggle v-model="form.inventoryEnabled" />
            </div>
            <div class="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between">
              <div>
                <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Preparación de pedidos</p>
                <p class="text-[11px] text-gray-500">Los pedidos se pueden preparar aquí</p>
              </div>
              <UToggle v-model="form.fulfillmentEnabled" />
            </div>
            <div class="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between">
              <div>
                <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300">Recogida en tienda</p>
                <p class="text-[11px] text-gray-500">Los clientes pueden elegir esta sucursal para recoger su pedido</p>
              </div>
              <UToggle v-model="form.pickupEnabled" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- ── RIGHT COLUMN: Sidebar ── -->
      <div class="space-y-4">

        <!-- Sucursal principal -->
        <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[13px] font-semibold text-gray-900 dark:text-white">Sucursal principal</p>
              <p class="text-[11px] text-gray-500 mt-0.5">Se usa por defecto para pedidos y stock</p>
            </div>
            <UToggle v-model="form.isDefault" :disabled="location.isDefault" />
          </div>
          <p v-if="location.isDefault" class="text-[11px] text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
            <UIcon name="i-lucide-check-circle" class="w-3.5 h-3.5" />
            Esta es la sucursal principal
          </p>
        </UCard>

        <!-- Resumen -->
        <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
          <h4 class="text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Resumen</h4>
          <div class="space-y-2 text-[12px]">
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Tipo</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ typeConfig[form.type]?.label }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Canales</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ form.channels.length || '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Inventario</span>
              <UBadge :color="form.inventoryEnabled ? 'green' : 'gray'" variant="subtle" size="xs">
                {{ form.inventoryEnabled ? 'Sí' : 'No' }}
              </UBadge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Preparación</span>
              <UBadge :color="form.fulfillmentEnabled ? 'green' : 'gray'" variant="subtle" size="xs">
                {{ form.fulfillmentEnabled ? 'Sí' : 'No' }}
              </UBadge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Recogida</span>
              <UBadge :color="form.pickupEnabled ? 'green' : 'gray'" variant="subtle" size="xs">
                {{ form.pickupEnabled ? 'Sí' : 'No' }}
              </UBadge>
            </div>
          </div>
        </UCard>

        <!-- Conexiones futuras -->
        <UCard :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
          <h4 class="text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Conexiones futuras</h4>
          <div class="space-y-2.5">
            <div
              v-for="item in [
                { icon: 'i-lucide-package', label: 'Inventario por sucursal' },
                { icon: 'i-lucide-clipboard-list', label: 'Pedidos en esta ubicación' },
                { icon: 'i-lucide-arrow-left-right', label: 'Transferencias de stock' },
              ]" :key="item.label"
              class="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-500"
            >
              <UIcon :name="item.icon" class="w-3.5 h-3.5 flex-shrink-0" />
              <span>{{ item.label }}</span>
              <UBadge color="gray" variant="subtle" size="xs" class="ml-auto">Pronto</UBadge>
            </div>
          </div>
        </UCard>

        <!-- Zona de peligro -->
        <UCard
          v-if="!location.isDefault"
          :ui="{ body: { padding: 'p-4' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-red-200 dark:ring-red-900' }"
        >
          <h4 class="text-[12px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">Zona de peligro</h4>
          <p class="text-[12px] text-gray-500 mb-3">Eliminar esta sucursal de forma permanente. Esta acción no se puede deshacer.</p>
          <UButton color="red" variant="soft" size="xs" icon="i-lucide-trash-2" label="Eliminar sucursal" @click="handleDelete" />
        </UCard>
      </div>
    </div>

    <!-- Sticky save bar (mobile) -->
    <Teleport to="body">
      <Transition enter-from-class="translate-y-full opacity-0" enter-active-class="transition-all duration-200" leave-to-class="translate-y-full opacity-0" leave-active-class="transition-all duration-200">
        <div v-if="isDirty" class="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur px-4 py-3 flex items-center justify-between">
          <span class="text-[13px] text-gray-600 dark:text-gray-400">Tienes cambios sin guardar</span>
          <div class="flex gap-2">
            <UButton color="gray" variant="ghost" size="sm" @click="initForm">Descartar</UButton>
            <UButton color="black" size="sm" :loading="saving" @click="save">Guardar</UButton>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>

  <!-- Delete confirmation modal -->
  <UModal v-model="showDeleteModal" :ui="{ width: 'sm:max-w-sm' }">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">¿Eliminar sucursal?</h3>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="showDeleteModal = false" />
        </div>
      </template>
      <p class="text-[13px] text-gray-600 dark:text-gray-400">
        Se eliminará <strong>"{{ location?.name }}"</strong> permanentemente. Esta acción no se puede deshacer.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="gray" variant="ghost" @click="showDeleteModal = false">Cancelar</UButton>
          <UButton color="red" @click="confirmDelete">Eliminar</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
