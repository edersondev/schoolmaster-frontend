<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import PlatformReportingOverviewPanel from '@/components/platform-support/PlatformReportingOverviewPanel.vue'
import PlatformSchoolSummaryList from '@/components/platform-support/PlatformSchoolSummaryList.vue'
import { usePlatformReportingOverview } from '@/composables/platform-support/usePlatformReportingOverview'
import { usePlatformSchoolSummaries } from '@/composables/platform-support/usePlatformSchoolSummaries'

const props = defineProps({
  access: { type: Object, default: null },
})

const { t } = useI18n()
const summaries = usePlatformSchoolSummaries({ access: props.access })
const reporting = usePlatformReportingOverview({ access: props.access })

onMounted(() => {
  summaries.load()
  reporting.load()
})
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold text-slate-950">{{ t('platformSupport.oversight.title') }}</h1>
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <PlatformSchoolSummaryList
        :items="summaries.state.items"
        :feedback="summaries.state.feedback"
        :empty-state="summaries.emptyState.value"
        :loading="summaries.state.loading"
        @refresh="summaries.load"
      />
      <PlatformReportingOverviewPanel
        :overview="reporting.state.overview"
        :feedback="reporting.state.feedback"
        :loading="reporting.state.loading"
        @refresh="reporting.load"
      />
    </div>
  </section>
</template>

