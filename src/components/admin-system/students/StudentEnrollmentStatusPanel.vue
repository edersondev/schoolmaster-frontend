<script setup>
import { useI18n } from 'vue-i18n'
import AdminSafeFeedbackState from '@/components/admin-system/shared/AdminSafeFeedbackState.vue'

const model = defineModel({
  type: Object,
  default: () => ({ status: '', effectiveAt: '', reason: '' }),
})
defineProps({
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
  feedback: { type: Object, default: null },
  canManage: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])
const { t } = useI18n()
</script>

<template>
  <section class="mt-6 border-t border-sm-border pt-6">
    <h2 class="mb-4 font-display text-lg font-semibold text-sm-text">
      {{ t('studentEnrollmentRoster.students.enrollmentStatus') }}
    </h2>
    <ElForm label-position="top" @submit.prevent="emit('submit')">
      <div class="grid gap-x-4 md:grid-cols-3">
        <ElFormItem :label="t('administration.common.status')">
          <ElSelect v-model="model.status" class="w-full" :disabled="!canManage">
            <ElOption :label="t('administration.common.active')" value="active" />
            <ElOption :label="t('administration.common.inactive')" value="inactive" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          :label="t('administration.common.effectiveDate')"
          :error="fieldErrors.effective_at?.[0]"
        >
          <ElDatePicker
            v-model="model.effectiveAt"
            class="w-full"
            type="date"
            value-format="YYYY-MM-DD"
            :disabled="!canManage"
          />
        </ElFormItem>
        <ElFormItem :label="t('administration.common.reason')" :error="fieldErrors.reason?.[0]">
          <ElInput v-model="model.reason" :disabled="!canManage" />
        </ElFormItem>
      </div>
      <AdminSafeFeedbackState v-if="feedback" :state="feedback.type" :feedback="feedback" />
      <div class="mt-4 flex justify-end">
        <ElButton type="primary" native-type="submit" :loading="pending" :disabled="!canManage">
          {{ t('studentEnrollmentRoster.students.updateStatus') }}
        </ElButton>
      </div>
    </ElForm>
  </section>
</template>
