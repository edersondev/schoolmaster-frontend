<script setup>
import { computed, shallowRef } from 'vue'
import { ROSTER_BATCH_LIMIT } from '@/contracts/admin-system/classroom-roster'
import AdminBatchActionDialog from '@/components/ui/admin/AdminBatchActionDialog.vue'

const model = defineModel({ type: Object, default: () => ({}) })
defineProps({
  mode: { type: String, default: 'add' },
  selectedCount: { type: Number, default: 0 },
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit'])
const dialogOpen = shallowRef(false)
const studentIdsInput = computed({
  get: () => (Array.isArray(model.value.studentProfileIds) ? model.value.studentProfileIds.join(', ') : ''),
  set: (value) => {
    model.value.studentProfileIds = String(value ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  },
})

function submitBatch() {
  emit('submit')
  dialogOpen.value = false
}
</script>

<template>
  <section class="rounded-lg border border-sm-border bg-sm-surface p-5">
    <div class="grid gap-4 md:grid-cols-3">
      <ElFormItem v-if="mode === 'add'" label="Effective start" :error="fieldErrors.effective_start_date?.[0]">
        <ElDatePicker v-model="model.effectiveStartDate" class="w-full" type="date" value-format="YYYY-MM-DD" />
      </ElFormItem>
      <ElFormItem v-else label="Effective end" :error="fieldErrors.effective_end_date?.[0]">
        <ElDatePicker v-model="model.effectiveEndDate" class="w-full" type="date" value-format="YYYY-MM-DD" />
      </ElFormItem>
      <ElFormItem v-if="mode === 'add'" label="Academic period" :error="fieldErrors.academic_period_id?.[0]">
        <ElInput v-model="model.academicPeriodId" />
      </ElFormItem>
      <ElFormItem v-else label="Reason" :error="fieldErrors.reason?.[0]">
        <ElInput v-model="model.reason" />
      </ElFormItem>
      <ElFormItem v-if="mode === 'add'" label="Student profile IDs" :error="fieldErrors.student_profile_ids?.[0]">
        <ElInput v-model="studentIdsInput" placeholder="student-1, student-2" />
      </ElFormItem>
    </div>
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <span class="text-sm text-sm-muted">
        {{ selectedCount }} selected. Maximum {{ ROSTER_BATCH_LIMIT }} per batch.
      </span>
      <ElButton type="primary" :loading="pending" @click="dialogOpen = true">
        {{ mode === 'add' ? 'Review add batch' : 'Review end batch' }}
      </ElButton>
    </div>
    <AdminBatchActionDialog
      :open="dialogOpen"
      :title="mode === 'add' ? 'Add memberships' : 'End memberships'"
      :selected-count="selectedCount"
      :max-count="ROSTER_BATCH_LIMIT"
      :pending="pending"
      :field-errors="fieldErrors"
      @cancel="dialogOpen = false"
      @submit="submitBatch"
    />
  </section>
</template>
