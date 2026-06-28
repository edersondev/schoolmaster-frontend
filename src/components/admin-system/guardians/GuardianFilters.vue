<script setup>
import SchoolFilters from '../schools/SchoolFilters.vue'
defineProps({ status: { type: String, default: '' } })
defineEmits(['update:status', 'reset'])
</script>
<template>
  <SchoolFilters
    :status="status"
    @update:status="$emit('update:status', $event)"
    @reset="$emit('reset')"
  />
</template>
