<script setup>
import RoleForm from './RoleForm.vue'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
  permissions: { type: Array, default: () => [] },
  permissionsLoading: { type: Boolean, default: false },
  lookupMeta: { type: Object, default: () => ({ page: 1, perPage: 25, total: 0 }) },
})
defineEmits(['lookup-page'])
</script>

<template>
  <RoleForm
    v-model="model"
    :errors="errors"
    :permissions="permissions"
    :permissions-loading="permissionsLoading"
    :lookup-meta="lookupMeta"
    @lookup-page="$emit('lookup-page', $event)"
  />
</template>
