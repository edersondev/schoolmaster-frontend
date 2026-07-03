<script setup>
import { useI18n } from 'vue-i18n'
import PlatformSupportFeedbackState from './PlatformSupportFeedbackState.vue'
import PlatformSupportStatusBadges from './PlatformSupportStatusBadges.vue'

defineProps({
  decision: { type: Object, default: null },
  feedback: { type: Object, default: null },
})
const { t } = useI18n()
</script>

<template>
  <section class="space-y-3 rounded border border-slate-200 bg-white p-4">
    <h2 class="text-lg font-semibold text-slate-900">{{ t('platformSupport.labels.decision') }}</h2>
    <PlatformSupportFeedbackState :feedback="feedback" />
    <PlatformSupportStatusBadges
      :state="decision?.state"
      :opt-in-state="decision?.optInState"
      :approval-state="decision?.platformApprovalState"
    />
  </section>
</template>

