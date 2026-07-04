<script setup>
import { shallowRef } from 'vue'
import { validateFileSelection } from '@/contracts/assessments/studentResponsePayloadMapper'

const props = defineProps({
  question: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['select', 'invalid'])
const selectedName = shallowRef('')

function onChange(file, files) {
  const validation = validateFileSelection(files.map((item) => item.raw), props.question.fileRule)
  if (!validation.valid) {
    selectedName.value = ''
    emit('invalid', validation.reason)
    return
  }
  selectedName.value = validation.file.name
  emit('select', validation.file)
}
</script>

<template>
  <div class="space-y-2">
    <p class="text-sm font-medium text-sm-heading">{{ question.prompt }}</p>
    <ElUpload :auto-upload="false" :limit="1" :disabled="disabled" :on-change="onChange">
      <ElButton :disabled="disabled">Select file</ElButton>
    </ElUpload>
    <p v-if="selectedName" class="text-sm text-sm-muted">{{ selectedName }}</p>
  </div>
</template>
