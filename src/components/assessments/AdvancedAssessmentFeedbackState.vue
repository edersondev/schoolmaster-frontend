<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ADVANCED_ASSESSMENT_FEEDBACK_STATES } from '@/contracts/assessments/advancedAssessmentContract'

const props = defineProps({
  feedback: { type: Object, default: null },
  title: { type: String, default: '' },
})

const { t } = useI18n()
const type = computed(() => props.feedback?.type ?? ADVANCED_ASSESSMENT_FEEDBACK_STATES.idle)
const visible = computed(() => props.feedback && type.value !== ADVANCED_ASSESSMENT_FEEDBACK_STATES.idle)
const messageKey = computed(() => `advancedAssessment.feedback.${type.value}`)
const alertType = computed(() => {
  if ([ADVANCED_ASSESSMENT_FEEDBACK_STATES.success, ADVANCED_ASSESSMENT_FEEDBACK_STATES.empty].includes(type.value)) return 'success'
  if ([ADVANCED_ASSESSMENT_FEEDBACK_STATES.loading].includes(type.value)) return 'info'
  if ([ADVANCED_ASSESSMENT_FEEDBACK_STATES.validation, ADVANCED_ASSESSMENT_FEEDBACK_STATES.scanPending].includes(type.value)) return 'warning'
  return 'error'
})
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
