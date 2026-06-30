<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm batch action' },
  selectedCount: { type: Number, default: 0 },
  maxCount: { type: Number, default: 100 },
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
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
    <div class="space-y-4">
      <ElAlert
        :title="`${selectedCount} selected of ${maxCount}`"
        :type="selectedCount > maxCount ? 'error' : 'info'"
        :closable="false"
        show-icon
      />
      <ElAlert
        v-for="(messages, field) in fieldErrors"
        :key="field"
        :title="messages.join(' ')"
        type="warning"
        :closable="false"
      />
      <slot />
    </div>
    <template #footer>
      <ElButton @click="emit('cancel')">Cancel</ElButton>
      <ElButton
        type="primary"
        :loading="pending"
        :disabled="selectedCount < 1 || selectedCount > maxCount"
        @click="emit('submit')"
      >
        Submit
      </ElButton>
    </template>
  </ElDialog>
</template>
