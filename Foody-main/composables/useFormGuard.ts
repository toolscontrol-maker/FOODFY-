import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

/**
 * Composable for tracking dirty form state, save/discard logic, and navigation guards.
 * 
 * Usage:
 *   const { form, isDirty, save, discard, showLeaveModal, confirmLeave, cancelLeave } = useFormGuard(
 *     () => ({ name: store.name, email: store.email }),  // getter for current store values
 *     (data) => { store.name = data.name; store.email = data.email }  // setter to commit to store
 *   )
 *   // form is a reactive object you bind to inputs (v-model="form.name")
 *   // isDirty is true when form differs from last saved snapshot
 *   // save() commits form → store and resets dirty
 *   // discard() resets form from snapshot
 */
export function useFormGuard<T extends Record<string, any>>(
  getStoreData: () => T,
  commitToStore: (data: T) => void
) {
  // Snapshot = last saved state (deep clone of store)
  const snapshot = ref<T>(JSON.parse(JSON.stringify(getStoreData()))) as any

  // Form = local working copy (what the user edits)
  const form = ref<T>(JSON.parse(JSON.stringify(getStoreData()))) as any

  // Dirty check by deep comparison
  const isDirty = computed(() => {
    return JSON.stringify(form.value) !== JSON.stringify(snapshot.value)
  })

  // Save: commit local form to store, then update snapshot
  const save = () => {
    commitToStore(JSON.parse(JSON.stringify(form.value)))
    snapshot.value = JSON.parse(JSON.stringify(form.value))
  }

  // Discard: reset form from snapshot (last saved state)
  const discard = () => {
    form.value = JSON.parse(JSON.stringify(snapshot.value))
  }

  // Navigation guard
  const showLeaveModal = ref(false)
  const pendingPath = ref<string | null>(null)

  onBeforeRouteLeave((to) => {
    if (isDirty.value) {
      pendingPath.value = to.fullPath
      showLeaveModal.value = true
      return false
    }
  })

  const confirmLeave = () => {
    showLeaveModal.value = false
    // Discard changes first so isDirty becomes false
    discard()
    // Then navigate
    if (pendingPath.value) {
      const path = pendingPath.value
      pendingPath.value = null
      navigateTo(path)
    }
  }

  const cancelLeave = () => {
    showLeaveModal.value = false
    pendingPath.value = null
  }

  return {
    form,
    snapshot,
    isDirty,
    save,
    discard,
    showLeaveModal,
    confirmLeave,
    cancelLeave,
  }
}
