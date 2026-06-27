<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createRoleForm,
  isSchoolPermission,
  validateRoleForm,
} from '@/contracts/admin-system/access'
import { createRole } from '@/services/admin-system/roles'
import { listPermissions } from '@/services/admin-system/permissions'
import { useAdministrationCreatePage } from '@/composables/admin-system/useAdministrationCreatePage'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import RoleForm from '@/components/admin-system/roles/RoleForm.vue'
const { t } = useI18n()
const page = useAdministrationCreatePage({
  initialValues: createRoleForm(),
  validate: validateRoleForm,
  submitter: createRole,
  operationId: 'createRole',
  listRouteName: 'rolesList',
  tenantOwned: true,
})
const selectedPermissionIds = computed(() => page.form.values.permissionIds)
const permissionLookup = useAdminLookup({
  loader: listPermissions,
  tenantId: page.tenantId,
  selectedIds: selectedPermissionIds,
  operationId: 'listPermissions',
})
const schoolPermissions = computed(() => permissionLookup.options.value.filter(isSchoolPermission))
onMounted(() => permissionLookup.load(1))
</script>
<template>
  <AdminFormPage
    :title="t('administration.roles.createTitle')"
    :pending="page.form.pending.value"
    :field-errors="page.form.fieldErrors.value"
    :form-error="page.form.formError.value"
    @submit="page.submit"
    @cancel="page.cancel"
  >
    <RoleForm
      v-model="page.form.values"
      :errors="page.form.fieldErrors.value"
      :permissions="schoolPermissions"
      :permissions-loading="permissionLookup.status.value === 'loading'"
      :lookup-meta="permissionLookup.meta.value"
      @lookup-page="permissionLookup.setPage"
    />
  </AdminFormPage>
</template>
