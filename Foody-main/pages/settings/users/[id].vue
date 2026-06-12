<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'
import { onBeforeRouteLeave } from 'vue-router'

const store = useSettingsStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const id = route.params.id

const isNew = computed(() => id === 'new')

const existingUser = computed(() => store.users.find(u => String(u.id) === String(id)))

const form = ref({
  name: '',
  email: '',
  type: 'admin' as 'admin' | 'poc' | 'driver',
  role: 'editor',
  status: 'Activo',
  twoFactor: false,
})

if (existingUser.value) {
  form.value = { ...existingUser.value }
}

const snapshot = ref(JSON.stringify(form.value))
const saved = ref(false)

const isDirty = computed(() => JSON.stringify(form.value) !== snapshot.value)

const showLeaveModal = ref(false)
const pendingPath = ref<string | null>(null)

onBeforeRouteLeave((to) => {
  if (isDirty.value && !saved.value) {
    pendingPath.value = to.fullPath
    showLeaveModal.value = true
    return false
  }
})

const confirmLeave = () => {
  showLeaveModal.value = false
  saved.value = true
  if (pendingPath.value) {
    navigateTo(pendingPath.value)
  }
}

const cancelLeave = () => {
  showLeaveModal.value = false
  pendingPath.value = null
}

const handleDiscard = () => {
  form.value = JSON.parse(snapshot.value)
  toast.add({ title: 'Cambios descartados', color: 'gray' })
}

const userTypeOptions = [
  { label: 'Usuario de Admin', value: 'admin', description: 'Acceso completo al panel de administración del dashboard.' },
  { label: 'Usuario del POC (Point of Control)', value: 'poc', description: 'Acceso al sistema de control de cocina y gestión de pedidos.' },
  { label: 'Usuario del Driver', value: 'driver', description: 'Acceso a la app de repartidor: rutas, cobros y pedidos asignados.' },
]

const roleOptions = computed(() => store.roles.map(r => ({ label: r.label, value: r.id })))
const statusOptions = ['Activo', 'Inactivo', 'Suspendido']

const handleSave = () => {
  if (!form.value.name || !form.value.email) {
    toast.add({ title: 'Error', description: 'Nombre y email son obligatorios.', color: 'red' })
    return
  }

  if (isNew.value) {
    store.addUser({ ...form.value })
    toast.add({ title: 'Usuario creado', description: `${form.value.name} ha sido añadido correctamente.`, color: 'green' })
  } else {
    store.updateUser({ ...form.value, id: Number(id) })
    toast.add({ title: 'Usuario actualizado', description: `Los datos de ${form.value.name} se han guardado.`, color: 'green' })
  }
  saved.value = true
  router.push('/settings/users')
}

const showDeleteModal = ref(false)

const handleDelete = () => {
  store.deleteUser(Number(id))
  toast.add({ title: 'Usuario eliminado', color: 'red' })
  showDeleteModal.value = false
  saved.value = true
  router.push('/settings/users')
}
</script>

<template>
  <div class="max-w-3xl space-y-6 pb-24">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" size="sm" @click="router.push('/settings/users')" />
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ isNew ? 'Agregar usuario' : form.name }}</h2>
          <p class="text-sm text-gray-500">{{ isNew ? 'Configura un nuevo usuario para tu tienda.' : 'Edita la información y permisos del usuario.' }}</p>
        </div>
      </div>
      <UButton v-if="!isNew" color="red" variant="ghost" size="sm" class="font-medium" icon="i-lucide-trash" @click="showDeleteModal = true">Eliminar</UButton>
    </div>

    <!-- User Type Selection -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Tipo de usuario</h3>
      </template>
      <p class="text-[13px] text-gray-500 mb-4">Selecciona el tipo de acceso que tendrá este usuario en el sistema.</p>
      <div class="space-y-3">
        <label
          v-for="option in userTypeOptions"
          :key="option.value"
          class="flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all"
          :class="form.type === option.value
            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/50 dark:bg-primary-900/10'
            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'"
        >
          <input
            type="radio"
            :value="option.value"
            v-model="form.type"
            class="mt-1 accent-primary-500"
          />
          <div>
            <p class="text-[13px] font-semibold text-gray-900 dark:text-white">{{ option.label }}</p>
            <p class="text-[12px] text-gray-500 mt-0.5">{{ option.description }}</p>
          </div>
        </label>
      </div>
    </UCard>

    <!-- User Information -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Información del usuario</h3>
      </template>
      <div class="space-y-4">
        <UFormGroup label="Nombre completo" required :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.name" placeholder="Nombre y apellidos" />
        </UFormGroup>
        <UFormGroup label="Correo electrónico" required :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.email" type="email" placeholder="usuario@empresa.com" />
        </UFormGroup>
        <UFormGroup label="Estado" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <USelectMenu v-model="form.status" :options="statusOptions" />
        </UFormGroup>
      </div>
    </UCard>

    <!-- Two Factor Authentication -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Autenticación en dos pasos</h3>
      </template>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[13px] text-gray-700 dark:text-gray-300">Requiere un código adicional al iniciar sesión para mayor seguridad.</p>
          <p class="text-[12px] text-gray-500 mt-1">Se recomienda activar para todos los usuarios con acceso al panel de administración.</p>
        </div>
        <UToggle v-model="form.twoFactor" color="primary" />
      </div>
      <div v-if="form.twoFactor" class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/40">
        <div class="flex items-center gap-2 text-[13px] text-green-700 dark:text-green-300">
          <UIcon name="i-lucide-shield-check" class="w-4 h-4" />
          <span class="font-medium">La autenticación en dos pasos estará activa para este usuario.</span>
        </div>
      </div>
    </UCard>

    <!-- Roles -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Roles</h3>
      </template>
      <p class="text-[13px] text-gray-500 mb-4">Asigna un rol que define los permisos y nivel de acceso del usuario.</p>
      <USelectMenu
        v-model="form.role"
        :options="roleOptions"
        value-attribute="value"
        size="md"
      />
      <div class="mt-3">
        <div v-for="role in store.roles" :key="role.id" v-show="form.role === role.id" class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
          <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ role.label }}</p>
          <p class="text-[12px] text-gray-500 mt-0.5">{{ role.description }}</p>
        </div>
      </div>
    </UCard>

    <!-- Sticky Save Bar (only when dirty) -->
    <Transition name="slide-up">
      <div v-if="isDirty" class="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-end gap-3 z-30">
        <UButton color="white" variant="solid" class="font-semibold px-5 border border-gray-300 dark:border-gray-700" @click="handleDiscard">Descartar</UButton>
        <UButton color="black" class="font-semibold px-6" @click="handleSave">{{ isNew ? 'Crear usuario' : 'Guardar' }}</UButton>
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

    <!-- Delete Modal -->
    <UModal v-model="showDeleteModal" :ui="{ width: 'sm:max-w-sm' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Eliminar usuario</h3>
        </template>
        <div class="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/40">
          <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p class="text-[13px] text-red-800 dark:text-red-300">¿Estás seguro de que quieres eliminar a <strong>{{ form.name }}</strong>? Esta acción no se puede deshacer.</p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" @click="showDeleteModal = false">Cancelar</UButton>
            <UButton color="red" size="sm" class="font-semibold" @click="handleDelete">Eliminar usuario</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
