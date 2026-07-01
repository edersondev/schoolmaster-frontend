<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})
const type = computed(() => {
  if (['active'].includes(props.status)) return 'success'
  if (['inactive', 'ended', 'historical-only', 'transferred'].includes(props.status)) return 'warning'
  if (['deleted', 'unavailable', 'conflict'].includes(props.status)) return 'danger'
  return 'info'
})
const label = computed(() =>
  String(props.status || 'unknown')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' '),
)
</script>

<template>
  <ElTag :type="type" :size="compact ? 'small' : 'default'" effect="light" :aria-label="label">
    {{ label }}
  </ElTag>
</template>
