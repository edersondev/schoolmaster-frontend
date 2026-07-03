<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportingFeedbackState from './ReportingFeedbackState.vue'
import ReportingStatusBadges from './ReportingStatusBadges.vue'
import ReportDownloadSurface from './ReportDownloadSurface.vue'
import ReportRunLifecycleControls from './ReportRunLifecycleControls.vue'

const props = defineProps({
  run: { type: Object, default: null },
  feedback: { type: Object, default: null },
  formatTimestamp: { type: Function, required: true },
  downloads: { type: Object, required: true },
  lifecycle: { type: Object, required: true },
})
const emit = defineEmits(['download', 'lifecycle'])
const { t } = useI18n()
const timestampRows = computed(() => [
  ['reporting.labels.generatedAt', props.run?.generatedAt],
  ['reporting.labels.expiresAt', props.run?.outputExpiresAt],
  ['reporting.labels.deletedAt', props.run?.deletedAt],
])
</script>

<template>
  <aside class="space-y-4 rounded-md border border-slate-200 bg-white p-4">
    <ReportingFeedbackState :feedback="feedback" />
    <template v-if="run">
      <header class="space-y-2">
        <h2 class="text-lg font-semibold text-slate-950">{{ run.reportType }}</h2>
        <div class="flex flex-wrap gap-2">
          <ReportingStatusBadges :status="run.generationStatus" :deleted-at="run.deletedAt" />
          <span class="text-sm text-slate-600">{{ run.reportSource }}</span>
        </div>
      </header>
      <dl class="grid gap-3 text-sm md:grid-cols-3">
        <div v-for="[label, value] in timestampRows" :key="label">
          <dt class="text-slate-500">{{ t(label) }}</dt>
          <dd class="font-medium text-slate-900">{{ formatTimestamp(value) }}</dd>
        </div>
      </dl>
      <p v-if="run.sourceReportRunId || run.supersededByReportRunId" class="text-sm text-slate-600">
        {{ t('reporting.history.retryLineage') }}
      </p>
      <ReportDownloadSurface
        :run="run"
        :feedback="downloads.state.feedback"
        :can-download="downloads.canDownload"
        :availability-for="downloads.availabilityFor"
        @download="emit('download', $event)"
      />
      <ReportRunLifecycleControls :run="run" :available-actions="lifecycle.availableActions" @action="emit('lifecycle', $event)" />
    </template>
  </aside>
</template>
