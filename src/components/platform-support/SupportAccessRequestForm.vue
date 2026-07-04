<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  draft: { type: Object, required: true },
  canSubmit: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
})
const emit = defineEmits(['update', 'submit'])
const { t } = useI18n()
</script>

<template>
  <ElForm label-position="top" class="space-y-3">
    <h2 class="text-lg font-semibold text-slate-900">{{ t('platformSupport.decisions.form') }}</h2>
    <ElFormItem :label="t('platformSupport.labels.targetSchool')">
      <ElInput :model-value="draft.targetSchoolId" @update:model-value="emit('update', { targetSchoolId: $event })" />
    </ElFormItem>
    <ElFormItem :label="t('platformSupport.labels.reasonCode')">
      <ElInput :model-value="draft.reasonCode" @update:model-value="emit('update', { reasonCode: $event })" />
    </ElFormItem>
    <ElFormItem :label="t('platformSupport.labels.purpose')">
      <ElInput
        :model-value="draft.purpose"
        type="textarea"
        :rows="3"
        @update:model-value="emit('update', { purpose: $event })"
      />
    </ElFormItem>
    <ElFormItem :label="t('platformSupport.labels.correlationId')">
      <ElInput :model-value="draft.correlationId" @update:model-value="emit('update', { correlationId: $event })" />
    </ElFormItem>
    <ElButton type="primary" :disabled="!canSubmit" :loading="submitting" @click="emit('submit')">
      {{ t('platformSupport.actions.request') }}
    </ElButton>
  </ElForm>
</template>
