<script setup>
import AdminFilterBar from '@/components/ui/admin/AdminFilterBar.vue'

defineProps({ status: { type: String, default: '' } })
defineEmits(['update:status', 'reset'])
</script>

<template>
  <AdminFilterBar
    :status="status"
    show-status
    @update:status="$emit('update:status', $event)"
    @reset="$emit('reset')"
  />
</template>
