<script setup>
import UserForm from './UserForm.vue'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
  roles: { type: Array, default: () => [] },
  rolesLoading: { type: Boolean, default: false },
  lookupMeta: { type: Object, default: () => ({ page: 1, perPage: 25, total: 0 }) },
})
defineEmits(['lookup-page'])
</script>

<template>
  <UserForm
    v-model="model"
    :errors="errors"
    :roles="roles"
    :roles-loading="rolesLoading"
    :lookup-meta="lookupMeta"
    @lookup-page="$emit('lookup-page', $event)"
  />
</template>
