<script setup>
const model = defineModel('values', { type: Object, default: () => ({}) })
defineProps({
  open: { type: Boolean, default: false },
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
  feedback: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'submit', 'cancel'])
</script>

<template>
  <ElDialog
    :model-value="open"
    title="Transfer student"
    width="min(92vw, 560px)"
    @update:model-value="emit('update:open', $event)"
    @closed="emit('cancel')"
  >
    <div class="grid gap-4">
      <ElFormItem label="Effective date" :error="fieldErrors.effective_at?.[0]">
        <ElDatePicker v-model="model.effectiveAt" class="w-full" type="date" value-format="YYYY-MM-DD" />
      </ElFormItem>
      <ElFormItem label="Reason" :error="fieldErrors.reason?.[0]">
        <ElInput v-model="model.reason" type="textarea" :rows="3" />
      </ElFormItem>
      <ElFormItem label="Destination school">
        <ElInput v-model="model.destinationSchoolId" />
      </ElFormItem>
      <ElFormItem label="Destination student profile">
        <ElInput v-model="model.destinationStudentProfileId" />
      </ElFormItem>
      <ElAlert v-if="feedback" :title="feedback.code || 'Transfer feedback'" type="warning" :closable="false" show-icon />
    </div>
    <template #footer>
      <ElButton @click="emit('cancel')">Cancel</ElButton>
      <ElButton type="primary" :loading="pending" @click="emit('submit')">Transfer</ElButton>
    </template>
  </ElDialog>
</template>
