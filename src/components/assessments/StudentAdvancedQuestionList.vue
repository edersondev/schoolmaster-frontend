<script setup>
import { computed } from 'vue'
import LongTextAnswerEntry from './LongTextAnswerEntry.vue'
import FileResponseSelector from './FileResponseSelector.vue'
import AdvancedAssessmentStatusBadges from './AdvancedAssessmentStatusBadges.vue'

const props = defineProps({
  questions: { type: Array, default: () => [] },
  textAnswers: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update-text', 'select-file', 'invalid-file'])

const trueFalseOptions = Object.freeze([
  { label: 'True', value: 'true' },
  { label: 'False', value: 'false' },
])

const choiceOptionsByQuestion = computed(() =>
  Object.fromEntries(props.questions.map((question) => [question.id, question.options?.length ? question.options : trueFalseOptions])),
)
</script>

<template>
  <div class="space-y-4">
    <article v-for="question in questions" :key="question.id" class="rounded border border-sm-border p-4">
      <AdvancedAssessmentStatusBadges :question-type="question.type" />
      <LongTextAnswerEntry
        v-if="question.type === 'long_text'"
        :question="question"
        :model-value="textAnswers[question.id] ?? ''"
        :disabled="disabled"
        @update:model-value="emit('update-text', question.id, $event)"
      />
      <FileResponseSelector
        v-else-if="question.type === 'file_response'"
        :question="question"
        :disabled="disabled"
        @select="emit('select-file', question.id, $event, question.fileRule)"
        @invalid="emit('invalid-file', $event)"
      />
      <ElFormItem v-else-if="question.type === 'short_text'" :label="question.prompt">
        <ElInput
          :model-value="textAnswers[question.id] ?? ''"
          :disabled="disabled"
          @update:model-value="emit('update-text', question.id, $event)"
        />
      </ElFormItem>
      <ElFormItem v-else-if="question.type === 'multiple_choice'" :label="question.prompt">
        <ElSelect
          :model-value="textAnswers[question.id] ?? ''"
          :disabled="disabled"
          @update:model-value="emit('update-text', question.id, $event)"
        >
          <ElOption
            v-for="option in choiceOptionsByQuestion[question.id]"
            :key="option.id ?? option.value ?? option.label"
            :label="option.label ?? option.value ?? option.id"
            :value="option.value ?? option.id ?? option.label"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem v-else-if="question.type === 'true_false'" :label="question.prompt">
        <ElRadioGroup
          :model-value="textAnswers[question.id] ?? ''"
          :disabled="disabled"
          @update:model-value="emit('update-text', question.id, $event)"
        >
          <ElRadio v-for="option in trueFalseOptions" :key="option.value" :label="option.value">{{ option.label }}</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <p v-else class="mt-3 text-sm text-sm-muted">{{ question.prompt }}</p>
    </article>
  </div>
</template>
