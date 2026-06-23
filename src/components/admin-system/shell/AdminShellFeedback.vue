<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  feedbackState: {
    type: Object,
    required: true,
  },
})

const { t } = useI18n()
const alertType = computed(() => {
  if (props.feedbackState.severity === 'error') {
    return 'error'
  }

  if (props.feedbackState.severity === 'warning') {
    return 'warning'
  }

  return 'info'
})
</script>

<template>
  <section class="admin-feedback" :data-state="feedbackState.state" role="status" aria-live="polite">
    <ElAlert
      :type="alertType"
      :title="t(`adminSystem.${feedbackState.titleKey}`)"
      :description="t(`adminSystem.${feedbackState.messageKey}`)"
      show-icon
      :closable="false"
    />
  </section>
</template>

<style scoped>
.admin-feedback {
  padding: 1rem 1.25rem 0;
}
</style>
