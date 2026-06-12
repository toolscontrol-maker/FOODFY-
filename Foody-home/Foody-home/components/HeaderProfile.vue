<script setup lang="ts">
const stores = [
  {
    id: "1",
    name: "Mi tienda",
    role: "Propietario",
    avatar: { text: "MT", class: "bg-[#3DD6C5] text-black font-bold" },
  },
  {
    id: "2",
    name: "Foodfy Demo",
    role: "Administrador",
    avatar: { text: "FD" },
  },
  { id: "3", name: "Pizzería Luigi", role: "Editor", avatar: { text: "PL" } },
];
const currentStore = ref(stores[0]);

const headerDropdownItems = computed(() => [
  stores.map((store) => ({
    label: store.name,
    avatar: store.avatar,
    id: store.id,
    click: () => {
      currentStore.value = store;
    },
    slot: "store-item",
  })),
  [
    { label: "Todas las tiendas", icon: "i-lucide-store" },
    { label: "Dev Dashboard", icon: "i-lucide-code" },
  ],
  [
    {
      label: "Omar Admin",
      description: "n8nommogi@gmail.com",
      avatar: { text: "OA", class: "bg-[#40A6F2] text-white font-medium" },
      slot: "user-profile",
    },
    { label: "Cerrar sesión", icon: "i-lucide-log-out" },
  ],
]);
</script>

<template>
  <UDropdown
    :items="headerDropdownItems"
    :ui="{
      width: 'w-64',
      item: { disabled: 'cursor-text select-text' },
    }"
    :popper="{ placement: 'bottom-end' }"
    class="flex items-center"
  >
    <template #default="{ open }">
      <UButton
        color="gray"
        variant="ghost"
        :class="[
          'flex items-center gap-2 p-1.5 rounded-xl border transition-colors',
          open 
            ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800' 
            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
        ]"
      >
        <UAvatar
          v-bind="currentStore.avatar"
          size="sm"
          class="rounded-md flex-shrink-0"
        />
        <span class="text-sm font-semibold truncate max-w-[120px] dark:text-white text-gray-900 px-1">
          {{ currentStore.name }}
        </span>
      </UButton>
    </template>

    <template #store-item="{ item }">
      <div class="flex items-center gap-2 flex-1 w-full truncate py-0.5 text-left">
        <UAvatar v-bind="item.avatar" size="xs" class="rounded-md" />
        <span class="text-sm font-medium text-gray-900 dark:text-white truncate">
          {{ item.label }}
        </span>
        <UIcon
          v-if="currentStore.id === item.id"
          name="i-lucide-check"
          class="w-4 h-4 ml-auto text-gray-900 dark:text-white flex-shrink-0"
        />
      </div>
    </template>

    <template #user-profile="{ item }">
      <div class="flex items-center gap-3 w-full text-left py-1">
        <UAvatar v-bind="item.avatar" size="sm" class="rounded-lg" />
        <div class="flex flex-col truncate">
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ item.label }}
          </span>
          <span class="text-xs text-gray-500 truncate">
            {{ item.description }}
          </span>
        </div>
      </div>
    </template>
  </UDropdown>
</template>
