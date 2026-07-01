<script setup>
import { computed } from 'vue'
import { validateCorrectionReason } from '../composables/useGrades'
import { ATTENDANCE_STATUSES } from '../services/attendanceService'

const model = defineModel({ type: Boolean, default: false })
const draft = defineModel('draft', { type: Object, required: true })
const props = defineProps({
  currentValue: { type: [String, Number], default: '' },
  originalValue: { type: [String, Number], default: '' },
  valueType: { type: String, default: 'grade' },
  pending: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const reasonError = computed(() => validateCorrectionReason(draft.value.correctionReason))
const valueError = computed(() => {
  if (props.valueType === 'attendance') {
    return ATTENDANCE_STATUSES.includes(draft.value.attendanceStatus) ? '' : 'Choose a corrected attendance status.'
  }

  const value = Number(draft.value.gradeValue)
  if (draft.value.gradeValue === null || draft.value.gradeValue === '' || Number.isNaN(value)) {
    return 'Corrected grade is required.'
  }
  if (value < 0 || value > 100) return 'Use a grade from 0 to 100.'
  return ''
})
const submitDisabled = computed(() => Boolean(reasonError.value || valueError.value))
</script>

<template>
  <ElDialog v-model="model" title="Correction reason" width="min(92vw, 34rem)">
    <dl class="mb-4 grid gap-2 text-sm">
      <div class="flex justify-between gap-3">
        <dt class="text-sm-muted">Current value</dt>
        <dd>{{ currentValue }}</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-sm-muted">Original value</dt>
        <dd>{{ originalValue }}</dd>
      </div>
    </dl>
    <ElFormItem
      v-if="valueType === 'attendance'"
      label="Corrected attendance"
      required
      :error="valueError"
    >
      <ElSelect v-model="draft.attendanceStatus" class="w-full">
        <ElOption v-for="status in ATTENDANCE_STATUSES" :key="status" :label="status" :value="status" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem v-else label="Corrected grade" required :error="valueError">
      <ElInputNumber v-model="draft.gradeValue" :min="0" :max="100" class="w-full" />
    </ElFormItem>
    <ElFormItem label="Reason" required :error="reasonError">
      <ElInput v-model="draft.correctionReason" type="textarea" :rows="4" maxlength="500" show-word-limit />
    </ElFormItem>
    <template #footer>
      <ElButton @click="model = false">Cancel</ElButton>
      <ElButton type="primary" :disabled="submitDisabled" :loading="pending" @click="emit('submit')">
        Submit correction
      </ElButton>
    </template>
  </ElDialog>
</template>
