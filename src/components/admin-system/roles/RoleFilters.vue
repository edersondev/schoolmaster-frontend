<script setup>
import SchoolFilters from '../schools/SchoolFilters.vue'
defineProps({ status: { type: String, default: '' } })
defineEmits(['update:status', 'reset'])
</script>
<template>
  <SchoolFilters
    :status="status"
    @submit="$emit('update:status', $event.status)"
    @reset="$emit('reset')"
  />
</template>
