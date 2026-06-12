<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'

const store = useSettingsStore()
const router = useRouter()
const toast = useToast()

const activeTab = ref(0)
const searchQuery = ref('')

const tabs = [
  { label: 'Usuarios', badge: computed(() => store.users.length) },
  { label: 'Roles', badge: computed(() => store.roles.length) },
  { label: 'Seguridad' },
]

const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'type', label: 'Tipo' },
  { key: 'role', label: 'Rol' },
  { key: 'status', label: 'Estado' },
  { key: 'twoFactor', label: '2FA' },
]

const filteredUsers = computed(() => {
  if (!searchQuery.value) return store.users
  return store.users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const getUserTypeLabel = (type: string) => {
  switch (type) {
    case 'admin': return 'Admin'
    case 'poc': return 'POC'
    case 'driver': return 'Driver'
    default: return type
  }
}

const getUserTypeColor = (type: string) => {
  switch (type) {
    case 'admin': return 'red'
    case 'poc': return 'blue'
    case 'driver': return 'orange'
    default: return 'gray'
  }
}

const getRoleLabel = (roleId: string) => {
  const role = store.roles.find(r => r.id === roleId)
  return role ? role.label : roleId
}

const handleExport = () => {
  const headers = ['Nombre', 'Email', 'Tipo', 'Rol', 'Estado', '2FA']
  const csvContent = [
    headers.join(','),
    ...store.users.map(u => [u.name, u.email, u.type, u.role, u.status, u.twoFactor ? 'Sí' : 'No'].join(','))
  ].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'usuarios.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.add({ title: 'Exportación completada', color: 'green' })
}

const showDeleteModal = ref(false)
const userToDelete = ref<number | null>(null)

const confirmDelete = (id: number) => {
  userToDelete.value = id
  showDeleteModal.value = true
}

const handleDelete = () => {
  if (userToDelete.value !== null) {
    store.deleteUser(userToDelete.value)
    toast.add({ title: 'Usuario eliminado', color: 'red' })
  }
  showDeleteModal.value = false
  userToDelete.value = null
}
</script>

<template>
  <div class="max-w-4xl space-y-6 pb-10">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Usuarios</h2>
        <p class="text-sm text-gray-500 mt-1">Gestiona los usuarios de tu tienda, sus roles y la seguridad.</p>
      </div>
      <div class="flex gap-2">
        <UButton color="gray" variant="soft" size="sm" class="font-medium" icon="i-lucide-download" @click="handleExport">Exportar</UButton>
        <UButton color="black" size="sm" class="font-semibold" icon="i-lucide-plus" @click="router.push('/settings/users/new')">Agregar usuario</UButton>
      </div>
    </div>

    <UCard :ui="{ body: { padding: 'sm:p-0' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-800 px-4 pt-4 flex gap-4 overflow-x-auto">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="activeTab = index"
          class="pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap"
          :class="[
            activeTab === index
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          ]"
        >
          {{ tab.label }}
          <UBadge v-if="tab.badge" color="gray" variant="subtle" size="xs" class="min-w-[1.5rem] px-1 text-[11px] h-5">{{ tab.badge.value ?? tab.badge }}</UBadge>
        </button>
      </div>

      <!-- Users Tab -->
      <template v-if="activeTab === 0">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Buscar usuarios..." class="w-64" />
        </div>

        <UTable :rows="filteredUsers" :columns="columns" class="w-full">
          <template #name-data="{ row }">
            <NuxtLink :to="`/settings/users/${row.id}`" class="flex items-center gap-2 group">
              <UAvatar :alt="row.name" size="sm" />
              <span class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{{ row.name }}</span>
            </NuxtLink>
          </template>
          <template #email-data="{ row }">
            <span class="text-[13px] text-gray-500">{{ row.email }}</span>
          </template>
          <template #type-data="{ row }">
            <UBadge :color="getUserTypeColor(row.type)" variant="soft" size="xs" class="font-semibold">{{ getUserTypeLabel(row.type) }}</UBadge>
          </template>
          <template #role-data="{ row }">
            <span class="text-[13px] text-gray-600 dark:text-gray-400">{{ getRoleLabel(row.role) }}</span>
          </template>
          <template #status-data="{ row }">
            <UBadge :color="row.status === 'Activo' ? 'green' : 'gray'" variant="soft" size="xs" class="font-semibold">{{ row.status }}</UBadge>
          </template>
          <template #twoFactor-data="{ row }">
            <UIcon :name="row.twoFactor ? 'i-lucide-shield-check' : 'i-lucide-shield-off'" :class="row.twoFactor ? 'text-green-500' : 'text-gray-400'" class="w-4 h-4" />
          </template>
        </UTable>
      </template>

      <!-- Roles Tab -->
      <template v-if="activeTab === 1">
        <div class="p-5 space-y-3">
          <div v-for="role in store.roles" :key="role.id" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <div>
              <p class="text-[14px] font-semibold text-gray-900 dark:text-white">{{ role.label }}</p>
              <p class="text-[12px] text-gray-500 mt-0.5">{{ role.description }}</p>
            </div>
            <UBadge color="gray" variant="soft" size="xs">{{ store.users.filter(u => u.role === role.id).length }} usuarios</UBadge>
          </div>
        </div>
      </template>

      <!-- Security Tab -->
      <template v-if="activeTab === 2">
        <div class="p-5 space-y-4">
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-lg p-4 flex gap-3">
            <UIcon name="i-lucide-shield-alert" class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div class="text-[13px] text-amber-800 dark:text-amber-300">
              <p class="font-semibold mb-1">Seguridad de la cuenta</p>
              <p>Se recomienda que todos los usuarios tengan la autenticación en dos pasos (2FA) activada para mayor seguridad.</p>
            </div>
          </div>
          <div class="space-y-2">
            <div v-for="user in store.users" :key="user.id" class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <UAvatar :alt="user.name" size="xs" />
                <div>
                  <p class="text-[13px] font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                  <p class="text-[12px] text-gray-500">{{ user.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UBadge :color="user.twoFactor ? 'green' : 'red'" variant="soft" size="xs" class="font-medium">
                  {{ user.twoFactor ? '2FA Activo' : '2FA Inactivo' }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Delete Confirmation -->
    <UModal v-model="showDeleteModal" :ui="{ width: 'sm:max-w-sm' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Eliminar usuario</h3>
        </template>
        <p class="text-[13px] text-gray-600 dark:text-gray-400">¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" @click="showDeleteModal = false">Cancelar</UButton>
            <UButton color="red" size="sm" class="font-semibold" @click="handleDelete">Eliminar</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
