<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const model = defineModel<string>({ required: true })
defineProps<{ dir?: 'ltr' | 'rtl' }>()

const editor = useEditor({
  content: model.value,
  extensions: [StarterKit],
  onUpdate: ({ editor }) => {
    model.value = editor.getHTML()
  },
})

watch(model, (value) => {
  if (editor.value && value !== editor.value.getHTML()) {
    editor.value.commands.setContent(value, { emitUpdate: false })
  }
})

onBeforeUnmount(() => editor.value?.destroy())

const run = (fn: () => void) => () => fn()
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-slate-300">
    <div v-if="editor" class="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
      <button
        type="button"
        class="rounded px-2 py-1 text-sm font-bold hover:bg-slate-200"
        :class="{ 'bg-slate-200': editor.isActive('bold') }"
        @click="run(() => editor!.chain().focus().toggleBold().run())"
      >
        B
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm italic hover:bg-slate-200"
        :class="{ 'bg-slate-200': editor.isActive('italic') }"
        @click="run(() => editor!.chain().focus().toggleItalic().run())"
      >
        I
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm hover:bg-slate-200"
        :class="{ 'bg-slate-200': editor.isActive('heading', { level: 2 }) }"
        @click="run(() => editor!.chain().focus().toggleHeading({ level: 2 }).run())"
      >
        H2
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm hover:bg-slate-200"
        :class="{ 'bg-slate-200': editor.isActive('bulletList') }"
        @click="run(() => editor!.chain().focus().toggleBulletList().run())"
      >
        • List
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm hover:bg-slate-200"
        :class="{ 'bg-slate-200': editor.isActive('blockquote') }"
        @click="run(() => editor!.chain().focus().toggleBlockquote().run())"
      >
        “”
      </button>
    </div>
    <EditorContent
      :editor="editor"
      :dir="dir ?? 'ltr'"
      class="px-3 py-2 text-sm leading-relaxed [&_.ProseMirror]:min-h-32 [&_.ProseMirror]:outline-none [&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:ps-5 [&_blockquote]:border-s-4 [&_blockquote]:border-slate-300 [&_blockquote]:ps-3 [&_blockquote]:text-slate-600"
    />
  </div>
</template>
