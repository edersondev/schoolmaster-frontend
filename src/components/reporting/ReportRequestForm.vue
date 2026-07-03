<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportingFeedbackState from './ReportingFeedbackState.vue'

const props = defineProps({
  draft: { type: Object, required: true },
  catalog: { type: Object, default: null },
  definitions: { type: Array, default: () => [] },
  feedback: { type: Object, default: null },
  canSubmit: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])
const { t } = useI18n()
const domainOptions = computed(() => props.catalog?.domains ?? [])
const formatOptions = computed(() => props.catalog?.outputFormats ?? [])
</script>

<template>
  <ElForm label-position="top" class="rounded-md border border-slate-200 bg-white p-4">
    <h2 class="mb-4 text-lg font-semibold text-slate-950">{{ t('reporting.request.title') }}</h2>
    <ReportingFeedbackState :feedback="feedback" class="mb-4" />
    <ElFormItem :label="t('reporting.labels.reportType')">
      <ElSelect v-model="draft.reportType" class="w-full" clearable>
        <ElOption
          v-for="domain in domainOptions"
          :key="domain.id || domain.code || domain.name"
          :label="domain.label || domain.name || domain.id"
          :value="domain.id || domain.code || domain.name"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem :label="t('reporting.labels.customDefinition')">
      <ElSelect v-model="draft.reportDefinitionId" class="w-full" clearable>
        <ElOption v-for="definition in definitions" :key="definition.id" :label="definition.name" :value="definition.id" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem :label="t('reporting.labels.outputFormats')">
      <ElCheckboxGroup v-model="draft.outputFormats">
        <ElCheckbox v-for="format in formatOptions" :key="format" :label="format">
          {{ format.toUpperCase() }}
        </ElCheckbox>
      </ElCheckboxGroup>
    </ElFormItem>
    <ElButton type="primary" :disabled="!canSubmit" @click="emit('submit')">
      {{ t('reporting.actions.request') }}
    </ElButton>
  </ElForm>
</template>
