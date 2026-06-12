<script setup lang="ts">
import { computed } from 'vue'
import { useOnlineStoreStore, type ThemeSection } from '~/stores/useOnlineStoreStore'
import { useEditorSectionActions } from '~/composables/useEditorSectionActions'

const props = defineProps<{
  sec: ThemeSection
  themeId: string
}>()

const store = useOnlineStoreStore()
const { selectSection, toggleSectionVisibility, duplicateSection, deleteSection } = useEditorSectionActions(props.themeId)

const inspectorEnabled = computed(() => store.editorInspectorEnabled)
const isSelectedSection = computed(() => store.editorSelectedSectionId === props.sec.id)
const hasSelectedBlock = computed(() => !!store.editorSelectedBlockId && store.editorSelectedSectionId === props.sec.id)

const handleClick = () => {
  if (!inspectorEnabled.value) return
  selectSection(props.sec.id)
}
</script>

<template>
  <div
    class="relative group/preview transition-all"
    style="margin-bottom: var(--theme-section-spacing, 0px)"
    :class="[
      inspectorEnabled ? 'cursor-pointer' : '',
      isSelectedSection && !hasSelectedBlock
        ? 'ring-2 ring-primary-500 ring-inset'
        : inspectorEnabled
          ? 'hover:ring-2 hover:ring-primary-300 hover:ring-inset'
          : ''
    ]"
    @click="handleClick"
  >
    <!-- Inspector label badge -->
    <div
      v-if="inspectorEnabled"
      class="absolute top-0 left-0 bg-primary-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-br z-10 opacity-0 group-hover/preview:opacity-100 transition-opacity pointer-events-none"
    >
      {{ sec.displayName }}
    </div>

    <!-- Inspector context actions (visible when section is selected without a block) -->
    <div
      v-if="inspectorEnabled && isSelectedSection && !hasSelectedBlock"
      class="absolute top-0 right-0 z-20 flex gap-0.5 p-1"
    >
      <button
        class="w-6 h-6 rounded bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        :title="sec.hidden ? 'Mostrar' : 'Ocultar'"
        @click.stop="toggleSectionVisibility(sec.id)"
      >
        <UIcon :name="sec.hidden ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="w-3 h-3 text-gray-500" />
      </button>
      <button
        class="w-6 h-6 rounded bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Duplicar"
        @click.stop="duplicateSection(sec.id)"
      >
        <UIcon name="i-lucide-copy" class="w-3 h-3 text-gray-500" />
      </button>
      <button
        class="w-6 h-6 rounded bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Eliminar"
        @click.stop="deleteSection(sec.id)"
      >
        <UIcon name="i-lucide-trash" class="w-3 h-3 text-red-500" />
      </button>
    </div>

    <slot />
  </div>
</template>
