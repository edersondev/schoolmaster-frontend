<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  status: { type: String, default: '' },
  availability: { type: String, default: '' },
  lifecycleState: { type: String, default: '' },
  deletedAt: { type: String, default: '' },
})

const { t } = useI18n()
const value = computed(() => (props.deletedAt ? 'deleted' : props.status || props.availability || props.lifecycleState || 'unknown'))
const tagType = computed(() => {
  if (['generated', 'available', 'active'].includes(value.value)) return 'success'
  if (['requested', 'generating', 'pending', 'draft'].includes(value.value)) return 'info'
  if (['expired', 'failed', 'canceled', 'deleted', 'inactive'].includes(value.value)) return 'warning'
  return 'info'
})
</script>

<template>
  <ElTag :type="tagType" effect="plain">
    {{ t(`reporting.states.${value}`, value) }}
  </ElTag>
</template>
