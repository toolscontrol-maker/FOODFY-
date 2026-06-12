<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudioStore } from '~/stores/useStudioStore'
import { useProductsStore } from '~/stores/useProductsStore'
import type { Recipe, RecipeIngredient } from '~/types/studio'
import { isLowStock, getAvailableStock, warehouseUnitLabels } from '~/types/studio'

definePageMeta({ layout: 'dashboard' })

const store = useStudioStore()
await store.fetchAll()

const searchQuery = ref('')
const filterStatus = ref('')

const filteredRecipes = computed(() => {
  let list = [...store.recipes]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r => r.name.toLowerCase().includes(q) || r.productName?.toLowerCase().includes(q))
  }
  if (filterStatus.value) {
    list = list.filter(r => r.status === filterStatus.value)
  }
  return list
})

const selectedRecipe = ref<Recipe | null>(null)
const selectRecipe = (r: Recipe) => { selectedRecipe.value = r }

if (store.recipes.length > 0) selectRecipe(store.recipes[0])

const ingredientAvailability = (ing: RecipeIngredient) => {
  const item = store.getWarehouseItemById(ing.warehouseItemId)
  if (!item) return { available: 0, enough: false, low: true, label: 'No encontrado' }
  const avail = getAvailableStock(item)
  return {
    available: avail,
    enough: avail >= ing.quantity,
    low: isLowStock(item),
    label: `${avail.toFixed(2)} ${warehouseUnitLabels[item.unit] ?? item.unit} disponible`,
  }
}

const canPrepare = computed(() => {
  if (!selectedRecipe.value) return false
  return selectedRecipe.value.ingredients.every(ing => ingredientAvailability(ing).enough)
})

const totalCost = computed(() => {
  if (!selectedRecipe.value) return 0
  return selectedRecipe.value.ingredients.reduce((sum, ing) => {
    const item = store.getWarehouseItemById(ing.warehouseItemId)
    return sum + (item ? item.costPerUnit * ing.quantity : 0)
  }, 0)
})

const formatEur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

/* ── Products store (for product search) ── */
const productsStore = useProductsStore()

/* ── Edit / New recipe modal ── */
const showEditRecipeModal = ref(false)
const editingRecipeId = ref<string | null>(null)
const isNewRecipe = computed(() => editingRecipeId.value === null)

const editForm = ref({
  name: '',
  description: '',
  status: 'active' as 'active' | 'draft',
  image: '',
  productId: '',
  productName: '',
  yield: 1,
  prepTime: 0,
  cookTime: 0,
})
const editIngredients = ref<{ warehouseItemId: string; quantity: number; unit: string }[]>([])

// Product search
const productSearch = ref('')
const showProductDropdown = ref(false)
const filteredProducts = computed(() => {
  const q = productSearch.value.toLowerCase()
  return productsStore.products.filter(p => !q || p.name.toLowerCase().includes(q))
})
const selectProduct = (p: any) => {
  editForm.value.productId = String(p.id)
  editForm.value.productName = p.name
  productSearch.value = p.name
  showProductDropdown.value = false
}
const clearProduct = () => {
  editForm.value.productId = ''
  editForm.value.productName = ''
  productSearch.value = ''
}

// Ingredient search
const ingredientSearch = ref('')
const showIngredientDropdown = ref(false)
const filteredWarehouseItems = computed(() => {
  const q = ingredientSearch.value.toLowerCase()
  const usedIds = editIngredients.value.map(i => i.warehouseItemId)
  return store.warehouseItems.filter(w => !usedIds.includes(w.id) && (!q || w.name.toLowerCase().includes(q)))
})
const addIngredient = (item: any) => {
  editIngredients.value.push({ warehouseItemId: item.id, quantity: 1, unit: item.unit })
  ingredientSearch.value = ''
  showIngredientDropdown.value = false
}
const removeIngredient = (idx: number) => { editIngredients.value.splice(idx, 1) }
const getWarehouseName = (id: string) => store.warehouseItems.find(w => w.id === id)?.name ?? id

