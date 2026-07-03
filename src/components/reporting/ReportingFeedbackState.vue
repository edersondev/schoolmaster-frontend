<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { REPORTING_FEEDBACK_STATES } from '@/contracts/reporting/reportingContract'

const props = defineProps({
  feedback: { type: Object, default: null },
  title: { type: String, default: '' },
})

const { t } = useI18n()
const type = computed(() => props.feedback?.type ?? REPORTING_FEEDBACK_STATES.idle)
const messageKey = computed(() => {
  const keys = {
    [REPORTING_FEEDBACK_STATES.loading]: 'reporting.feedback.loading',
    [REPORTING_FEEDBACK_STATES.success]: 'reporting.feedback.success',
    [REPORTING_FEEDBACK_STATES.empty]: 'reporting.feedback.empty',
    [REPORTING_FEEDBACK_STATES.noResults]: 'reporting.feedback.noResults',
    [REPORTING_FEEDBACK_STATES.unauthorized]: 'reporting.feedback.unauthorized',
    [REPORTING_FEEDBACK_STATES.forbidden]: 'reporting.feedback.forbidden',
    [REPORTING_FEEDBACK_STATES.tenantMismatch]: 'reporting.feedback.tenantMismatch',
    [REPORTING_FEEDBACK_STATES.inactiveSchool]: 'reporting.feedback.inactiveSchool',
    [REPORTING_FEEDBACK_STATES.noActiveSchool]: 'reporting.feedback.noActiveSchool',
    [REPORTING_FEEDBACK_STATES.unavailableCatalog]: 'reporting.feedback.unavailableCatalog',
    [REPORTING_FEEDBACK_STATES.validation]: 'reporting.feedback.validation',
    [REPORTING_FEEDBACK_STATES.notFound]: 'reporting.feedback.notFound',
    [REPORTING_FEEDBACK_STATES.conflict]: 'reporting.feedback.conflict',
    [REPORTING_FEEDBACK_STATES.outputExpired]: 'reporting.feedback.outputExpired',
    [REPORTING_FEEDBACK_STATES.unsupportedPageSize]: 'reporting.feedback.unsupportedPageSize',
    [REPORTING_FEEDBACK_STATES.staleResponse]: 'reporting.feedback.staleResponse',
    [REPORTING_FEEDBACK_STATES.downloadUnavailable]: 'reporting.feedback.downloadUnavailable',
    [REPORTING_FEEDBACK_STATES.contractUnavailable]: 'reporting.feedback.contractUnavailable',
  }
  return keys[type.value] ?? 'reporting.feedback.temporaryUnavailable'
})
const alertType = computed(() => {
  if (type.value === REPORTING_FEEDBACK_STATES.loading) return 'info'
  if ([REPORTING_FEEDBACK_STATES.success, REPORTING_FEEDBACK_STATES.empty, REPORTING_FEEDBACK_STATES.noResults].includes(type.value)) return 'success'
  if ([REPORTING_FEEDBACK_STATES.validation, REPORTING_FEEDBACK_STATES.outputExpired, REPORTING_FEEDBACK_STATES.downloadUnavailable].includes(type.value)) return 'warning'
  return 'error'
})
const visible = computed(() => props.feedback && type.value !== REPORTING_FEEDBACK_STATES.idle)
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
