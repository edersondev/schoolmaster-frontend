<script setup>
import LongTextAnswerEntry from './LongTextAnswerEntry.vue'
import FileResponseSelector from './FileResponseSelector.vue'
import AdvancedAssessmentStatusBadges from './AdvancedAssessmentStatusBadges.vue'

defineProps({
  questions: { type: Array, default: () => [] },
  textAnswers: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update-text', 'select-file', 'invalid-file'])
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
      <p v-else class="mt-3 text-sm text-sm-muted">{{ question.prompt }}</p>
    </article>
  </div>
</template>
