<script setup>
import { computed } from 'vue'
import AdvancedAssessmentStatusRegion from '@/components/assessments/AdvancedAssessmentStatusRegion.vue'
import AdvancedAssessmentReportingPanel from '@/components/assessments/AdvancedAssessmentReportingPanel.vue'
import { useAdvancedAssessmentAccess } from '@/composables/assessments/useAdvancedAssessmentAccess'
import { useAdvancedAssessmentReporting } from '@/composables/assessments/useAdvancedAssessmentReporting'

const access = useAdvancedAssessmentAccess()
const reporting = useAdvancedAssessmentReporting({ options: access.options.value })
const feedback = computed(() => (access.canReport.value.allowed ? reporting.state.feedback : access.canReport.value.feedback))
</script>

<template>
  <section class="space-y-5">
    <AdvancedAssessmentStatusRegion :busy="reporting.state.loading" :feedback="feedback" />
    <AdvancedAssessmentReportingPanel
      :fields="reporting.allowedFields.value"
      :loading="reporting.state.loading"
      @request="reporting.requestReport"
    />
  </section>
</template>
