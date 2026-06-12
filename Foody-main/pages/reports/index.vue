<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({ layout: 'dashboard' })

// Mock real-world data showing cost vs price vs sales
const menuItems = ref([
  { id: 1, name: 'Doble Smash Bacon', cost: 4.80, price: 15.00, sales_monthly: 450, trend: 'up' },
  { id: 2, name: 'Truffle Mushroom', cost: 6.50, price: 14.00, sales_monthly: 120, trend: 'down' },
  { id: 3, name: 'Menú Infantil', cost: 1.50, price: 8.00, sales_monthly: 90, trend: 'up' },
  { id: 4, name: 'Cerveza Artesana', cost: 1.00, price: 4.50, sales_monthly: 600, trend: 'up' },
  { id: 5, name: 'Hamburguesa Clásica', cost: 3.50, price: 12.50, sales_monthly: 380, trend: 'neutral' },
  { id: 6, name: 'Nachos Caseros', cost: 2.20, price: 10.00, sales_monthly: 300, trend: 'up' },
  { id: 7, name: 'Ensalada César', cost: 2.50, price: 9.50, sales_monthly: 85, trend: 'down' },
  { id: 8, name: 'Costillar BBQ', cost: 9.50, price: 18.00, sales_monthly: 60, trend: 'down' },
  { id: 9, name: 'Boniato Frito (Sweet Potato)', cost: 0.90, price: 4.50, sales_monthly: 410, trend: 'up' },
  { id: 10, name: 'Volcán de Chocolate', cost: 1.80, price: 6.50, sales_monthly: 150, trend: 'neutral' }
])

// Enrich data with profitability metrics
const analyzedItems = computed(() => {
  return menuItems.value.map(item => {
    const profitMarginValue = item.price - item.cost
    const profitMarginPercent = (profitMarginValue / item.price) * 100
    
    // Categorize based on BCG Matrix rules (simplified for hospitality)
    // Margin avg breakpoint ~ 70%
    // Sales avg breakpoint ~ 250 units
    let category = ''
    if (profitMarginPercent >= 70 && item.sales_monthly >= 250) category = 'Estrella'
    else if (profitMarginPercent < 70 && item.sales_monthly >= 250) category = 'Vaca Lechera'
    else if (profitMarginPercent >= 70 && item.sales_monthly < 250) category = 'Incógnita'
    else category = 'Perro'

    return {
      ...item,
      profitValue: profitMarginValue,
      profitPercent: profitMarginPercent,
      category
    }
  }).sort((a, b) => b.profitValue * b.sales_monthly - a.profitValue * a.sales_monthly) // Sort by total profit generated
})

// Metrics for the matrix grid positioning
const maxSales = Math.max(...menuItems.value.map(i => i.sales_monthly)) + 50
const minSales = 0
const maxMargin = 100 // %
const minMargin = 40  // % (Adjusted bounds to expand dots visually)

const getPositionStyle = (margin: number, sales: number) => {
  // Map margin to X axis (Left to Right)
  const xPos = ((margin - minMargin) / (maxMargin - minMargin)) * 100
  // Map sales to Y axis (Bottom to Top)
  const yPos = 100 - ((sales - minSales) / (maxSales - minSales)) * 100
  
  return {
    left: `${Math.max(0, Math.min(100, xPos))}%`,
    top: `${Math.max(0, Math.min(100, yPos))}%`
  }
}

// Columns for the Deep Analysis Table
const columns = [
  { key: 'name', label: 'Plato', sortable: true },
  { key: 'cost_price', label: 'Coste / PrecioVenta', sortable: false },
  { key: 'profitPercent', label: 'Margen (%)', sortable: true },
  { key: 'sales_monthly', label: 'Ventas (Mes)', sortable: true },
  { key: 'total_profit', label: 'Bº Bruto Total', sortable: true },
  { key: 'category', label: 'Resolución' } // The final verdict
]

const formatMoney = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

