<script setup>
const draft = defineModel({ type: Object, required: true })
const props = defineProps({
  disabled: { type: Boolean, default: true },
  pending: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])
</script>

<template>
  <form class="grid gap-4 rounded-2xl border border-sm-border bg-sm-surface p-5" @submit.prevent="emit('submit')">
    <ElAlert
      v-if="disabled"
      title="Learning-set create blocked"
      description="OpenAPI must document roster-aware create before this form can submit."
      type="warning"
      :closable="false"
      show-icon
    />
    <ElFormItem label="Title" required>
      <ElInput v-model="draft.title" :disabled="disabled" />
    </ElFormItem>
    <ElFormItem label="Description">
      <ElInput v-model="draft.description" type="textarea" :disabled="disabled" />
    </ElFormItem>
    <ElFormItem label="Due at">
      <ElInput v-model="draft.dueAt" :disabled="disabled" placeholder="YYYY-MM-DDTHH:mm:ssZ" />
    </ElFormItem>
    <ElButton type="primary" native-type="submit" :disabled="disabled" :loading="pending">
      Create learning set
    </ElButton>
  </form>
</template>
