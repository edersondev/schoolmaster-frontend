<script setup>
import GuardianForm from './GuardianForm.vue'

const model = defineModel({ type: Object, required: true })
defineProps({ errors: { type: Object, default: () => ({}) } })
</script>

<template>
  <GuardianForm v-model="model" :errors="errors" />
</template>
