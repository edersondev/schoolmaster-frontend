<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdvancedAssessmentStatusRegion from '@/components/assessments/AdvancedAssessmentStatusRegion.vue'
import StudentAdvancedQuestionList from '@/components/assessments/StudentAdvancedQuestionList.vue'
import StudentResponseSubmitStatus from '@/components/assessments/StudentResponseSubmitStatus.vue'
import { useAdvancedAssessmentAccess } from '@/composables/assessments/useAdvancedAssessmentAccess'
import { useStudentAdvancedResponse } from '@/composables/assessments/useStudentAdvancedResponse'

const route = useRoute()
const access = useAdvancedAssessmentAccess()
const response = useStudentAdvancedResponse({ options: access.options.value })
const feedback = computed(() => (access.canSubmit.value.allowed ? response.state.feedback : access.canSubmit.value.feedback))

onMounted(() => {
  if (!access.canSubmit.value.allowed) {
    response.state.feedback = access.canSubmit.value.feedback
    return
  }
  response.load(route.params.questionnaireId)
})
</script>

<template>
  <section class="space-y-5">
    <AdvancedAssessmentStatusRegion :busy="response.state.loading || response.state.pending" :feedback="feedback" />
    <StudentResponseSubmitStatus :due-date-passed="response.dueDatePassed.value" :submitted="Boolean(response.state.submitted)" :pending="response.state.pending" />
    <StudentAdvancedQuestionList
      :questions="response.questions.value"
      :text-answers="response.state.textAnswers"
      :disabled="!response.canSubmit.value"
      @update-text="response.setTextAnswer"
      @select-file="response.setFileAnswer"
      @invalid-file="response.state.feedback = { type: 'validation', gate: $event }"
    />
    <ElButton type="primary" :disabled="!response.canSubmit.value" :loading="response.state.pending" @click="response.submit">Submit</ElButton>
  </section>
</template>
