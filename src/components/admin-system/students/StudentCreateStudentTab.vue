<script setup>
import StudentProfileForm from './StudentProfileForm.vue'

const model = defineModel({ type: Object, default: () => ({}) })
defineProps({
  fieldErrors: { type: Object, default: () => ({}) },
})
</script>

<template>
  <StudentProfileForm v-model="model" :field-errors="fieldErrors" />
</template>