// Quick KPIs
const totalMonthlyProfit = computed(() => analyzedItems.value.reduce((acc, obj) => acc + (obj.profitValue * obj.sales_monthly), 0))
const totalMonthlyRevenue = computed(() => analyzedItems.value.reduce((acc, obj) => acc + (obj.price * obj.sales_monthly), 0))
const avgMarginPercent = computed(() => (totalMonthlyProfit.value / totalMonthlyRevenue.value) * 100)

// Algorithm Actionable Alerts based on categorizations (Top extremes)
const topDog = computed(() => [...analyzedItems.value].sort((a,b) => a.sales_monthly - b.sales_monthly).find(i => i.category === 'Perro'))
const topCow = computed(() => [...analyzedItems.value].sort((a,b) => b.sales_monthly - a.sales_monthly).find(i => i.category === 'Vaca Lechera'))
const topStar = computed(() => [...analyzedItems.value].sort((a,b) => b.profitValue - a.profitValue).find(i => i.category === 'Estrella'))

// Table Search Filter
const searchMenuTable = ref('')
const filteredTableItems = computed(() => {
  if (!searchMenuTable.value) return analyzedItems.value
  return analyzedItems.value.filter(item => 
    item.name.toLowerCase().includes(searchMenuTable.value.toLowerCase()) || 
    item.category.toLowerCase().includes(searchMenuTable.value.toLowerCase())
  )
})
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    
    <!-- Premium Header -->
    <div>
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
        <UIcon name="i-lucide-line-chart" class="text-primary-500 w-6 h-6" />
        Inteligencia y Rentabilidad
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">Descubre exactamente de dónde vienen tus beneficios. Cruza volumen de pedidos con tu margen real para saber qué platos debes potenciar y cuáles modificar.</p>
    </div>

    <!-- Advanced KPI Core Dashboard -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard :ui="{ shadow: 'shadow-sm', body: { padding: 'p-5 py-6' } }">
        <div class="flex items-start justify-between">
           <div>
             <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Beneficio Bruto (Mensual)</p>
             <h4 class="text-3xl font-extrabold text-gray-900 dark:text-white">{{ formatMoney(totalMonthlyProfit) }}</h4>
           </div>
           <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
             <UIcon name="i-lucide-piggy-bank" class="w-6 h-6" />
           </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-semibold text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-md dark:bg-green-900/30 dark:text-green-400">
           <UIcon name="i-lucide-trending-up" class="w-4 h-4 mr-1" /> +12% vs. Mes Anterior
        </div>
      </UCard>
      
      <UCard :ui="{ shadow: 'shadow-sm', body: { padding: 'p-5 py-6' } }">
        <div class="flex items-start justify-between">
           <div>
             <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Facturación Total (Ventas)</p>
             <h4 class="text-3xl font-extrabold text-gray-900 dark:text-white">{{ formatMoney(totalMonthlyRevenue) }}</h4>
           </div>
           <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
             <UIcon name="i-lucide-receipt" class="w-6 h-6" />
           </div>
        </div>
        <div class="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium pt-1">
           Proyección sólida para este trimestre.
        </div>
      </UCard>
      
      <UCard :ui="{ shadow: 'shadow-sm', body: { padding: 'p-5 py-6' } }">
        <div class="flex items-start justify-between">
           <div>
             <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Margen Global del Menú</p>
             <h4 class="text-3xl font-extrabold text-gray-900 dark:text-white">{{ avgMarginPercent.toFixed(1) }}<span class="text-lg text-gray-500 ml-1">%</span></h4>
           </div>
           <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400">
             <UIcon name="i-lucide-pie-chart" class="w-6 h-6" />
           </div>
        </div>
        <div class="mt-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
           <div class="bg-primary-500 h-full" :style="`width: ${avgMarginPercent}%`"></div>
        </div>
        <p class="text-xs text-gray-400 mt-2 font-medium">Equivale a 0.{{ Math.round(avgMarginPercent) }} céntimos de beneficio por euro.</p>
      </UCard>
    </div>

    <!-- The Boston Consulting Group Engineering Dashboard Matrix -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
      <div class="xl:col-span-8">
        <UCard :ui="{ header: { padding: 'p-4 px-6' }, body: { padding: 'p-6' } }">
          <template #header>
             <div class="flex justify-between items-center">
                <div>
                   <h3 class="font-bold text-lg text-gray-900 dark:text-white inline-flex items-center gap-2">
                     <UIcon name="i-lucide-target" class="w-5 h-5 text-purple-500" />
                     Matriz de Popularidad vs. Rentabilidad
                   </h3>
                   <p class="text-xs text-gray-500 ml-7 mt-0.5 font-medium uppercase tracking-wider">Metodología Boston (BCG Matrix)</p>
                </div>
                <div class="flex gap-2">
                   <UBadge color="gray" variant="soft" size="xs">Eje X: Margen de Beneficio %</UBadge>
                   <UBadge color="gray" variant="soft" size="xs">Eje Y: Pedidos / Popularidad</UBadge>
                </div>
             </div>
          </template>
          
          <!-- Plotted Graph Grid Area -->
          <div class="relative w-full h-[450px] bg-gray-50/50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden group">
             
             <!-- Grid Crosshairs (Median lines) -->
             <div class="absolute inset-x-0 top-1/2 h-px bg-gray-300 dark:bg-gray-600 border-dashed z-0"></div>
             <div class="absolute inset-y-0 left-1/2 w-px bg-gray-300 dark:bg-gray-600 border-dashed z-0"></div>

             <!-- Quadrant Background Tints and Labels -->
             <div class="absolute top-0 right-0 w-1/2 h-1/2 bg-green-500/5 dark:bg-green-400/5 flex p-3 justify-end items-start pointer-events-none z-0">
               <span class="text-green-700/50 dark:text-green-400/30 uppercase font-black tracking-widest text-sm flex items-center gap-1.5">Estrellas <UIcon name="i-lucide-star" /></span>
             </div>
             <div class="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500/5 dark:bg-blue-400/5 flex p-3 justify-start items-start pointer-events-none z-0">
               <span class="text-blue-700/50 dark:text-blue-400/30 uppercase font-black tracking-widest text-sm flex items-center gap-1.5"><UIcon name="i-lucide-coins" /> Vacas lecheras</span>
             </div>
             <div class="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/5 dark:bg-purple-400/5 flex p-3 justify-end items-end pointer-events-none z-0">
               <span class="text-purple-700/50 dark:text-purple-400/30 uppercase font-black tracking-widest text-sm flex items-center gap-1.5">Incógnitas <UIcon name="i-lucide-help-circle" /></span>
             </div>
             <div class="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-500/5 dark:bg-red-400/5 flex p-3 justify-start items-end pointer-events-none z-0">
               <span class="text-red-700/50 dark:text-red-400/30 uppercase font-black tracking-widest text-sm flex items-center gap-1.5"><UIcon name="i-lucide-alert-triangle" /> Perros / Retirar</span>
             </div>

             <!-- Data Points -->
             <div v-for="item in analyzedItems" :key="item.id" 
                  class="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white dark:border-gray-900 cursor-pointer shadow-md hover:scale-150 transition-transform duration-300 flex items-center justify-center z-10 group/dot"
                  :class="{
                    'bg-green-500 z-30': item.category === 'Estrella',
                    'bg-blue-500 z-20': item.category === 'Vaca Lechera',
                    'bg-purple-500 z-20': item.category === 'Incógnita',
                    'bg-red-500 z-10': item.category === 'Perro',
                  }"
                  :style="getPositionStyle(item.profitPercent, item.sales_monthly)"
             >
                <!-- Tooltip Bubble on Hover -->
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-xl shadow-xl p-3 opacity-0 pointer-events-none transform translate-y-2 group-hover/dot:opacity-100 group-hover/dot:translate-y-0 transition-all duration-200 z-50">
                   <div class="font-bold text-sm mb-1 leading-tight">{{ item.name }}</div>
                   <div class="grid grid-cols-2 gap-1 text-[11px] font-medium text-gray-300 dark:text-gray-600 border-t border-gray-700 dark:border-gray-200 pt-1 mt-1">
                      <div>Margen:</div>
                      <div class="text-right text-white dark:text-black">{{ Math.round(item.profitPercent) }}%</div>
                      <div>Ventas:</div>
                      <div class="text-right text-white dark:text-black">{{ item.sales_monthly }} uds.</div>
                   </div>
                   <!-- Triangle arrow -->
                   <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900 dark:border-t-white"></div>
                </div>
             </div>
          </div>

          <!-- Legend Axis -->
          <div class="flex justify-between items-center mt-3 text-xs text-gray-500 font-medium px-4">
             <span>Bajo Margen de Beneficio (< 70%)</span>
             <span>Exceso de Margen (> 70%)</span>
          </div>

        </UCard>
      </div>

      <!-- Actionable Insights Sidebar -->
      <div class="xl:col-span-4 space-y-4">
         <!-- Instruction Card for the Boss -->
         <UCard class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
           <h3 class="font-bold text-lg mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
             <UIcon name="i-lucide-lightbulb" class="text-yellow-500 w-5 h-5" />
             Estrategia Recomendada
           </h3>
           <div class="space-y-4 text-sm mt-4 text-gray-600 dark:text-gray-400">
              <div class="flex items-start gap-3">
                 <div class="mt-0.5 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0" />
                 <div><strong class="text-gray-900 dark:text-white font-semibold">Estrellas:</strong> Protégelos. Son rentables y gustan mucho. Dales visibilidad en la carta. Mantenlos igual.</div>
              </div>
              <div class="flex items-start gap-3">
                 <div class="mt-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0" />
                 <div><strong class="text-gray-900 dark:text-white font-semibold">Vacas Lecheras:</strong> Se venden solos pero dejan poco margen. Súbeles el precio 0.50€ o reduce un poco la porción.</div>
              </div>
              <div class="flex items-start gap-3">
                 <div class="mt-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full shrink-0" />
                 <div><strong class="text-gray-900 dark:text-white font-semibold">Incógnitas:</strong> Dan muchísimo dinero pero nadie los pide. Regala muestras, haz fotos pro o cambiales el nombre.</div>
              </div>
              <div class="flex items-start gap-3">
                 <div class="mt-0.5 w-2.5 h-2.5 bg-red-500 rounded-full shrink-0" />
                 <div><strong class="text-gray-900 dark:text-white font-semibold">Perros:</strong> Gastan ingredientes, no dan dinero y no se venden. Plantéate eliminarlos del menú.</div>
              </div>
           </div>
         </UCard>
         
         <!-- Alertas y Oportunidades del Algoritmo -->
         <UCard class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden mt-6">
           <div class="flex items-center justify-between mb-4">
             <h3 class="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
               <UIcon name="i-lucide-activity" class="text-primary-500 w-5 h-5" />
               Alertas del Algoritmo
             </h3>
             <UBadge color="primary" variant="subtle" size="sm" class="animate-pulse">Novedades</UBadge>
           </div>
           
           <div class="space-y-3">
             <div v-if="topDog" class="flex gap-3 items-start p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
               <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                 <UIcon name="i-lucide-alert-triangle" class="w-4 h-4" />
               </div>
               <div>
                  <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{{ topDog.name }}</h4>
                  <p class="text-[13px] text-gray-600 dark:text-gray-400 leading-snug">Riesgo crítico. Margen bajo ({{ Math.round(topDog.profitPercent) }}%) y ventas limitadas. Revisa su continuidad.</p>
               </div>
             </div>

             <div v-if="topCow" class="flex gap-3 items-start p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
               <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                 <UIcon name="i-lucide-trending-up" class="w-4 h-4" />
               </div>
               <div>
                  <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{{ topCow.name }}</h4>
                  <p class="text-[13px] text-gray-600 dark:text-gray-400 leading-snug">Alta demanda ({{ topCow.sales_monthly }} uds). Una subida mínima de precio del +0,20€ te sumaría rentabilidad pasiva.</p>
               </div>
             </div>
             
             <div v-if="topStar" class="flex gap-3 items-start p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
               <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 shrink-0 mt-0.5">
                 <UIcon name="i-lucide-star" class="w-4 h-4" />
               </div>
               <div>
                  <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{{ topStar.name }}</h4>
                  <p class="text-[13px] text-gray-600 dark:text-gray-400 leading-snug">Tu plato estrella absoluto por beneficio conjunto. Ponlo destacado al principio de tu visual de carta.</p>
               </div>
             </div>
           </div>
         </UCard>

      </div>
    </div>

    <!-- Data Table Breakdown -->
    <div class="mt-4 mb-12">
      <UCard :ui="{ header: { padding: 'px-6 py-4' }, body: { padding: 'p-0' } }" class="shadow-sm border border-gray-200 dark:border-gray-800 mb-4">
        <template #header>
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 class="font-bold text-gray-900 dark:text-white">Análisis Financiero de Platos</h3>
            <div class="flex items-center gap-3">
              <UInput v-model="searchMenuTable" icon="i-lucide-search" placeholder="Filtra por plato o categoría..." size="sm" class="w-64" color="gray" />
              <UButton color="black" icon="i-lucide-download" variant="soft" size="sm">Exportar</UButton>
            </div>
          </div>
        </template>
        
        <UTable 
          :columns="columns" 
          :rows="filteredTableItems"
          class="w-full"
          :ui="{
            wrapper: 'max-h-[500px] overflow-y-auto overflow-x-auto border-t border-gray-200 dark:border-gray-800',
            th: {
              base: 'sticky top-0 z-20 backdrop-blur-md bg-white/75 dark:bg-gray-900/75 shadow-[0_1px_0_hsl(var(--bc))] dark:shadow-[0_1px_0_hsl(var(--bc))]'
            },
            td: { padding: 'px-4 py-4', base: 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800/50' }
          }"
        >
             <template #name-data="{ row }">
                 <span class="font-bold text-gray-900 dark:text-white">{{ row.name }}</span>
               </template>
               
               <template #cost_price-data="{ row }">
                 <div class="flex flex-col">
                   <span class="text-xs text-gray-500 line-through decoration-red-400">Coste: {{ formatMoney(row.cost) }}</span>
                   <span class="font-medium text-sm text-gray-900 dark:text-white">PVP: {{ formatMoney(row.price) }}</span>
                 </div>
               </template>

               <template #profitPercent-data="{ row }">
                 <UBadge :color="row.profitPercent >= 70 ? 'green' : 'red'" variant="subtle" size="xs" :ui="{ rounded: 'rounded-md' }" class="font-bold">
                   {{ row.profitPercent.toFixed(1) }}%
                 </UBadge>
               </template>

               <template #total_profit-data="{ row }">
                 <span class="font-extrabold text-gray-900 dark:text-white">{{ formatMoney(row.profitValue * row.sales_monthly) }}</span>
               </template>

               <template #category-data="{ row }">
                 <div class="flex items-center gap-2">
                   <span class="w-2.5 h-2.5 rounded-full shadow-sm" :class="{
                     'bg-green-500': row.category === 'Estrella',
                     'bg-blue-500': row.category === 'Vaca Lechera',
                     'bg-purple-500': row.category === 'Incógnita',
                     'bg-red-500': row.category === 'Perro',
                   }"></span>
                   <span class="font-semibold text-xs tracking-wide">{{ row.category }}</span>
                 </div>
               </template>
             </UTable>
      </UCard>
    </div>
    
  </div>
</template>
