<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdvancedAssessmentStatusRegion from '@/components/assessments/AdvancedAssessmentStatusRegion.vue'
import AssessmentReviewQueue from '@/components/assessments/AssessmentReviewQueue.vue'
import { useAdvancedAssessmentAccess } from '@/composables/assessments/useAdvancedAssessmentAccess'
import { useAssessmentReviewQueue } from '@/composables/assessments/useAssessmentReviewQueue'
import { ADVANCED_ASSESSMENT_ROUTE_NAMES } from '@/contracts/assessments/advancedAssessmentContract'

const router = useRouter()
const access = useAdvancedAssessmentAccess()
const queue = useAssessmentReviewQueue({ options: access.options.value })

onMounted(() => {
  if (!access.canReview.value.allowed) {
    queue.state.feedback = access.canReview.value.feedback
    return
  }
  queue.load()
})

function open(item) {
  router.push({ name: ADVANCED_ASSESSMENT_ROUTE_NAMES.grading, params: { responseAttemptId: item.id } })
}
</script>

<template>
  <section class="space-y-5">
    <AdvancedAssessmentStatusRegion :busy="queue.state.loading" :feedback="queue.state.feedback" />
    <AssessmentReviewQueue :items="queue.state.items" @select="open" />
  </section>
</template>
