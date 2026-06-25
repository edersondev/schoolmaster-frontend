<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { createUserForm } from '@/contracts/admin-system/users'
import { createUser } from '@/services/admin-system/users'
import { listRoles } from '@/services/admin-system/roles'
import { useAdministrationCreatePage } from '@/composables/admin-system/useAdministrationCreatePage'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import UserForm from '@/components/admin-system/users/UserForm.vue'
const { t } = useI18n()
const page = useAdministrationCreatePage({
  initialValues: createUserForm(),
  submitter: createUser,
  operationId: 'createUser',
  listRouteName: 'usersList',
  tenantOwned: true,
})
const selectedRoleIds = computed(() => page.form.values.roleIds)
const roleLookup = useAdminLookup({
  loader: listRoles,
  tenantId: page.tenantId,
  selectedIds: selectedRoleIds,
  operationId: 'listRoles',
  status: 'active',
})
onMounted(() => roleLookup.load(1))
</script>
<template>
  <AdminFormPage
    :title="t('administration.users.createTitle')"
    :pending="page.form.pending.value"
    :field-errors="page.form.fieldErrors.value"
    :form-error="page.form.formError.value"
    @submit="page.submit"
    @cancel="page.cancel"
  >
    <UserForm
      v-model="page.form.values"
      :errors="page.form.fieldErrors.value"
      :roles="roleLookup.options.value"
      :roles-loading="roleLookup.status.value === 'loading'"
      :lookup-meta="roleLookup.meta.value"
      @lookup-page="roleLookup.setPage"
    />
  </AdminFormPage>
</template>
