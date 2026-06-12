<script setup lang="ts">
const notifications = ref([
  {
    id: 1,
    source: "Point of Sale",
    date: "viernes a las 13:02",
    title: "Tu prueba gratis de POS Pro termina en 3 días",
    description: "Tu cuenta cambiará automáticamente a POS Lite.",
    read: false,
  },
]);

const showOnlyUnread = ref(false);

const filteredNotifications = computed(() => {
  if (showOnlyUnread.value) {
    return notifications.value.filter((n) => !n.read);
  }
  return notifications.value;
});
</script>

<template>
  <UPopover :popper="{ placement: 'bottom-end', strategy: 'absolute' }" class="flex items-center">
    <UButton
      color="gray"
      variant="ghost"
      icon="i-lucide-bell"
      aria-label="Notificaciones"
      class="text-gray-900 dark:text-white rounded-xl h-9 w-9 flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
    />
    <template #panel>
      <div class="w-80 flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 class="font-semibold text-[15px] text-gray-900 dark:text-white">Alertas</h3>
          <div class="flex items-center gap-1">
            <UTooltip :text="showOnlyUnread ? 'Ver todas' : 'Ver solo no leídas'">
              <UButton 
                :color="showOnlyUnread ? 'gray' : 'gray'"
                :variant="showOnlyUnread ? 'soft' : 'ghost'"
                icon="i-lucide-list-filter" 
                size="xs" 
                class="rounded-lg text-gray-500"
                @click="showOnlyUnread = !showOnlyUnread"
              />
            </UTooltip>
            <UTooltip text="Marcar todas como leídas">
              <UButton 
                color="gray" 
                variant="ghost" 
                icon="i-lucide-check-circle" 
                size="xs" 
                class="rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white"
                @click="notifications.forEach(n => n.read = true)"
              />
            </UTooltip>
          </div>
        </div>
        
        <!-- List -->
        <div class="flex flex-col max-h-96 overflow-y-auto w-full">
          <div v-if="filteredNotifications.length === 0" class="flex items-center justify-center py-6 text-sm text-gray-500">
            {{ showOnlyUnread ? 'No hay alertas sin leer' : 'No hay alertas' }}
          </div>
          
          <div 
            v-for="notification in filteredNotifications" 
            :key="notification.id"
            class="flex flex-col py-4 px-4 group relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="notification.read = true"
          >
            <div class="flex items-start justify-between mb-1">
              <p class="text-[13px] text-gray-500 dark:text-gray-400">{{ notification.source }} • {{ notification.date }}</p>
              <div class="w-4 h-4 ml-4 rounded-full border border-gray-400 dark:border-gray-500 flex items-center justify-center group-hover:border-gray-500 transition-colors shrink-0 mt-0.5" :class="!notification.read ? 'border-blue-500 dark:border-blue-400' : ''">
                 <span v-if="!notification.read" class="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
              </div>
            </div>
            <p class="text-[14px] text-gray-900 dark:text-white font-medium pr-6 leading-tight mb-1">{{ notification.title }}</p>
            <p class="text-[14px] text-gray-600 dark:text-gray-400 leading-snug">{{ notification.description }}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="p-4 border-t border-gray-100 dark:border-gray-800 text-center bg-white dark:bg-gray-900">
          <span class="text-[14px] font-semibold text-gray-500">No hay más alertas</span>
        </div>
      </div>
    </template>
  </UPopover>
</template>
