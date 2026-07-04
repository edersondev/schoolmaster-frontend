<script setup>
defineProps({
  answer: { type: Object, required: true },
  pending: { type: Boolean, default: false },
})
const emit = defineEmits(['grade'])
</script>

<template>
  <div v-if="answer.scanStatus === 'failed'" class="flex gap-2">
    <ElButton :loading="pending" @click="emit('grade', { answerId: answer.id, failedScanAction: 'zero' })">Zero</ElButton>
    <ElButton :loading="pending" @click="emit('grade', { answerId: answer.id, failedScanAction: 'exempt' })">Exempt</ElButton>
  </div>
</template>
