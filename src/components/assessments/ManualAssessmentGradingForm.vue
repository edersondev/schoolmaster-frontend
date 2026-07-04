<script setup>
import { reactive } from 'vue'

defineProps({
  answer: { type: Object, required: true },
  pending: { type: Boolean, default: false },
})
const emit = defineEmits(['grade'])
const form = reactive({ score: 0, studentFeedbackSummary: '' })
</script>

<template>
  <ElForm class="space-y-3" @submit.prevent>
    <ElFormItem label="Score">
      <ElInputNumber v-model="form.score" :min="0" :max="100" />
    </ElFormItem>
    <ElFormItem label="Feedback summary">
      <ElInput v-model="form.studentFeedbackSummary" type="textarea" :rows="3" />
    </ElFormItem>
    <ElButton type="primary" :loading="pending" @click="emit('grade', { ...form, answerId: answer.id })">Save grade</ElButton>
  </ElForm>
</template>
