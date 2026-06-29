<script setup>
import AcademicYearForm from './AcademicYearForm.vue'

const model = defineModel({ type: Object, required: true })
defineProps({ errors: { type: Object, default: () => ({}) } })
</script>

<template>
  <AcademicYearForm v-model="model" :errors="errors" />
</template>
