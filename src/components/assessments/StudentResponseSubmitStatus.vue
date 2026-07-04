<script setup>
defineProps({
  dueDatePassed: { type: Boolean, default: false },
  submitted: { type: Boolean, default: false },
  pending: { type: Boolean, default: false },
})
</script>

<template>
  <ElAlert v-if="submitted" title="Submitted" type="success" :closable="false" show-icon />
  <ElAlert v-else-if="dueDatePassed" title="Due date passed" type="warning" :closable="false" show-icon />
  <ElAlert v-else-if="pending" title="Submitting" type="info" :closable="false" show-icon />
</template>
