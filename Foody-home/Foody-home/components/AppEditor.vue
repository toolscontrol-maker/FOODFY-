<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { NodeSelection } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

// Editor configuration
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      dropcursor: {
        color: '#000000',
        width: 2,
      },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary-600 underline cursor-pointer'
      }
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    Placeholder.configure({
      placeholder: 'Describe el plato (ingredientes, historia, alérgenos...)'
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-xl'
      }
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'border-collapse table-fixed w-full'
      }
    }),
    TableRow,
    TableHeader,
    TableCell
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// UI State
const isMediaModalOpen = ref(false)
const sideMenuTop = ref(0)
const sideMenuShow = ref(false)
const currentNodePos = ref<number | null>(null)

// Formatting options
const formats = [
  { label: 'Paragraph', value: 'paragraph' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Quote', value: 'blockquote' }
]

const selectedFormat = computed({
  get: () => {
    if (editor.value?.isActive('heading', { level: 1 })) return 'h1'
    if (editor.value?.isActive('heading', { level: 2 })) return 'h2'
    if (editor.value?.isActive('heading', { level: 3 })) return 'h3'
    if (editor.value?.isActive('blockquote')) return 'blockquote'
    return 'paragraph'
  },
  set: (val) => {
    if (val === 'h1') editor.value?.chain().focus().toggleHeading({ level: 1 }).run()
    else if (val === 'h2') editor.value?.chain().focus().toggleHeading({ level: 2 }).run()
    else if (val === 'h3') editor.value?.chain().focus().toggleHeading({ level: 3 }).run()
    else if (val === 'blockquote') editor.value?.chain().focus().toggleBlockquote().run()
    else editor.value?.chain().focus().setParagraph().run()
  }
})

const selectedFormatLabel = computed(() => {
  const map: Record<string, string> = {
    'paragraph': 'Text',
    'h1': 'Heading 1',
    'h2': 'Heading 2',
    'h3': 'Heading 3',
    'blockquote': 'Quote'
  }
  return map[selectedFormat.value] || 'Text'
})

const selectedFormatIcon = computed(() => {
  const map: Record<string, string> = {
    'paragraph': 'i-lucide-pilcrow',
    'h1': 'i-lucide-heading-1',
    'h2': 'i-lucide-heading-2',
    'h3': 'i-lucide-heading-3',
    'blockquote': 'i-lucide-quote'
  }
  return map[selectedFormat.value] || 'i-lucide-pilcrow'
})

// Sync external changes
watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val || '', { emitUpdate: false })
  }
})

// Handlers
const handleImageConfirm = (urls: string[]) => {
  if (urls.length > 0) {
    editor.value?.chain().focus().setImage({ src: urls[0] }).run()
  }
}

const onMouseMove = (event: MouseEvent) => {
  if (!editor.value) return
  
  const { view } = editor.value
  const scrollContainer = view.dom.closest('.overflow-y-auto')
  if (!scrollContainer) return

  const containerRect = scrollContainer.getBoundingClientRect()
  const editorRect = view.dom.getBoundingClientRect()
  
  // Probe inside the editor bounds
  const probeX = editorRect.left + 150 
  const pos = view.posAtCoords({ left: probeX, top: event.clientY })
  
  if (!pos) {
    if (event.clientY < editorRect.top || event.clientY > editorRect.bottom) {
      sideMenuShow.value = false
    }
    return
  }
  
  const $pos = view.state.doc.resolve(pos.pos)
  
  // Find block depth
  let blockStart = -1
  for (let i = $pos.depth; i > 0; i--) {
    if ($pos.node(i).type.isBlock) {
      blockStart = $pos.before(i)
      break
    }
  }

  if (blockStart >= 0) {
    currentNodePos.value = blockStart
    const dom = view.nodeDOM(blockStart) as HTMLElement
    if (dom && typeof dom.getBoundingClientRect === 'function') {
      const rect = dom.getBoundingClientRect()
      
      // Calculate position relative to container
      // Vertical align with first line
      const verticalOffset = 2
      sideMenuTop.value = rect.top - containerRect.top + scrollContainer.scrollTop + verticalOffset
      sideMenuShow.value = true
    }
  }
}

