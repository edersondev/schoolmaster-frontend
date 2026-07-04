<script setup>
import { computed } from 'vue'
import LongTextQuestionSettings from './LongTextQuestionSettings.vue'
import FileResponseQuestionSettings from './FileResponseQuestionSettings.vue'
import QuestionnaireLifecycleLockNotice from './QuestionnaireLifecycleLockNotice.vue'

const props = defineProps({
  question: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update'])

const locked = computed(() => props.disabled || props.question.lifecycleLockState === 'locked')

function patch(values) {
  emit('update', { ...props.question, ...values })
}
</script>

<template>
  <section class="space-y-4 rounded border border-sm-border p-4">
    <QuestionnaireLifecycleLockNotice :state="question.lifecycleLockState" />
    <div class="grid gap-3 md:grid-cols-[180px_1fr]">
      <ElFormItem label="Type">
        <ElSelect :model-value="question.type" :disabled="locked" @update:model-value="patch({ type: $event })">
          <ElOption label="Multiple choice" value="multiple_choice" />
          <ElOption label="True/false" value="true_false" />
          <ElOption label="Short text" value="short_text" />
          <ElOption label="Long text" value="long_text" />
          <ElOption label="File response" value="file_response" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="Prompt">
        <ElInput :model-value="question.prompt" :disabled="locked" @update:model-value="patch({ prompt: $event })" />
      </ElFormItem>
    </div>
    <LongTextQuestionSettings
      v-if="question.type === 'long_text'"
      :model-value="question.answerSchema"
      :disabled="locked"
      @update:model-value="patch({ answerSchema: $event })"
    />
    <FileResponseQuestionSettings
      v-if="question.type === 'file_response'"
      :model-value="question.fileRule"
      :disabled="locked"
      @update:model-value="patch({ fileRule: $event })"
    />
  </section>
</template>
