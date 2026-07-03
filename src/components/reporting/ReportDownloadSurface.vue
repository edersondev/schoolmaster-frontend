<script setup>
import { Download } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import ReportingStatusBadges from './ReportingStatusBadges.vue'
import ReportingFeedbackState from './ReportingFeedbackState.vue'

defineProps({
  run: { type: Object, default: null },
  feedback: { type: Object, default: null },
  canDownload: { type: Function, required: true },
  availabilityFor: { type: Function, required: true },
})
const emit = defineEmits(['download'])
const { t } = useI18n()
</script>

<template>
  <section v-if="run" class="space-y-3">
    <h3 class="text-base font-semibold text-slate-950">{{ t('reporting.downloads.title') }}</h3>
    <ReportingFeedbackState :feedback="feedback" />
    <div class="grid gap-3 md:grid-cols-3">
      <div v-for="format in run.outputFormats" :key="format" class="rounded-md border border-slate-200 p-3">
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium text-slate-900">{{ format.toUpperCase() }}</span>
          <ReportingStatusBadges :availability="availabilityFor(run, format)" />
        </div>
        <ElButton
          class="mt-3 w-full"
          :icon="Download"
          :disabled="!canDownload(run, format)"
          @click="emit('download', format)"
        >
          {{ t('reporting.actions.download') }}
        </ElButton>
      </div>
    </div>
  </section>
</template>
