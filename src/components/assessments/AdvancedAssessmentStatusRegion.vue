<script setup>
import AdvancedAssessmentFeedbackState from './AdvancedAssessmentFeedbackState.vue'

defineProps({
  busy: { type: Boolean, default: false },
  feedback: { type: Object, default: null },
})
</script>

<template>
  <section aria-live="polite" aria-atomic="true" class="space-y-3">
    <ElSkeleton v-if="busy" :rows="2" animated />
    <AdvancedAssessmentFeedbackState v-else :feedback="feedback" />
  </section>
</template>
