<script setup>
import AdvancedAssessmentStatusBadges from './AdvancedAssessmentStatusBadges.vue'

defineProps({
  result: { type: Object, default: null },
})
</script>

<template>
  <section v-if="result" class="space-y-3 rounded border border-sm-border p-4">
    <AdvancedAssessmentStatusBadges :grading-status="result.gradingStatus" />
    <p class="text-sm text-sm-body">{{ result.teacherFeedbackSummary }}</p>
    <p class="text-sm font-semibold text-sm-heading">{{ result.scoreSummary?.label || result.scoreSummary || 'Score pending' }}</p>
  </section>
</template>
