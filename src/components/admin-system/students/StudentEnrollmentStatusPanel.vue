<script setup>
import AdminSafeFeedbackState from '@/components/admin-system/shared/AdminSafeFeedbackState.vue'

const model = defineModel({ type: Object, default: () => ({ status: '', effectiveAt: '', reason: '' }) })
defineProps({
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
  feedback: { type: Object, default: null },
  canManage: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])
</script>

<template>
  <section class="rounded-lg border border-sm-border bg-sm-surface p-5">
    <div class="grid gap-4 md:grid-cols-3">
      <ElFormItem label="Status">
        <ElSelect v-model="model.status" :disabled="!canManage">
          <ElOption label="Active" value="active" />
          <ElOption label="Inactive" value="inactive" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="Effective date" :error="fieldErrors.effective_at?.[0]">
        <ElDatePicker v-model="model.effectiveAt" class="w-full" type="date" value-format="YYYY-MM-DD" :disabled="!canManage" />
      </ElFormItem>
      <ElFormItem label="Reason" :error="fieldErrors.reason?.[0]">
        <ElInput v-model="model.reason" :disabled="!canManage" />
      </ElFormItem>
    </div>
    <AdminSafeFeedbackState v-if="feedback" :state="feedback.type" :feedback="feedback" />
    <div class="mt-4 flex justify-end">
      <ElButton type="primary" :loading="pending" :disabled="!canManage" @click="emit('submit')">Update status</ElButton>
    </div>
  </section>
</template>
