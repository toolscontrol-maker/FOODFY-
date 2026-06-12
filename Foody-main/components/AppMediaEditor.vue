<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useMediaStore, type MediaItem } from '~/stores/useMediaStore'

const props = defineProps<{ item: MediaItem }>()
const emit = defineEmits<{
  back: []
  saved: [item: MediaItem]
}>()

const mediaStore = useMediaStore()
const toast = useToast()

/* ════════════════════════════════════════
   CANVAS + IMAGE LOADING
════════════════════════════════════════ */
const canvasEl = ref<HTMLCanvasElement | null>(null)
const canvasWrapper = ref<HTMLDivElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let originalDataUrl = ''
let loadedImg: HTMLImageElement | null = null

const imgNaturalW = ref(0)
const imgNaturalH = ref(0)
const isTainted = ref(false)

const loadImageToCanvas = (src: string): Promise<void> =>
  new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!canvasEl.value) return
      canvasEl.value.width = img.naturalWidth
      canvasEl.value.height = img.naturalHeight
      ctx = canvasEl.value.getContext('2d')!
      ctx.clearRect(0, 0, img.naturalWidth, img.naturalHeight)
      ctx.drawImage(img, 0, 0)
      imgNaturalW.value = img.naturalWidth
      imgNaturalH.value = img.naturalHeight
      loadedImg = img
      isTainted.value = false
      try { canvasEl.value.toDataURL() } catch { isTainted.value = true }
      resolve()
    }
    img.onerror = () => {
      // If crossOrigin anonymous fails, try without it (for data URLs)
      const img2 = new Image()
      img2.onload = () => {
        if (!canvasEl.value) return
        canvasEl.value.width = img2.naturalWidth
        canvasEl.value.height = img2.naturalHeight
        ctx = canvasEl.value.getContext('2d')!
        ctx.drawImage(img2, 0, 0)
        imgNaturalW.value = img2.naturalWidth
        imgNaturalH.value = img2.naturalHeight
        loadedImg = img2
        isTainted.value = false
        try { canvasEl.value.toDataURL() } catch { isTainted.value = true }
        resolve()
      }
      img2.onerror = () => { isTainted.value = true; resolve() }
      img2.src = src
    }
    img.src = src
  })

onMounted(async () => {
  await nextTick()
  await loadImageToCanvas(props.item.url)
  originalDataUrl = canvasEl.value?.toDataURL() ?? props.item.url
  resizeW.value = imgNaturalW.value
  resizeH.value = imgNaturalH.value
  pushHistory()
  isDirty.value = false
})

/* ════════════════════════════════════════
   HISTORY — UNDO / REDO
════════════════════════════════════════ */
const history = ref<string[]>([])
const histIdx = ref(-1)
const MAX_HISTORY = 20

const pushHistory = () => {
  if (!canvasEl.value || isTainted.value) return
  const snap = canvasEl.value.toDataURL()
  history.value = history.value.slice(0, histIdx.value + 1)
  history.value.push(snap)
  if (history.value.length > MAX_HISTORY) history.value.shift()
  histIdx.value = history.value.length - 1
}

const restoreDataUrl = (dataUrl: string) =>
  new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      if (!canvasEl.value || !ctx) return
      canvasEl.value.width = img.naturalWidth
      canvasEl.value.height = img.naturalHeight
      ctx = canvasEl.value.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      imgNaturalW.value = img.naturalWidth
      imgNaturalH.value = img.naturalHeight
      resolve()
    }
    img.src = dataUrl
  })

const canUndo = computed(() => histIdx.value > 0)
const canRedo = computed(() => histIdx.value < history.value.length - 1)

const undo = async () => {
  if (!canUndo.value) return
  histIdx.value--
  await restoreDataUrl(history.value[histIdx.value])
}
const redo = async () => {
  if (!canRedo.value) return
  histIdx.value++
  await restoreDataUrl(history.value[histIdx.value])
}

/* ════════════════════════════════════════
   DIRTY STATE
════════════════════════════════════════ */
const isDirty = ref(false)
const markDirty = () => { isDirty.value = true }

