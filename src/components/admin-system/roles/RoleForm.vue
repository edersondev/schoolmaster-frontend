<script setup>
import AdminLookupSelect from '@/components/ui/admin/AdminLookupSelect.vue'
import { useI18n } from 'vue-i18n'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
  permissions: { type: Array, default: () => [] },
  permissionsLoading: { type: Boolean, default: false },
  lookupMeta: {
    type: Object,
    default: () => ({ page: 1, perPage: 25, total: 0 }),
  },
})
defineEmits(['lookup-page'])
const { t } = useI18n()
</script>
<template>
  <ElFormItem :label="t('administration.common.name')" required :error="errors.name?.[0]"
    ><ElInput v-model="model.name"
  /></ElFormItem>
  <ElFormItem
    :label="t('administration.common.permissions')"
    required
    :error="errors.permission_ids?.[0]"
  >
    <AdminLookupSelect
      v-model="model.permissionIds"
      :options="permissions"
      multiple
      :loading="permissionsLoading"
      :page="lookupMeta.page"
      :per-page="lookupMeta.perPage"
      :total="lookupMeta.total"
      @page="$emit('lookup-page', $event)"
    />
  </ElFormItem>
  <p class="text-sm text-sm-muted">{{ t('administration.common.roleScopeHelp') }}</p>
</template>
