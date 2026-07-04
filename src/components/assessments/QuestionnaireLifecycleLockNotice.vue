<script setup>
defineProps({
  state: { type: String, default: 'editable' },
})
</script>

<template>
  <ElAlert
    v-if="state !== 'editable'"
    title="Locked questionnaire"
    type="warning"
    :closable="false"
    show-icon
  />
</template>
