<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AuthRecoveryActions from './AuthRecoveryActions.vue'

const props = defineProps({
  feedback: {
    type: Object,
    required: true,
  },
  showRecovery: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['recover'])
const { t } = useI18n()

const messageKeys = {
  validation: 'feedback.validation',
  'invalid-credentials': 'feedback.invalidCredentials',
  lockout: 'feedback.lockout',
  'expired-session': 'feedback.expiredSession',
  unauthorized: 'feedback.unauthorized',
  forbidden: 'feedback.forbidden',
  'inactive-user': 'feedback.inactiveUser',
  'inactive-school': 'feedback.inactiveSchool',
  'tenant-mismatch': 'feedback.tenantMismatch',
  'temporary-unavailable': 'feedback.temporaryUnavailable',
  'neutral-confirmation': 'feedback.neutralConfirmation',
}

const alertType = computed(() => {
  if (props.feedback.severity === 'warning') {
    return 'warning'
  }
  if (props.feedback.severity === 'info' || props.feedback.state === 'neutral-confirmation') {
    return 'info'
  }
  return 'error'
})

const message = computed(() =>
  t(`auth.${messageKeys[props.feedback.state] ?? 'feedback.temporaryUnavailable'}`),
)
</script>

<template>
  <section class="w-full" role="status" aria-live="polite">
    <ElAlert :title="message" :type="alertType" :closable="false" show-icon />
    <AuthRecoveryActions
      v-if="showRecovery"
      :action="feedback.recoveryAction"
      @recover="emit('recover', $event)"
    />
  </section>
</template>
