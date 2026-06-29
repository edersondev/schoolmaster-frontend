<script setup>
import { computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { createRoleForm, mapRoleForm, validateRoleForm } from '@/contracts/admin-system/access'
import { useAdminDetail } from '@/composables/admin-system/useAdminDetail'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'
import { useAdminUpdateForm } from '@/composables/admin-system/useAdminUpdateForm'
import { useUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { listPermissions } from '@/services/admin-system/permissions'
import { getRole, updateRole } from '@/services/admin-system/roles'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminFeedbackState from '@/components/ui/admin/AdminFeedbackState.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import RoleEditFields from '@/components/admin-system/roles/RoleEditFields.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const sessionStore = useAuthSessionStore()
const { activeSchool } = storeToRefs(sessionStore)
const roleId = computed(() => String(route.params.roleId ?? ''))
const tenantId = computed(() => activeSchool.value?.id ?? null)
const detail = useAdminDetail({
  id: roleId,
  schoolId: tenantId,
  schoolRequired: true,
  loader: getRole,
  operationId: 'getRole',
  routeName: route.name,
})
const form = useAdminUpdateForm({
  initialValues: createRoleForm(),
  operationId: 'updateRole',
  routeName: route.name,
  validate: validateRoleForm,
  submitter: (values) => updateRole(roleId.value, values, { schoolId: tenantId.value }),
  mapResult: mapRoleForm,
})
const selectedPermissionIds = computed(() => form.values.permissionIds)
const permissionLookup = useAdminLookup({
  loader: listPermissions,
  tenantId,
  selectedIds: selectedPermissionIds,
  operationId: 'listPermissions',
  status: 'active',
})

useUnsavedChangesGuard({ isDirty: form.isDirty, submitted: form.submitted })

const destination = () => createReturnToListLocation(route, 'rolesList')

async function loadRole() {
  const role = await detail.load()
  if (role) form.reset(mapRoleForm(role))
}

async function submit() {
  try {
    await form.submit()
    ElMessage.success(t('administration.common.updateSuccess'))
    await router.push(destination())
  } catch {}
}

function cancel() {
  router.push(destination())
}

onMounted(() => {
  if (tenantId.value) permissionLookup.load(1)
})
watch([roleId, tenantId], loadRole, { immediate: true })
</script>

<template>
  <section v-if="detail.status.value !== 'ready'" class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="font-display text-2xl font-semibold text-sm-text">{{ t('administration.roles.editTitle') }}</h1>
    <AdminFeedbackState :state="detail.status.value" :feedback="detail.error.value" @retry="loadRole" />
    <div class="flex justify-end"><ElButton @click="cancel">{{ t('administration.common.cancel') }}</ElButton></div>
  </section>
  <AdminFormPage
    v-else
    :title="t('administration.roles.editTitle')"
    :pending="form.pending.value"
    :field-errors="form.fieldErrors.value"
    :form-error="form.formError.value"
    :submit-label="t('administration.common.update')"
    @submit="submit"
    @cancel="cancel"
  >
    <RoleEditFields
      v-model="form.values"
      :errors="form.fieldErrors.value"
      :permissions="permissionLookup.options.value"
      :permissions-loading="permissionLookup.status.value === 'loading'"
      :lookup-meta="permissionLookup.meta.value"
      @lookup-page="permissionLookup.setPage"
    />
  </AdminFormPage>
</template>