/* ════════════════════════════════════════
   INFO PANEL
════════════════════════════════════════ */
const imgName = ref(props.item.name)
const imgAltText = ref(props.item.altText ?? '')
watch([imgName, imgAltText], () => markDirty())

const formattedDate = computed(() => {
  const d = new Date(props.item.uploadedAt)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
})

const formattedSize = computed(() => {
  const s = props.item.size
  if (!s) return '—'
  if (s < 1024) return `${s} B`
  if (s < 1024 * 1024) return `${(s / 1024).toFixed(0)} KB`
  return `${(s / (1024 * 1024)).toFixed(2)} MB`
})

/* ════════════════════════════════════════
   ACCORDION SECTIONS
════════════════════════════════════════ */
type Section = 'info' | 'crop' | 'resize' | 'draw' | 'bg' | 'generate'
const openSection = ref<Section>('info')
const toggleSection = (s: Section) => { openSection.value = openSection.value === s ? 'info' : s }

/* ════════════════════════════════════════
   FOCAL POINT
════════════════════════════════════════ */
const focalPoint = ref(props.item.focalPoint ?? null)
const focalMode = ref(false)

const onCanvasClick = (e: MouseEvent) => {
  if (!canvasEl.value || openSection.value === 'draw') return
  const rect = canvasEl.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  focalPoint.value = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
  markDirty()
}

const focalIndicatorStyle = computed(() => {
  if (!focalPoint.value) return {}
  return {
    left: `${focalPoint.value.x * 100}%`,
    top: `${focalPoint.value.y * 100}%`,
    transform: 'translate(-50%, -50%)',
  }
})

/* ════════════════════════════════════════
   CROP & TRANSFORM
════════════════════════════════════════ */
const cropActive = computed(() => openSection.value === 'crop')
const cropAspect = ref<string>('original')
const cropZoom = ref(100)

const aspectRatios = [
  { label: 'Original', value: 'original' },
  { label: 'Cuadrado', value: '1:1' },
  { label: '3:2', value: '3:2' },
  { label: '5:4', value: '5:4' },
  { label: '7:5', value: '7:5' },
  { label: '16:9', value: '16:9' },
  { label: 'Forma libre', value: 'free' },
]

const cropRect = ref({ x: 0, y: 0, w: 100, h: 100 }) // percentage-based

const getAspectNum = (v: string): number | null => {
  if (v === 'original') return imgNaturalW.value / imgNaturalH.value
  if (v === 'free') return null
  if (v === '1:1') return 1
  const [a, b] = v.split(':').map(Number)
  return a / b
}

watch(cropAspect, (v) => {
  const ar = getAspectNum(v)
  if (ar === null) return
  const imgAr = imgNaturalW.value / imgNaturalH.value
  if (ar >= imgAr) {
    cropRect.value = { x: 0, y: 50 - (100 / ar * imgAr) / 2, w: 100, h: 100 / ar * imgAr }
  } else {
    cropRect.value = { x: 50 - (100 * ar / imgAr) / 2, y: 0, w: 100 * ar / imgAr, h: 100 }
  }
})

const applyCrop = () => {
  if (!canvasEl.value || !ctx) return
  const { x, y, w, h } = cropRect.value
  const px = (imgNaturalW.value * x) / 100
  const py = (imgNaturalH.value * y) / 100
  const pw = (imgNaturalW.value * w) / 100
  const ph = (imgNaturalH.value * h) / 100
  const data = ctx.getImageData(px, py, pw, ph)
  canvasEl.value.width = pw
  canvasEl.value.height = ph
  ctx = canvasEl.value.getContext('2d')!
  ctx.putImageData(data, 0, 0)
  imgNaturalW.value = pw
  imgNaturalH.value = ph
  cropRect.value = { x: 0, y: 0, w: 100, h: 100 }
  pushHistory()
  markDirty()
}

const flipHorizontal = () => {
  if (!canvasEl.value || !ctx) return
  const tmp = document.createElement('canvas')
  tmp.width = canvasEl.value.width; tmp.height = canvasEl.value.height
  const tCtx = tmp.getContext('2d')!
  tCtx.drawImage(canvasEl.value, 0, 0)
  ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height)
  ctx.save(); ctx.translate(canvasEl.value.width, 0); ctx.scale(-1, 1)
  ctx.drawImage(tmp, 0, 0); ctx.restore()
  pushHistory(); markDirty()
}

