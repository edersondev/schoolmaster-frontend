<script setup>
import { computed } from 'vue'
import { validateLongTextAnswer } from '@/contracts/assessments/studentResponsePayloadMapper'

const props = defineProps({
  question: { type: Object, required: true },
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
const validation = computed(() => validateLongTextAnswer(props.modelValue, props.question.answerSchema))
</script>

<template>
  <ElFormItem :label="question.prompt" :error="validation.valid ? '' : validation.reason">
    <ElInput
      type="textarea"
      :rows="6"
      :maxlength="question.answerSchema?.maxLength ?? 10000"
      show-word-limit
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </ElFormItem>
</template>
