<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  feedback: { type: Object, default: null },
})

const { t } = useI18n()
const messageKey = computed(() => {
  if (!props.feedback) return null
  if (props.feedback.type === 'conflict') {
    return `conflict.${props.feedback.conflictKind ?? 'unknown'}`
  }
  if (props.feedback.type === 'forbidden') return 'conflict.forbidden'
  if (props.feedback.type === 'tenant-mismatch') return 'conflict.tenantMismatch'
  if (props.feedback.type === 'not-found') return 'conflict.notFound'
  if (props.feedback.type === 'unavailable') return 'conflict.unavailable'
  return 'conflict.unknown'
})
</script>

<template>
  <ElAlert
    v-if="messageKey"
    type="warning"
    :closable="false"
    show-icon
    class="my-2"
    :title="t(`administrationLifecycle.${messageKey}`)"
  />
</template>
