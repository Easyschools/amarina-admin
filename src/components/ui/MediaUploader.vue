<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  /** Existing media URL (thumb/card) from the API, if any */
  existingUrl?: string | null
  label?: string
}>()

const emit = defineEmits<{ change: [file: File | null] }>()

const previewUrl = ref<string | null>(props.existingUrl ?? null)
const inputRef = ref<HTMLInputElement | null>(null)

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  if (file) {
    previewUrl.value = URL.createObjectURL(file)
  }
  emit('change', file)
}

function clear() {
  previewUrl.value = null
  if (inputRef.value) inputRef.value.value = ''
  emit('change', null)
}
</script>

<template>
  <div>
    <label v-if="label" class="mb-1 block text-sm font-medium text-slate-700">{{ label }}</label>
    <div class="flex items-center gap-4">
      <div
        class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-slate-100"
      >
        <img v-if="previewUrl" :src="previewUrl" class="h-full w-full object-cover" alt="" />
        <span v-else class="text-xs text-slate-400">{{ t('common.image') }}</span>
      </div>
      <div class="flex flex-col gap-2">
        <input ref="inputRef" type="file" accept="image/*" class="text-sm" @change="onFileChange" />
        <button
          v-if="previewUrl"
          type="button"
          class="w-fit text-xs text-red-600 hover:underline"
          @click="clear"
        >
          {{ t('common.removeImage') }}
        </button>
      </div>
    </div>
  </div>
</template>