const flipVertical = () => {
  if (!canvasEl.value || !ctx) return
  const tmp = document.createElement('canvas')
  tmp.width = canvasEl.value.width; tmp.height = canvasEl.value.height
  const tCtx = tmp.getContext('2d')!
  tCtx.drawImage(canvasEl.value, 0, 0)
  ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height)
  ctx.save(); ctx.translate(0, canvasEl.value.height); ctx.scale(1, -1)
  ctx.drawImage(tmp, 0, 0); ctx.restore()
  pushHistory(); markDirty()
}

const rotate90 = () => {
  if (!canvasEl.value || !ctx) return
  const tmp = document.createElement('canvas')
  tmp.width = canvasEl.value.height; tmp.height = canvasEl.value.width
  const tCtx = tmp.getContext('2d')!
  tCtx.translate(tmp.width / 2, tmp.height / 2)
  tCtx.rotate(Math.PI / 2)
  tCtx.drawImage(canvasEl.value, -canvasEl.value.width / 2, -canvasEl.value.height / 2)
  canvasEl.value.width = tmp.width; canvasEl.value.height = tmp.height
  ctx = canvasEl.value.getContext('2d')!
  ctx.drawImage(tmp, 0, 0)
  imgNaturalW.value = canvasEl.value.width
  imgNaturalH.value = canvasEl.value.height
  pushHistory(); markDirty()
}

/* ════════════════════════════════════════
   RESIZE
════════════════════════════════════════ */
const resizeW = ref(0)
const resizeH = ref(0)
const resizeLocked = ref(true)

const onResizeWChange = () => {
  if (!resizeLocked.value) return
  const ar = imgNaturalH.value / imgNaturalW.value
  resizeH.value = Math.round(resizeW.value * ar)
}
const onResizeHChange = () => {
  if (!resizeLocked.value) return
  const ar = imgNaturalW.value / imgNaturalH.value
  resizeW.value = Math.round(resizeH.value * ar)
}

const applyResize = () => {
  if (!canvasEl.value || !ctx || resizeW.value <= 0 || resizeH.value <= 0) return
  const tmp = document.createElement('canvas')
  tmp.width = canvasEl.value.width; tmp.height = canvasEl.value.height
  tmp.getContext('2d')!.drawImage(canvasEl.value, 0, 0)
  canvasEl.value.width = resizeW.value; canvasEl.value.height = resizeH.value
  ctx = canvasEl.value.getContext('2d')!
  ctx.drawImage(tmp, 0, 0, resizeW.value, resizeH.value)
  imgNaturalW.value = resizeW.value; imgNaturalH.value = resizeH.value
  pushHistory(); markDirty()
}

/* ════════════════════════════════════════
   DRAW
════════════════════════════════════════ */
const drawColor = ref('#000000')
const drawSize = ref(8)
const isDrawing = ref(false)
let lastX = 0, lastY = 0

const monoColors = ['#000000', '#404040', '#808080', '#a0a0a0', '#d0d0d0', '#ffffff']
const stdColors = ['#ef4444', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#d946ef']
const customColorInput = ref<HTMLInputElement | null>(null)

const getCanvasPos = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
  const rect = canvasEl.value!.getBoundingClientRect()
  const scaleX = canvasEl.value!.width / rect.width
  const scaleY = canvasEl.value!.height / rect.height
  const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
}

const startDraw = (e: MouseEvent) => {
  if (openSection.value !== 'draw' || !ctx) return
  e.preventDefault()
  isDrawing.value = true
  const { x, y } = getCanvasPos(e)
  lastX = x; lastY = y
  ctx.beginPath()
  ctx.arc(x, y, drawSize.value / 2, 0, Math.PI * 2)
  ctx.fillStyle = drawColor.value
  ctx.fill()
}

const doDraw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx || openSection.value !== 'draw') return
  e.preventDefault()
  const { x, y } = getCanvasPos(e)
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.strokeStyle = drawColor.value
  ctx.lineWidth = drawSize.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
  lastX = x; lastY = y
}

