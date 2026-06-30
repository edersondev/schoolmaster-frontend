<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AuthRecoveryActions from './AuthRecoveryActions.vue'

const props = defineProps({
  feedback: { type: Object, default: null },
})

const emit = defineEmits(['recover'])
const { t } = useI18n()
const messageKey = computed(() => props.feedback?.messageKey ?? 'feedback.invalidToken')
const type = computed(() =>
  props.feedback?.state === 'temporary-unavailable'
    ? 'error'
    : props.feedback?.state === 'conflict'
      ? 'warning'
      : 'warning',
)
</script>

<template>
  <section class="grid gap-4" role="status" aria-live="polite">
    <ElAlert
      :title="t(`accountLifecycle.${messageKey}`)"
      :type="type"
      :closable="false"
      show-icon
    />
    <AuthRecoveryActions :action="feedback?.recoveryAction" @recover="emit('recover', $event)" />
  </section>
</template>

