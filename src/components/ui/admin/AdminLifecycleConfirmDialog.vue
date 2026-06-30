<script setup>
const model = defineModel('values', { type: Object, default: () => ({ effectiveAt: '', reason: '' }) })
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm status change' },
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
  formError: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'submit', 'cancel'])
</script>

<template>
  <ElDialog
    :model-value="open"
    :title="title"
    width="min(92vw, 560px)"
    @update:model-value="emit('update:open', $event)"
    @closed="emit('cancel')"
  >
    <div class="grid gap-4">
      <ElDatePicker v-model="model.effectiveAt" class="w-full" type="date" value-format="YYYY-MM-DD" placeholder="Effective date" />
      <ElInput v-model="model.reason" type="textarea" :rows="3" placeholder="Reason" />
      <ElAlert v-if="formError" :title="formError.code || 'Conflict'" type="warning" :closable="false" show-icon />
      <ElAlert v-for="(messages, field) in fieldErrors" :key="field" :title="messages.join(' ')" type="warning" :closable="false" />
    </div>
    <template #footer>
      <ElButton @click="emit('cancel')">Cancel</ElButton>
      <ElButton type="primary" :loading="pending" @click="emit('submit')">Submit</ElButton>
    </template>
  </ElDialog>
</template>
