<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdvancedAssessmentStatusRegion from '@/components/assessments/AdvancedAssessmentStatusRegion.vue'
import StudentAssessmentResultSummary from '@/components/assessments/StudentAssessmentResultSummary.vue'
import StudentResultFileAvailability from '@/components/assessments/StudentResultFileAvailability.vue'
import { useAdvancedAssessmentAccess } from '@/composables/assessments/useAdvancedAssessmentAccess'
import { useStudentAssessmentResult } from '@/composables/assessments/useStudentAssessmentResult'

const route = useRoute()
const access = useAdvancedAssessmentAccess()
const result = useStudentAssessmentResult({ options: access.options.value })

onMounted(() => {
  if (!access.canViewStudentResult.value.allowed) {
    result.state.feedback = access.canViewStudentResult.value.feedback
    return
  }
  result.load(route.params.responseAttemptId)
})
</script>

<template>
  <section class="space-y-5">
    <AdvancedAssessmentStatusRegion :busy="result.state.loading" :feedback="result.state.feedback" />
    <StudentAssessmentResultSummary :result="result.state.result" />
    <StudentResultFileAvailability :files="result.state.result?.fileAvailabilityMetadata ?? []" />
  </section>
</template>