const endDraw = () => {
  if (!isDrawing.value) return
  isDrawing.value = false
  pushHistory(); markDirty()
}

/* ════════════════════════════════════════
   BACKGROUND COLOR
════════════════════════════════════════ */
const bgColor = ref('#ffffff')
const applyBg = () => {
  if (!canvasEl.value || !ctx) return
  const tmp = document.createElement('canvas')
  tmp.width = canvasEl.value.width; tmp.height = canvasEl.value.height
  const tCtx = tmp.getContext('2d')!
  tCtx.fillStyle = bgColor.value
  tCtx.fillRect(0, 0, tmp.width, tmp.height)
  tCtx.drawImage(canvasEl.value, 0, 0)
  ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height)
  ctx.drawImage(tmp, 0, 0)
  pushHistory(); markDirty()
}

/* ════════════════════════════════════════
   SAVE / DISCARD / DOWNLOAD
════════════════════════════════════════ */
const saveImage = (asNew = false) => {
  if (!canvasEl.value) return
  const newUrl = isTainted.value ? props.item.url : canvasEl.value.toDataURL('image/png')
  const patch = { url: newUrl, name: imgName.value, altText: imgAltText.value, focalPoint: focalPoint.value ?? undefined }

  if (asNew) {
    const newItem = mediaStore.addItem({ ...patch, type: props.item.type })
    toast.add({ title: 'Guardado como nuevo', description: imgName.value, color: 'green' })
    isDirty.value = false
    emit('saved', newItem)
  } else {
    mediaStore.updateItem(props.item.id, patch)
    toast.add({ title: 'Imagen guardada', description: imgName.value, color: 'green' })
    isDirty.value = false
    emit('saved', { ...props.item, ...patch })
  }
}

const discardChanges = async () => {
  await loadImageToCanvas(originalDataUrl.startsWith('data:') ? originalDataUrl : props.item.url)
  imgName.value = props.item.name
  imgAltText.value = props.item.altText ?? ''
  focalPoint.value = props.item.focalPoint ?? null
  history.value = []
  histIdx.value = -1
  pushHistory()
  isDirty.value = false
  toast.add({ title: 'Cambios descartados', color: 'gray' })
}

const downloadImage = () => {
  if (!canvasEl.value) return
  try {
    const url = canvasEl.value.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = imgName.value || 'imagen.png'
    a.click()
  } catch {
    toast.add({ title: 'No se puede descargar', description: 'Imagen bloqueada por CORS', color: 'red' })
  }
}

/* ════════════════════════════════════════
   UNSAVED CHANGES WARNING
════════════════════════════════════════ */
const showExitWarning = ref(false)
const pendingExitAction = ref<(() => void) | null>(null)

const requestBack = () => {
  if (isDirty.value) {
    showExitWarning.value = true
    pendingExitAction.value = () => emit('back')
  } else {
    emit('back')
  }
}

const exitWarningDiscard = async () => {
  showExitWarning.value = false
  await discardChanges()
  pendingExitAction.value?.()
}

const exitWarningSave = () => {
  showExitWarning.value = false
  saveImage(false)
  pendingExitAction.value?.()
}

const exitWarningContinue = () => {
  showExitWarning.value = false
  pendingExitAction.value = null
}

/* expose for parent to intercept X close */
defineExpose({ isDirty, requestExit: requestBack })

/* ════════════════════════════════════════
   KEYBOARD SHORTCUTS
════════════════════════════════════════ */
const onKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveImage(false) }
}
onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))

/* ════════════════════════════════════════
   SAVE DROPDOWN ITEMS
════════════════════════════════════════ */
const saveMenuItems = computed(() => [[
  { label: 'Guardar como nuevo', icon: 'i-lucide-copy-plus', click: () => saveImage(true) },
]])
</script>

