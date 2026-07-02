<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GuardianAcademicSummaryPanels from '@/components/guardian/GuardianAcademicSummaryPanels.vue'
import GuardianFeedbackState from '@/components/guardian/GuardianFeedbackState.vue'
import GuardianLearningSetSummaryList from '@/components/guardian/GuardianLearningSetSummaryList.vue'
import GuardianWorkspaceNav from '@/components/guardian/GuardianWorkspaceNav.vue'
import { useGuardianAcademicSummary } from '@/composables/guardian/useGuardianAcademicSummary'

const route = useRoute()
const academics = useGuardianAcademicSummary({ route })

onMounted(() => {
  academics.load()
})
</script>

<template>
  <main class="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
    <GuardianWorkspaceNav :student-profile-id="academics.studentProfileId.value" />
    <GuardianFeedbackState :feedback="academics.state.feedback" />
    <GuardianAcademicSummaryPanels
      v-if="academics.state.summary"
      :grade-summary="academics.state.summary.gradeSummary"
      :attendance-summary="academics.state.summary.attendanceSummary"
    />
    <GuardianLearningSetSummaryList
      v-if="academics.state.summary"
      :items="academics.state.summary.learningSets"
    />
  </main>
</template>
