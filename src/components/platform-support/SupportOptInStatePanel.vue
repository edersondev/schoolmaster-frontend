<script setup>
import { useI18n } from 'vue-i18n'
import PlatformSupportStatusBadges from './PlatformSupportStatusBadges.vue'

defineProps({
  decision: { type: Object, default: null },
})
const { t } = useI18n()
</script>

<template>
  <section class="rounded border border-slate-200 bg-white p-4">
    <h2 class="text-lg font-semibold text-slate-900">{{ t('platformSupport.decisions.optIn') }}</h2>
    <PlatformSupportStatusBadges :opt-in-state="decision?.optInState" :approval-state="decision?.platformApprovalState" />
    <p class="mt-3 text-sm text-slate-600">{{ t('platformSupport.feedback.unsupportedAction') }}</p>
  </section>
</template>