const onDragStart = (event: DragEvent) => {
  if (!editor.value || currentNodePos.value === null) return
  
  const { view } = editor.value
  const { state } = view
  
  // Create selection for the block
  const selection = NodeSelection.create(state.doc, currentNodePos.value)
  view.dispatch(state.tr.setSelection(selection))
  
  // Prepare slice for dragging
  const slice = selection.content()
  const serialized = view.serializeForClipboard(slice)
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copyMove'
    event.dataTransfer.setData('text/html', serialized.dom.innerHTML)
    event.dataTransfer.setData('text/plain', serialized.text)
    
    // Set internal dragging state
    // @ts-ignore
    view.dragging = {
      slice,
      move: true
    }
  }
}

const onDragEnd = () => {
  if (editor.value) {
    // @ts-ignore
    editor.value.view.dragging = null
  }
}

const sideMenuItems = [
  [{
    label: 'AI: Continue writing',
    icon: 'i-lucide-sparkles',
    class: 'text-primary-600 font-semibold'
  }],
  [
    { label: 'STYLE', disabled: true, class: 'text-[10px] font-bold text-gray-400 p-1 tracking-wider' },
    { label: 'Paragraph', icon: 'i-lucide-baseline', click: () => editor.value?.chain().focus().setParagraph().run() },
    { label: 'Heading 1', icon: 'i-lucide-heading-1', click: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: 'Heading 2', icon: 'i-lucide-heading-2', click: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Heading 3', icon: 'i-lucide-heading-3', click: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'Bullet List', icon: 'i-lucide-list', click: () => editor.value?.chain().focus().toggleBulletList().run() },
    { label: 'Numbered List', icon: 'i-lucide-list-ordered', click: () => editor.value?.chain().focus().toggleOrderedList().run() },
    { label: 'Quote', icon: 'i-lucide-quote', click: () => editor.value?.chain().focus().toggleBlockquote().run() }
  ],
  [
    { label: 'INSERT', disabled: true, class: 'text-[10px] font-bold text-gray-400 p-1 tracking-wider' },
    { label: 'Image', icon: 'i-lucide-image', click: () => isMediaModalOpen.value = true },
    { label: 'Table', icon: 'i-lucide-table', click: () => editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() }
  ]
]

const addLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URL del enlace:', previousUrl)
  
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const shouldShowImageMenu = ({ state }: any) => {
  const { node } = state.selection as any
  return node && node.type.name === 'image'
}
</script>

<template>
  <div class="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden flex flex-col shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
    <!-- Main Toolbar -->
    <div v-if="editor" class="bg-gray-50/50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 p-1.5 flex flex-wrap gap-1 items-center">
      <div class="flex items-center gap-0.5 px-0.5">
        <UButton icon="i-lucide-undo" color="gray" variant="ghost" size="sm" :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()" />
        <UButton icon="i-lucide-redo" color="gray" variant="ghost" size="sm" :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()" />
      </div>
      <div class="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
      <UButton icon="i-lucide-sparkles" color="gray" variant="ghost" size="sm" class="text-gray-500" />
      <div class="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
      <USelectMenu v-model="selectedFormat" :options="formats" value-attribute="value" size="xs" color="gray" class="w-36" />
      <div class="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
      <div class="flex items-center gap-0.5">
        <UButton icon="i-lucide-bold" :color="editor.isActive('bold') ? 'primary' : 'gray'" variant="ghost" size="sm" @click="editor.chain().focus().toggleBold().run()" />
        <UButton icon="i-lucide-italic" :color="editor.isActive('italic') ? 'primary' : 'gray'" variant="ghost" size="sm" @click="editor.chain().focus().toggleItalic().run()" />
        <UButton icon="i-lucide-underline" :color="editor.isActive('underline') ? 'primary' : 'gray'" variant="ghost" size="sm" @click="editor.chain().focus().toggleUnderline().run()" />
        <UButton icon="i-lucide-strikethrough" :color="editor.isActive('strike') ? 'primary' : 'gray'" variant="ghost" size="sm" @click="editor.chain().focus().toggleStrike().run()" />
      </div>
      <div class="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
      <UDropdown :items="[[
        { label: 'Left', icon: 'i-lucide-align-left', click: () => editor?.chain().focus().setTextAlign('left').run() },
        { label: 'Center', icon: 'i-lucide-align-center', click: () => editor?.chain().focus().setTextAlign('center').run() },
        { label: 'Right', icon: 'i-lucide-align-right', click: () => editor?.chain().focus().setTextAlign('right').run() }
      ]]" :popper="{ placement: 'bottom-start' }">
        <UButton icon="i-lucide-align-left" color="gray" variant="ghost" size="sm" />
      </UDropdown>
      <div class="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
      <div class="flex items-center gap-0.5">
        <UButton icon="i-lucide-link" :color="editor.isActive('link') ? 'primary' : 'gray'" variant="ghost" size="sm" @click="addLink" />
        <UButton icon="i-lucide-image" color="gray" variant="ghost" size="sm" @click="isMediaModalOpen = true" />
        <UButton icon="i-lucide-table" color="gray" variant="ghost" size="sm" @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()" />
      </div>
      <div class="flex-1" />
      <UButton icon="i-lucide-code" :color="editor.isActive('codeBlock') ? 'primary' : 'gray'" variant="ghost" size="sm" @click="editor.chain().focus().toggleCodeBlock().run()" />
    </div>

    <!-- Bubble Menu exactly like the screenshot with light/dark support -->
    <BubbleMenu 
      v-if="editor" 
      :editor="editor" 
      :tippy-options="{ duration: 150, maxWidth: 'none', zIndex: 100 }" 
      class="bg-gray-50/50 dark:bg-[#020617] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl flex items-center p-1 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 divide-x divide-gray-200 dark:divide-white/5 overflow-hidden backdrop-blur-sm"
    >
      <!-- AI Action -->
      <div class="px-1.5 flex items-center">
        <UButton 
          icon="i-lucide-sparkles" 
          label="Improve" 
          variant="ghost" 
          color="gray" 
          size="xs" 
          class="font-semibold gap-2 hover:bg-gray-100 dark:hover:bg-white/10 px-2 text-gray-700 dark:text-white/90 active:text-primary-600 dark:active:text-primary-400" 
        />
      </div>

      <!-- Format Selection -->
      <div class="px-1 flex items-center">
        <USelectMenu 
          v-model="selectedFormat" 
          :options="formats" 
          value-attribute="value" 
          size="xs" 
          variant="none"
          class="min-w-[120px]"
          :ui-menu="{ 
            background: 'bg-white dark:bg-[#020617]', 
            ring: 'ring-1 ring-gray-200 dark:ring-white/10',
            option: { 
              active: 'bg-gray-100 dark:bg-white/10',
              selected: 'text-primary-600 dark:text-primary-400 font-semibold',
              color: 'text-gray-700 dark:text-white/80'
            } 
          }"
        >
          <template #label>
              <div class="text-gray-700 dark:text-white/90 text-[12px] flex items-center gap-1.5 px-1 py-0.5 font-semibold cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <UIcon :name="selectedFormatIcon" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span class="truncate">{{ selectedFormatLabel }}</span>
                <UIcon name="i-lucide-chevron-down" class="w-3 h-3 text-gray-400 dark:text-gray-500 ml-auto" />
              </div>
          </template>
        </USelectMenu>
      </div>

      <!-- Formatting Tools -->
      <div class="px-1.5 flex items-center gap-0.5">
        <UButton icon="i-lucide-bold" variant="ghost" color="gray" size="xs" :class="editor.isActive('bold') ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'" @click="editor.chain().focus().toggleBold().run()" />
        <UButton icon="i-lucide-italic" variant="ghost" color="gray" size="xs" :class="editor.isActive('italic') ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'" @click="editor.chain().focus().toggleItalic().run()" />
        <UButton icon="i-lucide-underline" variant="ghost" color="gray" size="xs" :class="editor.isActive('underline') ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'" @click="editor.chain().focus().toggleUnderline().run()" />
        <UButton icon="i-lucide-strikethrough" variant="ghost" color="gray" size="xs" :class="editor.isActive('strike') ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'" @click="editor.chain().focus().toggleStrike().run()" />
        <UButton icon="i-lucide-code" variant="ghost" color="gray" size="xs" :class="editor.isActive('code') ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'" @click="editor.chain().focus().toggleCode().run()" />
      </div>

      <!-- Links & Media -->
      <div class="px-1.5 flex items-center gap-0.5">
        <UButton icon="i-lucide-link" variant="ghost" color="gray" size="xs" :class="editor.isActive('link') ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'" @click="addLink" />
        <UButton icon="i-lucide-image" variant="ghost" color="gray" size="xs" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10" @click="isMediaModalOpen = true" />
      </div>

      <!-- Menu button -->
      <div class="px-1.5 flex items-center">
        <UButton icon="i-lucide-menu" variant="ghost" color="gray" size="xs" class="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10" />
      </div>
    </BubbleMenu>

    <BubbleMenu
      v-if="editor"
      :editor="editor"
      :should-show="shouldShowImageMenu"
      :tippy-options="{ duration: 100, placement: 'bottom', offset: [0, 10], maxWidth: 'none' }"
    >
      <div class="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-10 w-[500px] text-center cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all flex flex-col items-center justify-center" @click="isMediaModalOpen = true">
        <div class="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4 border border-gray-100 dark:border-gray-700">
          <UIcon name="i-lucide-image" class="w-8 h-8 text-gray-400" />
        </div>
        <h4 class="text-[15px] font-bold text-gray-900 dark:text-white">Upload an image</h4>
        <p class="text-[13px] text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 2MB)</p>
      </div>
    </BubbleMenu>

    <!-- Editor Surface -->
    <div class="flex-1 overflow-y-auto min-h-[500px] bg-transparent relative group/editor" @mousemove="onMouseMove" @mouseleave="sideMenuShow = false">
      <!-- Side Menu -->
      <div 
        v-if="editor && sideMenuShow" 
        class="absolute left-6 flex items-center gap-1 z-20 pointer-events-auto transition-all duration-75"
        :style="{ top: `${sideMenuTop}px` }"
      >
        <UDropdown :items="sideMenuItems" :popper="{ placement: 'bottom-start', offsetDistance: 10 }">
          <UButton 
            icon="i-lucide-plus" 
            variant="ghost" 
            color="gray" 
            size="xs" 
            class="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-md" 
          />
        </UDropdown>
        <UButton 
          icon="i-lucide-grip-vertical" 
          variant="ghost" 
          color="gray" 
          size="xs" 
          draggable="true"
          class="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-md" 
          @dragstart="onDragStart"
          @dragend="onDragEnd"
        />
      </div>

      <EditorContent 
        :editor="editor" 
        class="tiptap-editor px-24 py-12 prose dark:prose-invert max-w-none focus:outline-none" 
      />
    </div>
    
    <AppMediaModal v-model="isMediaModalOpen" @confirm="handleImageConfirm" />
  </div>
