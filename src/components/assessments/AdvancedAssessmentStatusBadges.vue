<script setup>
defineProps({
  questionType: { type: String, default: '' },
  gradingStatus: { type: String, default: '' },
  scanStatus: { type: String, default: '' },
  dueDate: { type: String, default: '' },
})

const typeLabel = (value) => value.replaceAll('_', ' ')
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <ElTag v-if="questionType" type="info" effect="plain">{{ typeLabel(questionType) }}</ElTag>
    <ElTag v-if="gradingStatus" type="success" effect="plain">{{ typeLabel(gradingStatus) }}</ElTag>
    <ElTag v-if="scanStatus" :type="scanStatus === 'clean' ? 'success' : 'warning'" effect="plain">
      {{ typeLabel(scanStatus) }}
    </ElTag>
    <ElTag v-if="dueDate" type="warning" effect="plain">{{ dueDate }}</ElTag>
  </div>
</template>
