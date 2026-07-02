<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { STUDENT_FEEDBACK_STATES } from '@/contracts/student/studentSelfServiceContract'

const props = defineProps({
  feedback: { type: Object, default: null },
  title: { type: String, default: '' },
})

const { t } = useI18n()

const type = computed(() => props.feedback?.type ?? STUDENT_FEEDBACK_STATES.idle)
const messageKey = computed(() => {
  const keys = {
    [STUDENT_FEEDBACK_STATES.loading]: 'studentSelfService.feedback.loading',
    [STUDENT_FEEDBACK_STATES.empty]: 'studentSelfService.feedback.empty',
    [STUDENT_FEEDBACK_STATES.success]: 'studentSelfService.feedback.success',
    [STUDENT_FEEDBACK_STATES.unauthorized]: 'studentSelfService.feedback.unauthorized',
    [STUDENT_FEEDBACK_STATES.forbidden]: 'studentSelfService.feedback.forbidden',
    [STUDENT_FEEDBACK_STATES.tenantMismatch]: 'studentSelfService.feedback.tenantMismatch',
    [STUDENT_FEEDBACK_STATES.inactiveSchool]: 'studentSelfService.feedback.inactiveSchool',
    [STUDENT_FEEDBACK_STATES.noActiveSchool]: 'studentSelfService.feedback.noActiveSchool',
    [STUDENT_FEEDBACK_STATES.noStudentProfile]: 'studentSelfService.feedback.noStudentProfile',
    [STUDENT_FEEDBACK_STATES.noCurrentPeriod]: 'studentSelfService.feedback.noCurrentPeriod',
    [STUDENT_FEEDBACK_STATES.unavailableContent]: 'studentSelfService.feedback.unavailableContent',
    [STUDENT_FEEDBACK_STATES.validation]: 'studentSelfService.feedback.validation',
    [STUDENT_FEEDBACK_STATES.notFound]: 'studentSelfService.feedback.notFound',
    [STUDENT_FEEDBACK_STATES.unsupportedPageSize]: 'studentSelfService.feedback.unsupportedPageSize',
    [STUDENT_FEEDBACK_STATES.staleResponse]: 'studentSelfService.feedback.staleResponse',
    [STUDENT_FEEDBACK_STATES.contractUnavailable]: 'studentSelfService.feedback.contractUnavailable',
  }
  return keys[type.value] ?? 'studentSelfService.feedback.temporaryUnavailable'
})

const alertType = computed(() => {
  if (type.value === STUDENT_FEEDBACK_STATES.loading) return 'info'
  if ([STUDENT_FEEDBACK_STATES.empty, STUDENT_FEEDBACK_STATES.success].includes(type.value)) {
    return 'success'
  }
  if ([STUDENT_FEEDBACK_STATES.noCurrentPeriod, STUDENT_FEEDBACK_STATES.unavailableContent].includes(type.value)) {
    return 'warning'
  }
  return 'error'
})

const visible = computed(() => props.feedback && type.value !== STUDENT_FEEDBACK_STATES.idle)
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
