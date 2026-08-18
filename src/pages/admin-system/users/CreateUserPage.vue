<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { createUserForm, validateUserForm } from '@/contracts/admin-system/users'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { createUser, getUser } from '@/services/admin-system/users'
import { listRoles } from '@/services/admin-system/roles'
import { useAdministrationCreatePage } from '@/composables/admin-system/useAdministrationCreatePage'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import UserForm from '@/components/admin-system/users/UserForm.vue'
import UserInvitationPanel from '@/components/admin-system/users/UserInvitationPanel.vue'
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const sessionStore = useAuthSessionStore()
const { activeSchool, currentUser, roles, scopedPermissions } = storeToRefs(sessionStore)
const page = useAdministrationCreatePage({
  initialValues: createUserForm(),
  validate: validateUserForm,
  submitter: createUser,
  operationId: 'createUser',
  listRouteName: 'usersList',
  tenantOwned: true,
  navigateOnSuccess: false,
})
const selectedRoleIds = computed(() => page.form.values.roleIds)
const tenantId = computed(() => activeSchool.value?.id ?? null)
const roleLookup = useAdminLookup({
  loader: listRoles,
  tenantId: page.tenantId,
  selectedIds: selectedRoleIds,
  operationId: 'listRoles',
  status: 'active',
})
async function submit() {
  const user = await page.submit()
  if (!user) return
  if (user.status !== 'invited') {
    await page.finish()
    return
  }
  await router.replace({
    name: 'userCreate',
    query: { ...route.query, created_user_id: user.id },
  })
}

onMounted(async () => {
  roleLookup.load(1)
  const persistedUserId = String(route.query.created_user_id ?? '')
  if (!persistedUserId || page.result.value) return
  try {
    const user = await getUser(persistedUserId, { schoolId: tenantId.value })
    if (user?.status === 'invited') page.setResult(user)
  } catch {
    // Exact-tenant re-fetch owns authorization; invalid route intent is ignored.
  }
})
</script>
<template>
  <AdminFormPage
    v-if="!page.result.value"
    :title="t('administration.users.createTitle')"
    :pending="page.form.pending.value"
    :field-errors="page.form.fieldErrors.value"
    :form-error="page.form.formError.value"
    @submit="submit"
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
  <section v-else class="mx-auto grid w-full max-w-3xl gap-4">
    <h1 class="font-display text-2xl font-semibold text-sm-text">
      {{ t('administration.users.createTitle') }}
    </h1>
    <ElAlert
      :title="t('accountLifecycle.invitation.createdUser')"
      type="success"
      :closable="false"
      show-icon
    />
    <UserInvitationPanel
      v-if="page.result.value.status === 'invited'"
      :user="page.result.value"
      :school-id="tenantId"
      :actor-id="currentUser?.id"
      :permissions="scopedPermissions"
      :roles="roles"
    />
    <div class="flex justify-end">
      <ElButton type="primary" @click="page.finish">{{
        t('administration.common.finish')
      }}</ElButton>
    </div>
  </section>
</template>