const toast = useToast()
const router = useRouter()

const openNewRecipe = () => {
  editingRecipeId.value = null
  editForm.value = { name: '', description: '', status: 'active', image: '', productId: '', productName: '', yield: 1, prepTime: 0, cookTime: 0 }
  editIngredients.value = []
  productSearch.value = ''
  ingredientSearch.value = ''
  showEditRecipeModal.value = true
}
const openEditRecipe = () => {
  if (!selectedRecipe.value) return
  const r = selectedRecipe.value
  editingRecipeId.value = r.id
  editForm.value = { name: r.name, description: r.description, status: r.status, image: r.image || '', productId: r.productId || '', productName: r.productName || '', yield: r.yield, prepTime: r.prepTime, cookTime: r.cookTime }
  productSearch.value = r.productName || ''
  editIngredients.value = (r.ingredients || []).map((ing: RecipeIngredient) => ({ warehouseItemId: ing.warehouseItemId, quantity: ing.quantity, unit: ing.unit }))
  ingredientSearch.value = ''
  showEditRecipeModal.value = true
}

const saveRecipe = () => {
  if (editingRecipeId.value) {
    const idx = store.recipes.findIndex(r => r.id === editingRecipeId.value)
    if (idx >= 0) {
      const enriched = editIngredients.value.map((ing, i) => ({ id: `ri-edit-${i}`, recipeId: editingRecipeId.value!, ...ing, warehouseItemName: getWarehouseName(ing.warehouseItemId) }))
      store.recipes[idx] = { ...store.recipes[idx], ...editForm.value, ingredients: enriched as RecipeIngredient[], updatedAt: new Date().toISOString() }
      selectedRecipe.value = store.recipes[idx]
      toast.add({ title: 'Receta actualizada', description: `"${editForm.value.name}" guardada.`, color: 'green' })
    }
  } else {
    const newId = `rec-${Date.now()}`
    const enriched = editIngredients.value.map((ing, i) => ({ id: `ri-new-${i}`, recipeId: newId, ...ing, warehouseItemName: getWarehouseName(ing.warehouseItemId) }))
    const newRecipe: Recipe = {
      id: newId, ...editForm.value,
      ingredients: enriched as RecipeIngredient[],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    store.recipes.push(newRecipe)
    selectedRecipe.value = newRecipe
    toast.add({ title: 'Receta creada', description: `"${editForm.value.name}" añadida.`, color: 'green' })
  }
  showEditRecipeModal.value = false
}
</script>

<template>
  <div class="absolute inset-0 flex flex-col bg-gray-50 dark:bg-gray-900 z-10 w-full">
    <!-- Header -->
    <div class="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-book-open" class="w-5 h-5" />
          Recetas
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">Cada producto está vinculado a una receta. La disponibilidad viene del almacén.</p>
      </div>
      <UButton icon="i-lucide-plus" color="black" size="sm" label="Añadir receta" @click="openNewRecipe" />
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Recipe list -->
      <div class="w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
        <div class="p-4 border-b border-gray-100 dark:border-gray-800 space-y-2">
          <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Buscar receta…" size="sm" />
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-1">
          <div v-if="filteredRecipes.length === 0" class="text-center py-10 text-gray-400 text-sm">Sin recetas encontradas.</div>
          <div
            v-for="r in filteredRecipes" :key="r.id"
            @click="selectRecipe(r)"
            class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border"
            :class="selectedRecipe?.id === r.id
              ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-500 ring-1 ring-primary-500'
              : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/30'"
          >
            <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <img v-if="r.image" :src="r.image" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-lucide-chef-hat" class="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-sm text-gray-900 dark:text-white truncate">{{ r.name }}</h4>
              <p class="text-xs text-gray-500 truncate">{{ r.productName || 'Sin producto' }}</p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <UBadge :color="r.status === 'active' ? 'green' : 'gray'" variant="subtle" size="xs">{{ r.status === 'active' ? 'Activa' : 'Borrador' }}</UBadge>
              <span class="text-[10px] text-gray-400">{{ r.ingredients.length }} ingr.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Recipe detail -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="selectedRecipe" class="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
          <!-- Recipe header -->
          <div class="flex gap-6 items-start">
            <div class="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0">
              <img v-if="selectedRecipe.image" :src="selectedRecipe.image" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedRecipe.name }}</h2>
              <p class="text-sm text-gray-500 mt-1">{{ selectedRecipe.description }}</p>
              <div class="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <span class="flex items-center gap-1"><UIcon name="i-lucide-clock" class="w-4 h-4" /> Prep: {{ selectedRecipe.prepTime }} min</span>
                <span class="flex items-center gap-1"><UIcon name="i-lucide-flame" class="w-4 h-4" /> Cocción: {{ selectedRecipe.cookTime }} min</span>
                <span class="flex items-center gap-1"><UIcon name="i-lucide-users" class="w-4 h-4" /> Rinde: {{ selectedRecipe.yield }} porción{{ selectedRecipe.yield !== 1 ? 'es' : '' }}</span>
              </div>
              <div class="flex items-center gap-3 mt-3">
                <UBadge v-if="selectedRecipe.productName" color="primary" variant="soft" size="sm">
                  <UIcon name="i-lucide-box" class="w-3 h-3 mr-1" />
                  {{ selectedRecipe.productName }}
                </UBadge>
                <UBadge :color="canPrepare ? 'green' : 'red'" variant="soft" size="sm">
                  <UIcon :name="canPrepare ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'" class="w-3 h-3 mr-1" />
                  {{ canPrepare ? 'Preparable' : 'Stock insuficiente' }}
                </UBadge>
              </div>
            </div>
          </div>

          <!-- Ingredients table -->
          <UCard :ui="{ body: { padding: 'p-0' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <UIcon name="i-lucide-list" class="w-4 h-4 text-gray-400" />
                  Ingredientes
                </h3>
                <span class="text-xs text-gray-500">Coste estimado: <strong class="text-gray-900 dark:text-white">{{ formatEur(totalCost) }}</strong></span>
              </div>
            </template>

            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase">Ingrediente</th>
                  <th class="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase">Necesario</th>
                  <th class="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase">Disponible</th>
                  <th class="text-center px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase">Estado</th>
                  <th class="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase pr-4">Coste</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="ing in selectedRecipe.ingredients" :key="ing.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/20">
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {{ ing.warehouseItemName || 'Desconocido' }}
                  </td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    {{ ing.quantity }} {{ warehouseUnitLabels[ing.unit as keyof typeof warehouseUnitLabels] || ing.unit }}
                  </td>
                  <td class="px-4 py-3 text-right">
                    <span :class="ingredientAvailability(ing).enough ? 'text-green-600' : 'text-red-600'">
                      {{ ingredientAvailability(ing).available.toFixed(2) }} {{ warehouseUnitLabels[ing.unit as keyof typeof warehouseUnitLabels] || ing.unit }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <UBadge v-if="ingredientAvailability(ing).enough" color="green" variant="subtle" size="xs">OK</UBadge>
                    <UBadge v-else-if="ingredientAvailability(ing).low" color="red" variant="subtle" size="xs">Bajo</UBadge>
                    <UBadge v-else color="yellow" variant="subtle" size="xs">Justo</UBadge>
                  </td>
                  <td class="px-4 py-3 text-right pr-4 text-gray-600 dark:text-gray-400">
                    {{ formatEur((store.getWarehouseItemById(ing.warehouseItemId)?.costPerUnit ?? 0) * ing.quantity) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </UCard>

          <!-- Edit recipe button -->
          <div class="flex justify-end">
            <UButton icon="i-lucide-pencil" color="primary" variant="soft" size="sm" label="Editar receta" @click="openEditRecipe" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="flex-1 flex items-center justify-center p-8 h-full">
          <div class="text-center max-w-sm">
            <UIcon name="i-lucide-book-open" class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Selecciona una receta</h3>
            <p class="text-sm text-gray-500">Haz clic en una receta del panel lateral para ver sus ingredientes y disponibilidad del almacén.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ Edit / New recipe modal ═══ -->
  <UModal v-model="showEditRecipeModal" :ui="{ width: 'sm:max-w-2xl' }">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', body: { padding: 'p-0' } }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ isNewRecipe ? 'Nueva receta' : 'Editar receta' }}</h3>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="showEditRecipeModal = false" />
        </div>
      </template>

      <div class="overflow-y-auto max-h-[70vh]">
        <!-- ── Section 1: Image + basic info ── -->
        <div class="p-5 space-y-4">
          <div class="flex gap-4">
            <!-- Image preview -->
            <div class="flex-shrink-0">
              <div class="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <img v-if="editForm.image" :src="editForm.image" class="w-full h-full object-cover" @error="editForm.image = ''" />
                <UIcon v-else name="i-lucide-image" class="w-8 h-8 text-gray-300" />
              </div>
              <p class="text-[10px] text-gray-400 text-center mt-1">Vista previa</p>
            </div>
            <!-- Name + description -->
            <div class="flex-1 space-y-3">
              <UFormGroup label="Nombre de la receta">
                <UInput v-model="editForm.name" placeholder="Ej: Hamburguesa Clásica" size="sm" />
              </UFormGroup>
              <UFormGroup label="Descripción">
                <UTextarea v-model="editForm.description" placeholder="Describe brevemente la receta…" :rows="2" size="sm" />
              </UFormGroup>
            </div>
          </div>

          <!-- Image URL -->
          <UFormGroup label="URL de la imagen">
            <UInput v-model="editForm.image" placeholder="https://images.unsplash.com/…" size="sm" icon="i-lucide-image" />
          </UFormGroup>

          <!-- Status + yield row -->
          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="Estado">
              <USelectMenu v-model="editForm.status" :options="[{ label: 'Activa', value: 'active' }, { label: 'Borrador', value: 'draft' }]" value-attribute="value" size="sm" />
            </UFormGroup>
            <UFormGroup label="Porciones (rinde)">
              <UInput v-model.number="editForm.yield" type="number" min="1" size="sm" />
            </UFormGroup>
          </div>
        </div>

        <div class="border-t border-gray-100 dark:border-gray-800" />

        <!-- ── Section 2: Linked product ── -->
        <div class="p-5 space-y-3">
          <h4 class="text-[13px] font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <UIcon name="i-lucide-box" class="w-4 h-4 text-gray-400" /> Producto vinculado
          </h4>
          <div class="relative">
            <UInput
              v-model="productSearch"
              icon="i-lucide-search"
              placeholder="Buscar producto del catálogo…"
              size="sm"
              :trailing-icon="editForm.productId ? 'i-lucide-x' : undefined"
              @focus="showProductDropdown = true"
              @input="showProductDropdown = true"
              @blur="setTimeout(() => showProductDropdown = false, 150)"
              @click:trailing="clearProduct"
            />
            <div v-if="showProductDropdown && filteredProducts.length > 0" class="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-44 overflow-y-auto">
              <button
                v-for="p in filteredProducts" :key="p.id"
                class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                @click="selectProduct(p)"
              >
                <img v-if="p.image" :src="p.image" class="w-8 h-8 rounded object-cover flex-shrink-0" />
                <div v-else class="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-lucide-package" class="w-4 h-4 text-gray-400" />
                </div>
                <div class="min-w-0">
                  <div class="text-[13px] font-medium text-gray-900 dark:text-white truncate">{{ p.name }}</div>
                  <div class="text-[11px] text-gray-500">{{ p.category }}</div>
                </div>
                <UIcon v-if="editForm.productId === String(p.id)" name="i-lucide-check" class="w-4 h-4 text-primary-500 ml-auto flex-shrink-0" />
              </button>
            </div>
          </div>
          <div v-if="editForm.productId" class="flex items-center gap-2 text-[12px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
            <UIcon name="i-lucide-check-circle" class="w-4 h-4 flex-shrink-0" />
            Vinculado a <strong class="ml-1">{{ editForm.productName }}</strong>
          </div>
        </div>

        <div class="border-t border-gray-100 dark:border-gray-800" />

        <!-- ── Section 3: Ingredients ── -->
        <div class="p-5 space-y-3">
          <h4 class="text-[13px] font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <UIcon name="i-lucide-list" class="w-4 h-4 text-gray-400" /> Ingredientes
          </h4>

          <!-- Ingredient search -->
          <div class="relative">
            <UInput
              v-model="ingredientSearch"
              icon="i-lucide-search"
              placeholder="Añadir ingrediente del almacén…"
              size="sm"
              @focus="showIngredientDropdown = true"
              @input="showIngredientDropdown = true"
              @blur="setTimeout(() => showIngredientDropdown = false, 150)"
            />
            <div v-if="showIngredientDropdown && ingredientSearch" class="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-52 overflow-y-auto">
              <button
                v-for="item in filteredWarehouseItems" :key="item.id"
                class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                @click="addIngredient(item)"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-package" class="w-4 h-4 text-gray-400" />
                  <span class="text-[13px] font-medium text-gray-900 dark:text-white">{{ item.name }}</span>
                </div>
                <span class="text-[11px] text-gray-500">{{ warehouseUnitLabels[item.unit as keyof typeof warehouseUnitLabels] || item.unit }}</span>
              </button>
              <!-- No results: offer to go buy -->
              <div v-if="filteredWarehouseItems.length === 0" class="px-3 py-3 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-[13px] text-gray-500">
                  <UIcon name="i-lucide-search-x" class="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>«{{ ingredientSearch }}» no está en el almacén</span>
                </div>
                <UButton
                  icon="i-lucide-shopping-cart"
                  size="xs"
                  color="primary"
                  variant="soft"
                  label="Pedir ahora"
                  @click="router.push(`/estudio/compra?q=${encodeURIComponent(ingredientSearch)}`)"
                />
              </div>
            </div>
          </div>

          <!-- Ingredient list -->
          <div v-if="editIngredients.length > 0" class="space-y-2">
            <div
              v-for="(ing, idx) in editIngredients" :key="ing.warehouseItemId"
              class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2"
            >
              <span class="flex-1 text-[13px] font-medium text-gray-900 dark:text-white truncate">{{ getWarehouseName(ing.warehouseItemId) }}</span>
              <UInput v-model.number="ing.quantity" type="number" step="0.01" size="xs" class="w-20" />
              <span class="text-[12px] text-gray-500 w-12 text-right">{{ warehouseUnitLabels[ing.unit as keyof typeof warehouseUnitLabels] || ing.unit }}</span>
              <UButton icon="i-lucide-x" color="gray" variant="ghost" size="2xs" @click="removeIngredient(idx)" />
            </div>
          </div>
          <p v-else class="text-[12px] text-gray-400 text-center py-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            Sin ingredientes. Busca arriba para añadir.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <span class="text-[12px] text-gray-500">{{ editIngredients.length }} ingrediente{{ editIngredients.length !== 1 ? 's' : '' }}</span>
          <div class="flex gap-3">
            <UButton color="gray" variant="ghost" @click="showEditRecipeModal = false">Cancelar</UButton>
            <UButton color="black" :disabled="!editForm.name.trim()" @click="saveRecipe">{{ isNewRecipe ? 'Crear receta' : 'Guardar cambios' }}</UButton>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
