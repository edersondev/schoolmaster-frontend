<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PLATFORM_SUPPORT_FEEDBACK_STATES } from '@/contracts/platform-support/platformSupportContract'

const props = defineProps({
  feedback: { type: Object, default: null },
  title: { type: String, default: '' },
})

const { t } = useI18n()
const type = computed(() => props.feedback?.type ?? PLATFORM_SUPPORT_FEEDBACK_STATES.idle)
const messageKey = computed(() => {
  const key = Object.entries(PLATFORM_SUPPORT_FEEDBACK_STATES).find(([, value]) => value === type.value)?.[0]
  return key ? `platformSupport.feedback.${key}` : 'platformSupport.feedback.temporaryUnavailable'
})
const alertType = computed(() => {
  if (type.value === PLATFORM_SUPPORT_FEEDBACK_STATES.loading) return 'info'
  if ([PLATFORM_SUPPORT_FEEDBACK_STATES.empty, PLATFORM_SUPPORT_FEEDBACK_STATES.noResults].includes(type.value)) return 'success'
  if (
    [
      PLATFORM_SUPPORT_FEEDBACK_STATES.validation,
      PLATFORM_SUPPORT_FEEDBACK_STATES.expired,
      PLATFORM_SUPPORT_FEEDBACK_STATES.revoked,
      PLATFORM_SUPPORT_FEEDBACK_STATES.denied,
      PLATFORM_SUPPORT_FEEDBACK_STATES.diagnosticsUnavailable,
      PLATFORM_SUPPORT_FEEDBACK_STATES.unsupportedAction,
    ].includes(type.value)
  ) {
    return 'warning'
  }
  return 'error'
})
const visible = computed(() => props.feedback && type.value !== PLATFORM_SUPPORT_FEEDBACK_STATES.idle)
</script>

<template>
  <ElAlert
    v-if="visible"
    :title="title || t(messageKey)"
    :type="alertType"
    :closable="false"
    show-icon
    class="w-full"
  />
</template>