</template>

<style lang="postcss">
.tiptap-editor {
  .ProseMirror {
    outline: none;
    min-height: 500px;
    font-size: 15px;
    color: #1a1a1a;
    line-height: 1.625;
    
    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: #94a3b8;
      pointer-events: none;
      height: 0;
    }

    ul { @apply list-disc pl-6 my-4; }
    ol { @apply list-decimal pl-6 my-4; }
    h1 { @apply text-4xl font-extrabold mb-8 mt-4 tracking-tight; }
    h2 { @apply text-3xl font-bold mb-6 mt-8 tracking-tight; }
    h3 { @apply text-2xl font-bold mb-4 mt-6 tracking-tight; }
    blockquote { @apply border-l-4 border-primary-500 bg-primary-50/30 dark:bg-primary-900/10 pl-6 py-1 italic my-6 text-gray-700 dark:text-gray-300; }
    code { @apply bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-primary-600 dark:text-primary-400 font-mono text-sm; }
    pre { @apply bg-gray-900 text-gray-100 p-6 rounded-2xl my-6 overflow-x-auto font-mono text-sm shadow-lg; }
    
    table {
      @apply border-collapse table-fixed w-full my-6 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden;
      td, th {
        @apply border border-gray-200 dark:border-gray-800 p-3 text-left align-top min-w-[120px] relative;
        > * { margin-bottom: 0; }
      }
      th { @apply bg-gray-50/80 dark:bg-gray-800/80 font-bold text-gray-900 dark:text-white; }
    }

    img {
      @apply transition-all duration-300 hover:shadow-2xl cursor-pointer ring-0 ring-primary-500/50 ring-offset-0;
      &.ProseMirror-selectednode {
        @apply ring-4 ring-offset-2;
      }
    }

    /* Custom Dropcursor styling */
    .ProseMirror-dropcursor {
      @apply transition-all duration-150;
      border-top: 2px solid #000000 !important;
    }
  }
}

.dark .tiptap-editor .ProseMirror {
  color: #e5e7eb;
  p.is-editor-empty:first-child::before {
    color: #4b5563;
  }
}
</style>
