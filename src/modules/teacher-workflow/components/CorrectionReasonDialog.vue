<script setup>
import { computed } from 'vue'
import { validateCorrectionReason } from '../composables/useGrades'

const model = defineModel({ type: Boolean, default: false })
const draft = defineModel('draft', { type: Object, required: true })
const props = defineProps({
  currentValue: { type: [String, Number], default: '' },
  originalValue: { type: [String, Number], default: '' },
  pending: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const reasonError = computed(() => validateCorrectionReason(draft.value.correctionReason))
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
    <ElFormItem label="Reason" required :error="reasonError">
      <ElInput v-model="draft.correctionReason" type="textarea" :rows="4" maxlength="500" show-word-limit />
    </ElFormItem>
    <template #footer>
      <ElButton @click="model = false">Cancel</ElButton>
      <ElButton type="primary" :disabled="Boolean(reasonError)" :loading="pending" @click="emit('submit')">
        Submit correction
      </ElButton>
    </template>
  </ElDialog>
</template>
