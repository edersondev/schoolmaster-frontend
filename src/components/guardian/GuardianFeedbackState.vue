<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { GUARDIAN_FEEDBACK_STATES } from '@/contracts/guardian/guardianSelfServiceContract'

const props = defineProps({
  feedback: { type: Object, default: null },
  title: { type: String, default: '' },
})

const { t } = useI18n()

const type = computed(() => props.feedback?.type ?? GUARDIAN_FEEDBACK_STATES.idle)
const messageKey = computed(() => {
  const keys = {
    [GUARDIAN_FEEDBACK_STATES.loading]: 'guardianSelfService.feedback.loading',
    [GUARDIAN_FEEDBACK_STATES.empty]: 'guardianSelfService.feedback.empty',
    [GUARDIAN_FEEDBACK_STATES.unauthorized]: 'guardianSelfService.feedback.unauthorized',
    [GUARDIAN_FEEDBACK_STATES.forbidden]: 'guardianSelfService.feedback.forbidden',
    [GUARDIAN_FEEDBACK_STATES.tenantMismatch]: 'guardianSelfService.feedback.tenantMismatch',
    [GUARDIAN_FEEDBACK_STATES.inactiveSchool]: 'guardianSelfService.feedback.inactiveSchool',
    [GUARDIAN_FEEDBACK_STATES.noActiveSchool]: 'guardianSelfService.feedback.noActiveSchool',
    [GUARDIAN_FEEDBACK_STATES.noGuardianLink]: 'guardianSelfService.feedback.noGuardianLink',
    [GUARDIAN_FEEDBACK_STATES.noLinkedStudents]: 'guardianSelfService.feedback.noLinkedStudents',
    [GUARDIAN_FEEDBACK_STATES.noAcademicPeriod]: 'guardianSelfService.feedback.noAcademicPeriod',
    [GUARDIAN_FEEDBACK_STATES.unavailableSummary]: 'guardianSelfService.feedback.unavailableSummary',
    [GUARDIAN_FEEDBACK_STATES.validation]: 'guardianSelfService.feedback.validation',
    [GUARDIAN_FEEDBACK_STATES.notFound]: 'guardianSelfService.feedback.notFound',
    [GUARDIAN_FEEDBACK_STATES.unsupportedPageSize]: 'guardianSelfService.feedback.unsupportedPageSize',
    [GUARDIAN_FEEDBACK_STATES.staleResponse]: 'guardianSelfService.feedback.staleResponse',
    [GUARDIAN_FEEDBACK_STATES.contractUnavailable]: 'guardianSelfService.feedback.contractUnavailable',
  }
  return keys[type.value] ?? 'guardianSelfService.feedback.temporaryUnavailable'
})

const alertType = computed(() => {
  if (type.value === GUARDIAN_FEEDBACK_STATES.loading) return 'info'
  if ([GUARDIAN_FEEDBACK_STATES.empty, GUARDIAN_FEEDBACK_STATES.noLinkedStudents].includes(type.value)) return 'success'
  if ([GUARDIAN_FEEDBACK_STATES.noAcademicPeriod, GUARDIAN_FEEDBACK_STATES.unavailableSummary].includes(type.value)) return 'warning'
  return 'error'
})

const visible = computed(() => props.feedback && type.value !== GUARDIAN_FEEDBACK_STATES.idle)
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
