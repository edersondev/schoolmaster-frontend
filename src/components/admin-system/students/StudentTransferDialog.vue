<script setup>
import { useI18n } from 'vue-i18n'

const model = defineModel('values', { type: Object, default: () => ({}) })
defineProps({
  open: { type: Boolean, default: false },
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
  feedback: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'submit', 'cancel'])
const { t } = useI18n()
</script>

<template>
  <ElDialog
    :model-value="open"
    :title="t('studentEnrollmentRoster.students.transferStudent')"
    width="min(92vw, 560px)"
    @update:model-value="emit('update:open', $event)"
    @closed="emit('cancel')"
  >
    <ElForm :model="model" label-position="top" class="grid gap-4">
      <ElFormItem
        :label="t('administration.common.effectiveDate')"
        :error="fieldErrors.effective_at?.[0]"
      >
        <ElDatePicker
          v-model="model.effectiveAt"
          class="w-full"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </ElFormItem>
      <ElFormItem :label="t('administration.common.reason')" :error="fieldErrors.reason?.[0]">
        <ElInput v-model="model.reason" type="textarea" :rows="3" />
      </ElFormItem>
      <ElFormItem :label="t('studentEnrollmentRoster.students.destinationSchool')">
        <ElInput v-model="model.destinationSchoolId" />
      </ElFormItem>
      <ElFormItem :label="t('studentEnrollmentRoster.students.destinationStudentProfile')">
        <ElInput v-model="model.destinationStudentProfileId" />
      </ElFormItem>
      <ElAlert
        v-if="feedback"
        :title="feedback.code || t('studentEnrollmentRoster.students.transferFeedback')"
        type="warning"
        :closable="false"
        show-icon
      />
    </ElForm>
    <template #footer>
      <ElButton @click="emit('cancel')">{{ t('administration.common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="pending" @click="emit('submit')">
        {{ t('studentEnrollmentRoster.students.transfer') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
