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
  <section class="space-y-4 rounded border border-slate-200 bg-white p-4">
    <h2 class="text-lg font-semibold text-slate-900">{{ t('platformSupport.decisions.detail') }}</h2>
    <PlatformSupportFeedbackState :feedback="feedback" />
    <div v-if="decision" class="space-y-3">
      <PlatformSupportStatusBadges
        :state="decision.state"
        :opt-in-state="decision.optInState"
        :approval-state="decision.platformApprovalState"
      />
      <dl class="grid gap-2 text-sm md:grid-cols-2">
        <div><dt class="text-slate-600">{{ t('platformSupport.labels.targetSchool') }}</dt><dd>{{ decision.targetSchoolId }}</dd></div>
        <div><dt class="text-slate-600">{{ t('platformSupport.labels.reasonCode') }}</dt><dd>{{ decision.reasonCode }}</dd></div>
        <div><dt class="text-slate-600">{{ t('platformSupport.labels.correlationId') }}</dt><dd>{{ decision.correlationId }}</dd></div>
        <div><dt class="text-slate-600">{{ t('platformSupport.labels.expiresAt') }}</dt><dd>{{ decision.expiresAt }}</dd></div>
      </dl>
    </div>
  </section>
</template>

