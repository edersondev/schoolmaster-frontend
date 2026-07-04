<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdvancedAssessmentStatusRegion from '@/components/assessments/AdvancedAssessmentStatusRegion.vue'
import AssessmentResponseDetail from '@/components/assessments/AssessmentResponseDetail.vue'
import ManualAssessmentGradingForm from '@/components/assessments/ManualAssessmentGradingForm.vue'
import FailedScanGradingActions from '@/components/assessments/FailedScanGradingActions.vue'
import AnswerFileDownloadControl from '@/components/assessments/AnswerFileDownloadControl.vue'
import { useAdvancedAssessmentAccess } from '@/composables/assessments/useAdvancedAssessmentAccess'
import { useAssessmentReviewDetail } from '@/composables/assessments/useAssessmentReviewDetail'
import { useManualAssessmentGrading } from '@/composables/assessments/useManualAssessmentGrading'

const route = useRoute()
const access = useAdvancedAssessmentAccess()
const detail = useAssessmentReviewDetail({ options: access.options.value })
const grading = useManualAssessmentGrading({ options: access.options.value })

onMounted(() => {
  if (!access.canGrade.value.allowed) {
    detail.state.feedback = access.canGrade.value.feedback
    return
  }
  detail.load(route.params.responseAttemptId)
})

function grade(input) {
  grading.grade(route.params.responseAttemptId, input)
}
</script>

<template>
  <section class="space-y-5">
    <AdvancedAssessmentStatusRegion :busy="detail.state.loading" :feedback="detail.state.feedback || grading.state.feedback" />
    <AssessmentResponseDetail :response="detail.state.response" />
    <div v-if="detail.state.response" class="space-y-4">
      <AnswerFileDownloadControl
        v-for="file in detail.state.response.files"
        :key="file.id"
        :file="file"
        :pending="detail.state.pendingDownload"
        @download="detail.downloadFile($event.id)"
      />
      <article v-for="answer in detail.state.response.answers" :key="answer.id" class="rounded border border-sm-border p-4">
        <ManualAssessmentGradingForm
          v-if="answer.scanStatus !== 'failed'"
          :answer="answer"
          :pending="grading.state.pending"
          @grade="grade"
        />
        <FailedScanGradingActions
          v-else
          :answer="answer"
          :pending="grading.state.pending"
          @grade="grade"
        />
      </article>
    </div>
  </section>
</template>
