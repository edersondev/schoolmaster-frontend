<script setup>
import { useI18n } from 'vue-i18n'
import AdminFeedbackState from './AdminFeedbackState.vue'

defineProps({
  title: { type: String, required: true },
  createTo: { type: [String, Object], default: null },
  canCreate: { type: Boolean, default: false },
  state: { type: String, default: 'ready' },
  feedback: { type: Object, default: null },
})
defineEmits(['retry', 'reset'])
const { t } = useI18n()
</script>

<template>
  <section class="mx-auto flex w-full max-w-screen-2xl flex-col gap-4">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="font-display text-2xl font-semibold text-sm-text">{{ title }}</h1>
      <RouterLink
        v-if="canCreate && createTo"
        class="inline-flex min-h-8 items-center justify-center rounded border border-sm-brand bg-sm-brand px-4 py-2 text-sm font-medium text-white transition hover:border-sm-brand-strong hover:bg-sm-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sm-brand"
        :to="createTo"
      >
        {{ t('administration.common.create') }}
      </RouterLink>
    </header>
    <div v-if="$slots.filters" class="rounded-xl border border-sm-border bg-sm-surface p-4">
      <slot name="filters" />
    </div>
    <AdminFeedbackState
      v-if="state !== 'ready'"
      :state="state"
      :feedback="feedback"
      @retry="$emit('retry')"
      @reset="$emit('reset')"
    />
    <div v-else class="overflow-hidden rounded-xl border border-sm-border bg-sm-surface">
      <slot />
    </div>
    <div v-if="$slots.pagination && state === 'ready'" class="flex justify-end">
      <slot name="pagination" />
    </div>
  </section>
</template>