<template>
  <div class="flex flex-col bg-[#1a1a1a] text-white overflow-hidden" style="height: 100%">

    <!-- ══ TOP BAR ══ -->
    <div class="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-white/10">
      <!-- Back -->
      <button
        class="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        @click="requestBack"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        <span class="font-medium truncate max-w-[160px]">{{ imgName }}</span>
      </button>

      <span class="text-white/30 text-xs ml-1">1 de 1</span>

      <div class="flex-1" />

      <!-- Undo / Redo -->
      <button
        :disabled="!canUndo"
        class="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Deshacer (Ctrl+Z)"
        @click="undo"
      >
        <UIcon name="i-lucide-undo-2" class="w-4 h-4" />
      </button>
      <button
        :disabled="!canRedo"
        class="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Rehacer (Ctrl+Y)"
        @click="redo"
      >
        <UIcon name="i-lucide-redo-2" class="w-4 h-4" />
      </button>

      <!-- Divider -->
      <div class="w-px h-5 bg-white/20" />

      <!-- Descartar -->
      <button
        class="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
        :disabled="!isDirty"
        :class="!isDirty ? 'opacity-40 cursor-not-allowed' : ''"
        @click="discardChanges"
      >
        Descartar
      </button>

      <!-- Guardar (split button) -->
      <div class="flex items-stretch">
        <button
          class="px-3 py-1.5 text-sm font-semibold bg-white text-black rounded-l-md hover:bg-gray-100 transition-colors"
          @click="saveImage(false)"
        >
          Guardar
        </button>
        <UDropdown :items="saveMenuItems" :popper="{ placement: 'bottom-end' }">
          <button class="px-2 py-1.5 bg-white text-black rounded-r-md border-l border-black/10 hover:bg-gray-100 transition-colors">
            <UIcon name="i-lucide-chevron-down" class="w-3.5 h-3.5" />
          </button>
        </UDropdown>
      </div>

      <!-- Download -->
      <button
        class="p-1.5 rounded hover:bg-white/10 transition-colors"
        title="Descargar"
        @click="downloadImage"
      >
        <UIcon name="i-lucide-download" class="w-4 h-4 text-white/70" />
      </button>
    </div>

    <!-- ══ MAIN AREA ══ -->
    <div class="flex flex-1 overflow-hidden">

      <!-- Canvas Area -->
      <div ref="canvasWrapper" class="flex-1 flex flex-col items-center justify-center overflow-hidden bg-[#111] relative p-6">

        <!-- Tainted warning -->
        <div
          v-if="isTainted"
          class="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-yellow-500/90 text-black text-xs font-medium px-3 py-1.5 rounded-full shadow"
        >
          ⚠ Imagen de origen externo — edición de canvas limitada por CORS
        </div>

        <!-- Canvas wrapper with focal point overlay -->
        <div class="relative max-w-full max-h-full" style="line-height:0">
          <!-- Checkerboard + canvas -->
          <canvas
            ref="canvasEl"
            class="max-w-full max-h-[calc(100vh-200px)] block"
            :style="{
              cursor: openSection === 'draw' ? 'crosshair' : 'crosshair',
              background: 'repeating-conic-gradient(#444 0% 25%, #2a2a2a 0% 50%) 0 0 / 16px 16px',
            }"
            @click="onCanvasClick"
            @mousedown="startDraw"
            @mousemove="doDraw"
            @mouseup="endDraw"
            @mouseleave="endDraw"
          />

          <!-- Crop overlay handles -->
          <div
            v-if="cropActive"
            class="absolute inset-0 pointer-events-none"
            :style="{
              border: '2px dashed rgba(255,255,255,0.6)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
              left: cropRect.x + '%',
              top: cropRect.y + '%',
              width: cropRect.w + '%',
              height: cropRect.h + '%',
            }"
          >
            <!-- Corner handles -->
            <div class="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
            <div class="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
            <div class="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
            <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white" />
          </div>

          <!-- Focal point indicator -->
          <div
            v-if="focalPoint"
            class="absolute w-6 h-6 rounded-full border-2 border-white bg-blue-500/70 shadow-md pointer-events-none z-20"
            :style="focalIndicatorStyle"
          />
        </div>

        <!-- Focal point hint -->
        <div
          v-if="openSection !== 'draw' && openSection !== 'crop'"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[12px] px-3 py-1.5 rounded-full flex items-center gap-2 select-none"
        >
          <div class="w-3 h-3 rounded-full border border-white bg-blue-500 flex-shrink-0" />
          Haz clic en la imagen para establecer el punto focal
        </div>

        <!-- Zoom hint for crop -->
        <div v-if="cropActive" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 px-4 py-2 rounded-full">
          <span class="text-xs text-white/60">%</span>
          <input v-model.number="cropZoom" type="range" min="10" max="200" class="w-32 accent-white" />
          <button class="flex items-center gap-1 text-xs text-white/80 hover:text-white">
            <UIcon name="i-lucide-expand" class="w-3.5 h-3.5" />
            Expandir
          </button>
        </div>
      </div>

      <!-- ── Right Panel ── -->
      <div class="w-[260px] flex-shrink-0 border-l border-white/10 overflow-y-auto flex flex-col bg-[#1a1a1a]">

        <!-- INFORMACIÓN -->
        <div class="border-b border-white/10">
          <button
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
            @click="toggleSection('info')"
          >
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="w-4 h-4 text-white/50" />
              Información
            </span>
            <UIcon :name="openSection === 'info' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3.5 h-3.5 text-white/40" />
          </button>
          <div v-if="openSection === 'info'" class="px-4 pb-4 space-y-3">
            <div>
              <label class="block text-[11px] text-white/50 mb-1">Nombre</label>
              <input
                v-model="imgName"
                class="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label class="block text-[11px] text-white/50 mb-1">Texto alternativo</label>
              <input
                v-model="imgAltText"
                class="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-white/30"
                placeholder="Describe la imagen…"
              />
            </div>
            <div class="pt-1">
              <p class="text-[11px] text-white/40 font-semibold uppercase tracking-wide mb-2">Detalles</p>
              <div class="space-y-1 text-[12px] text-white/60">
                <p>{{ item.type }} · {{ imgNaturalW }} × {{ imgNaturalH }}</p>
                <p>{{ formattedSize }}</p>
                <p>Agregado el {{ formattedDate }}</p>
              </div>
            </div>
            <div v-if="focalPoint" class="pt-1">
              <p class="text-[11px] text-white/40 font-semibold uppercase tracking-wide mb-1">Punto focal</p>
              <p class="text-[12px] text-white/50">X: {{ (focalPoint.x * 100).toFixed(0) }}% · Y: {{ (focalPoint.y * 100).toFixed(0) }}%</p>
              <button class="mt-1 text-[11px] text-red-400/80 hover:text-red-400" @click="focalPoint = null; markDirty()">Eliminar punto focal</button>
            </div>
          </div>
        </div>

        <!-- RECORTAR Y TRANSFORMAR -->
        <div class="border-b border-white/10">
          <button
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
            :class="openSection === 'crop' ? 'text-white' : 'text-white/80'"
            @click="toggleSection('crop')"
          >
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-crop" class="w-4 h-4 text-white/50" />
              Recortar y transformar
            </span>
            <UIcon :name="openSection === 'crop' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3.5 h-3.5 text-white/40" />
          </button>
          <div v-if="openSection === 'crop'" class="px-4 pb-4 space-y-4">
            <!-- Orientation -->
            <div>
              <p class="text-[11px] text-white/40 mb-2">Orientación</p>
              <div class="flex gap-2">
                <button class="flex-1 py-1.5 border border-white/20 rounded text-xs text-white/70 hover:bg-white/10 flex items-center justify-center gap-1" @click="() => {}">
                  <UIcon name="i-lucide-rectangle-horizontal" class="w-4 h-3.5" /> Horizontal
                </button>
                <button class="flex-1 py-1.5 border border-white/20 rounded text-xs text-white/70 hover:bg-white/10 flex items-center justify-center gap-1" @click="() => {}">
                  <UIcon name="i-lucide-rectangle-vertical" class="w-3 h-4" /> Vertical
                </button>
              </div>
            </div>
            <!-- Aspect ratios -->
            <div class="space-y-1">
              <button
                v-for="ar in aspectRatios"
                :key="ar.value"
                class="w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-white/10 transition-colors"
                :class="cropAspect === ar.value ? 'text-white' : 'text-white/60'"
                @click="cropAspect = ar.value"
              >
                <span class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-sm border border-current flex-shrink-0" :class="ar.value === '1:1' ? 'w-4 h-4' : 'w-5 h-4'" />
                  {{ ar.label }}
                </span>
                <UIcon v-if="cropAspect === ar.value" name="i-lucide-check" class="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <!-- Aplicar crop -->
            <button
              class="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm text-white/80 hover:text-white transition-colors"
              @click="applyCrop"
            >
              Aplicar recorte
            </button>
            <!-- Flip / Rotate -->
            <div class="pt-1 border-t border-white/10 flex gap-2">
              <button class="flex-1 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded flex items-center justify-center gap-1 transition-colors" @click="flipHorizontal">
                <UIcon name="i-lucide-flip-horizontal-2" class="w-3.5 h-3.5" /> Voltear H
              </button>
              <button class="flex-1 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded flex items-center justify-center gap-1 transition-colors" @click="flipVertical">
                <UIcon name="i-lucide-flip-vertical-2" class="w-3.5 h-3.5" /> Voltear V
              </button>
              <button class="flex-1 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded flex items-center justify-center gap-1 transition-colors" @click="rotate90">
                <UIcon name="i-lucide-rotate-cw" class="w-3.5 h-3.5" /> Girar
              </button>
            </div>
          </div>
        </div>

        <!-- CAMBIAR TAMAÑO -->
        <div class="border-b border-white/10">
          <button
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
            @click="toggleSection('resize')"
          >
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-move-diagonal" class="w-4 h-4 text-white/50" />
              Cambiar tamaño
            </span>
            <UIcon :name="openSection === 'resize' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3.5 h-3.5 text-white/40" />
          </button>
          <div v-if="openSection === 'resize'" class="px-4 pb-4 space-y-3">
            <div class="flex items-center gap-2">
              <div class="flex-1">
                <label class="text-[11px] text-white/40 block mb-1">W</label>
                <div class="flex items-center gap-1">
                  <input
                    v-model.number="resizeW"
                    type="number"
                    min="1"
                    class="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-white/30"
                    @input="onResizeWChange"
                  />
                  <span class="text-[11px] text-white/40">px</span>
                </div>
              </div>
              <button
                class="mt-4 p-1.5 rounded border border-white/20 hover:bg-white/10 transition-colors"
                :class="resizeLocked ? 'text-white' : 'text-white/40'"
                @click="resizeLocked = !resizeLocked"
                title="Bloquear proporción"
              >
                <UIcon :name="resizeLocked ? 'i-lucide-lock' : 'i-lucide-lock-open'" class="w-3.5 h-3.5" />
              </button>
              <div class="flex-1">
                <label class="text-[11px] text-white/40 block mb-1">H</label>
                <div class="flex items-center gap-1">
                  <input
                    v-model.number="resizeH"
                    type="number"
                    min="1"
                    class="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-white/30"
                    @input="onResizeHChange"
                  />
                  <span class="text-[11px] text-white/40">px</span>
                </div>
              </div>
            </div>
            <button
              class="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm text-white/80 hover:text-white transition-colors"
              @click="applyResize"
            >
              Aplicar
            </button>
          </div>
        </div>

        <!-- DIBUJAR -->
        <div class="border-b border-white/10">
          <button
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
            :class="openSection === 'draw' ? 'text-white bg-white/5' : ''"
            @click="toggleSection('draw')"
          >
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-pencil" class="w-4 h-4 text-white/50" />
              Dibujar
              <span v-if="openSection === 'draw'" class="text-[10px] bg-blue-500/80 text-white px-1.5 py-0.5 rounded-full">Activo</span>
            </span>
            <UIcon :name="openSection === 'draw' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3.5 h-3.5 text-white/40" />
          </button>
          <div v-if="openSection === 'draw'" class="px-4 pb-4 space-y-4">
            <!-- Monocromo -->
            <div>
              <p class="text-[11px] text-white/40 mb-2">Monocromo</p>
              <div class="flex gap-1.5">
                <button
                  v-for="c in monoColors"
                  :key="c"
                  class="w-8 h-8 rounded-sm border-2 transition-all"
                  :style="{ backgroundColor: c }"
                  :class="drawColor === c ? 'border-blue-400 scale-110' : 'border-transparent'"
                  @click="drawColor = c"
                />
              </div>
            </div>
            <!-- Colores estándar -->
            <div>
              <p class="text-[11px] text-white/40 mb-2">Colores estándar</p>
              <div class="flex gap-1.5">
                <button
                  v-for="c in stdColors"
                  :key="c"
                  class="w-8 h-8 rounded-sm border-2 transition-all"
                  :style="{ backgroundColor: c }"
                  :class="drawColor === c ? 'border-blue-400 scale-110' : 'border-transparent'"
                  @click="drawColor = c"
                />
              </div>
            </div>
            <!-- Personalizado -->
            <div>
              <p class="text-[11px] text-white/40 mb-2">Personalizado</p>
              <div class="flex items-center gap-2">
                <button
                  class="w-8 h-8 rounded-sm border-2 transition-all relative overflow-hidden"
                  :style="{ backgroundColor: drawColor }"
                  :class="!monoColors.includes(drawColor) && !stdColors.includes(drawColor) ? 'border-blue-400' : 'border-transparent'"
                  @click="customColorInput?.click()"
                >
                  <UIcon name="i-lucide-plus" class="w-4 h-4 text-white/80 absolute inset-0 m-auto" />
                </button>
                <input
                  ref="customColorInput"
                  v-model="drawColor"
                  type="color"
                  class="sr-only"
                />
                <span class="text-xs text-white/50 font-mono">{{ drawColor }}</span>
              </div>
            </div>
            <!-- Brush size -->
            <div>
              <p class="text-[11px] text-white/40 mb-2">Tamaño del pincel <span class="text-white/60">{{ drawSize }}px</span></p>
              <input v-model.number="drawSize" type="range" min="1" max="80" class="w-full accent-white" />
            </div>
          </div>
        </div>

        <!-- FONDO DE COLOR -->
        <div class="border-b border-white/10">
          <button
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
            @click="toggleSection('bg')"
          >
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="w-4 h-4 text-white/50" />
              Fondo de color
            </span>
            <UIcon :name="openSection === 'bg' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3.5 h-3.5 text-white/40" />
          </button>
          <div v-if="openSection === 'bg'" class="px-4 pb-4 space-y-3">
            <div class="flex items-center gap-3">
              <label
                class="w-10 h-10 rounded border border-white/20 cursor-pointer relative overflow-hidden"
                :style="{ backgroundColor: bgColor }"
              >
                <input v-model="bgColor" type="color" class="sr-only" />
              </label>
              <span class="text-sm font-mono text-white/70">{{ bgColor }}</span>
            </div>
            <button
              class="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm text-white/80 hover:text-white transition-colors"
              @click="applyBg"
            >
              Aplicar fondo
            </button>
          </div>
        </div>

        <!-- GENERAR -->
        <div>
          <button
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
            @click="toggleSection('generate')"
          >
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-white/50" />
              Generar
            </span>
            <UIcon :name="openSection === 'generate' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3.5 h-3.5 text-white/40" />
          </button>
          <div v-if="openSection === 'generate'" class="px-4 pb-4">
            <div class="rounded-lg border border-dashed border-white/20 p-4 text-center">
              <UIcon name="i-lucide-sparkles" class="w-6 h-6 text-white/30 mx-auto mb-2" />
              <p class="text-xs text-white/40">Generación por IA</p>
              <p class="text-xs text-white/30 mt-1">Próximamente</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ══ UNSAVED CHANGES WARNING MODAL ══ -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showExitWarning"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          @click.self="exitWarningContinue"
        >
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div class="flex items-start gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-triangle-alert" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white">Cambios sin guardar</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tienes cambios que no se han guardado. ¿Qué quieres hacer?
                </p>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <button
                class="w-full py-2 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                @click="exitWarningSave"
              >
                Guardar y salir
              </button>
              <button
                class="w-full py-2 px-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                @click="exitWarningDiscard"
              >
                Descartar cambios
              </button>
              <button
                class="w-full py-2 px-4 text-gray-500 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                @click="exitWarningContinue"
              >
                Seguir editando
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
