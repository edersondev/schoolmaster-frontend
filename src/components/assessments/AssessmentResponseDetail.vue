<script setup>
import AdvancedAssessmentStatusBadges from './AdvancedAssessmentStatusBadges.vue'

defineProps({
  response: { type: Object, default: null },
})
</script>

<template>
  <section v-if="response" class="space-y-4">
    <header>
      <h2 class="text-xl font-semibold text-sm-heading">{{ response.studentDisplayName || response.id }}</h2>
      <AdvancedAssessmentStatusBadges :grading-status="response.gradingStatus" />
    </header>
    <article v-for="answer in response.answers" :key="answer.id" class="rounded border border-sm-border p-4">
      <AdvancedAssessmentStatusBadges :question-type="answer.questionType || answer.question_type" :scan-status="answer.scanStatus || answer.scan_status" />
      <p class="mt-2 text-sm font-medium text-sm-heading">{{ answer.prompt }}</p>
      <p v-if="(answer.questionType || answer.question_type) === 'long_text'" class="mt-2 whitespace-pre-wrap text-sm text-sm-body">
        {{ answer.text || answer.text_answer }}
      </p>
    </article>
  </section>
</template>
