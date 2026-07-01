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
const heading = computed(() => props.title || labelFor(normalizedState.value))
const body = computed(() => props.description || props.feedback?.message || props.feedback?.code || '')
const alertType = computed(() => {
  if (['unauthorized', 'forbidden', 'tenant-mismatch', 'download-denied'].includes(normalizedState.value)) return 'error'
  if (['validation', 'conflict', 'unsupported-contract', 'unsupported-filter', 'import-validation'].includes(normalizedState.value)) return 'warning'
  if (normalizedState.value === 'success') return 'success'
  return 'info'
})

function labelFor(state) {
  return {
    loading: 'Loading',
    empty: 'No records',
    success: 'Complete',
    validation: 'Validation failed',
    unauthorized: 'Session required',
    forbidden: 'Access denied',
    'tenant-mismatch': 'School access denied',
    'inactive-school': 'Inactive school',
    'inactive-record': 'Inactive record',
    'not-found': 'Record not found',
    conflict: 'Conflict',
    'unsupported-contract': 'Contract support required',
    'unsupported-filter': 'Unsupported filter',
    'scan-unavailable': 'Scan unavailable',
    'download-denied': 'Download denied',
    'import-validation': 'Import rejected',
    'stale-record': 'Stale response ignored',
    'temporary-unavailable': 'Temporarily unavailable',
  }[state] ?? 'Unavailable'
}
</script>

<template>
  <section
    v-if="normalizedState && normalizedState !== 'idle'"
    class="rounded-2xl border border-sm-border bg-sm-surface p-5"
    :aria-live="normalizedState === 'loading' ? 'polite' : 'assertive'"
  >
    <div v-if="normalizedState === 'loading'" class="flex items-center gap-2 text-sm-brand">
      <ElIcon class="is-loading">
        <Loading />
      </ElIcon>
      <span>{{ heading }}</span>
    </div>
    <ElEmpty v-else-if="normalizedState === 'empty'" :description="heading" />
    <ElAlert
      v-else
      :title="heading"
      :description="body"
      :type="alertType"
      :closable="false"
      show-icon
    />
    <div class="mt-4 flex flex-wrap gap-2">
      <ElButton
        v-if="normalizedState === 'temporary-unavailable'"
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
