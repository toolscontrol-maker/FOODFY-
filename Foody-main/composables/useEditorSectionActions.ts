import { computed } from 'vue'
import { useOnlineStoreStore, type ThemeSection } from '~/stores/useOnlineStoreStore'

export function useEditorSectionActions(themeId: string) {
  const store = useOnlineStoreStore()

  const activeTemplate = computed(() => {
    const theme = store.themes.find(t => t.id === themeId)
    return theme?.templates.find(t => t.id === store.editorActiveTemplateId) ?? theme?.templates[0]
  })

  const selectSection = (sectionId: string) => {
    store.editorSelectedSectionId = sectionId
    store.editorSelectedBlockId = null
  }

  const selectBlock = (sectionId: string, blockId: string) => {
    store.editorSelectedSectionId = sectionId
    store.editorSelectedBlockId = blockId
  }

  const clearSelection = () => {
    store.editorSelectedSectionId = null
    store.editorSelectedBlockId = null
  }

  const toggleSectionVisibility = (sectionId: string) => {
    if (!activeTemplate.value) return
    const sec = activeTemplate.value.sections.find(s => s.id === sectionId)
    if (sec) {
      store.pushUndo(themeId)
      sec.hidden = !sec.hidden
    }
  }

  const duplicateSection = (sectionId: string) => {
    if (!activeTemplate.value) return
    const sec = activeTemplate.value.sections.find(s => s.id === sectionId)
    if (!sec) return
    store.pushUndo(themeId)
    const dup: ThemeSection = JSON.parse(JSON.stringify(sec))
    dup.id = `sec-${Date.now()}`
    dup.displayName = `${sec.displayName} (copia)`
    dup.order = activeTemplate.value.sections.length
    dup.blocks = dup.blocks.map(b => ({
      ...b,
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }))
    activeTemplate.value.sections.push(dup)
  }

  const deleteSection = (sectionId: string) => {
    if (!activeTemplate.value) return
    store.pushUndo(themeId)
    const idx = activeTemplate.value.sections.findIndex(s => s.id === sectionId)
    if (idx !== -1) {
      activeTemplate.value.sections.splice(idx, 1)
      if (store.editorSelectedSectionId === sectionId) clearSelection()
    }
  }

  const moveSectionUp = (sectionId: string) => {
    if (!activeTemplate.value) return
    const sorted = [...activeTemplate.value.sections].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(s => s.id === sectionId)
    if (idx <= 0) return
    store.pushUndo(themeId)
    const tmp = sorted[idx].order
    sorted[idx].order = sorted[idx - 1].order
    sorted[idx - 1].order = tmp
  }

  const moveSectionDown = (sectionId: string) => {
    if (!activeTemplate.value) return
    const sorted = [...activeTemplate.value.sections].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(s => s.id === sectionId)
    if (idx === -1 || idx >= sorted.length - 1) return
    store.pushUndo(themeId)
    const tmp = sorted[idx].order
    sorted[idx].order = sorted[idx + 1].order
    sorted[idx + 1].order = tmp
  }

  return {
    selectSection,
    selectBlock,
    clearSelection,
    toggleSectionVisibility,
    duplicateSection,
    deleteSection,
    moveSectionUp,
    moveSectionDown,
  }
}
