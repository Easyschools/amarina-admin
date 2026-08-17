<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useConfirmState, resolveConfirm } from '@/composables/useConfirm'

const state = useConfirmState()
const { t } = useI18n()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="state.open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      @click.self="resolveConfirm(false)"
    >
      <div class="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 class="text-base font-semibold text-slate-900">{{ state.title }}</h3>
        <p class="mt-1 text-sm text-slate-500">{{ state.body }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            @click="resolveConfirm(false)"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            class="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
            @click="resolveConfirm(true)"
          >
            {{ t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
