<script setup>
import { computed } from 'vue'
import { Loading, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  state: { type: String, default: 'idle' },
  feedback: { type: Object, default: null },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
})
const emit = defineEmits(['retry', 'reset'])

const normalizedState = computed(() => props.feedback?.type ?? props.state)
const alertType = computed(() => {
  if (['forbidden', 'unauthorized', 'tenant-mismatch'].includes(normalizedState.value)) return 'error'
  if (['conflict', 'validation', 'oversized-batch'].includes(normalizedState.value)) return 'warning'
  return 'info'
})
const heading = computed(() => props.title || labelFor(normalizedState.value))
const body = computed(() => props.description || props.feedback?.message || props.feedback?.code || '')

function labelFor(state) {
  return {
    loading: 'Loading',
    empty: 'No records',
    validation: 'Validation failed',
    unauthorized: 'Session required',
    forbidden: 'Access denied',
    'tenant-mismatch': 'School access denied',
    'inactive-school': 'School inactive',
    'inactive-record': 'Record inactive',
    'not-found': 'Record not found',
    conflict: 'Conflict',
    'unsupported-filter': 'Unsupported filter',
    'unsupported-sort': 'Unsupported sort',
    'unsupported-page-size': 'Unsupported page size',
    'oversized-batch': 'Batch too large',
    'temporary-unavailable': 'Temporarily unavailable',
    'no-current-period': 'No active academic period',
  }[state] ?? 'Unavailable'
}
</script>

<template>
  <section
    class="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border border-sm-border bg-sm-surface p-5 text-center"
    :aria-live="normalizedState === 'loading' ? 'polite' : 'assertive'"
  >
    <ElIcon v-if="normalizedState === 'loading'" class="is-loading text-xl text-sm-brand">
      <Loading />
    </ElIcon>
    <ElEmpty v-else-if="normalizedState === 'empty'" :description="heading" />
    <ElAlert
      v-else
      :title="heading"
      :description="body"
      :type="alertType"
      :closable="false"
      show-icon
    />
    <div class="flex flex-wrap justify-center gap-2">
      <ElButton
        v-if="['temporary-unavailable', 'unknown'].includes(normalizedState)"
        :icon="Refresh"
        @click="emit('retry')"
      >
        Retry
      </ElButton>
      <ElButton
        v-if="['unsupported-filter', 'unsupported-sort', 'unsupported-page-size'].includes(normalizedState)"
        @click="emit('reset')"
      >
        Reset
      </ElButton>
    </div>
  </section>
</template>
