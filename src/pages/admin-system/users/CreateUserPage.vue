<script setup>
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { createUserForm, validateUserForm } from '@/contracts/admin-system/users'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { createUser, getUser, restoreUser } from '@/services/admin-system/users'
import { listRoles } from '@/services/admin-system/roles'
import { useAdministrationCreatePage } from '@/composables/admin-system/useAdministrationCreatePage'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'
import { useUserCreationRecovery } from '@/composables/admin-system/useUserCreationRecovery'
import { useAccountLifecycleActions } from '@/composables/admin-system/useAccountLifecycleActions'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import UserForm from '@/components/admin-system/users/UserForm.vue'
import UserInvitationPanel from '@/components/admin-system/users/UserInvitationPanel.vue'
import UserRecoveryAlert from '@/components/admin-system/users/UserRecoveryAlert.vue'
import AccountLifecycleActions from '@/components/admin-system/users/AccountLifecycleActions.vue'
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
const authorizationContext = computed(() =>
  JSON.stringify({
    generation: sessionStore.schoolContextGeneration,
    status: sessionStore.status,
    permissions: scopedPermissions.value
      .map(({ code, scope, status }) => `${code}:${scope}:${status}`)
      .sort(),
  }),
)
const recovery = useUserCreationRecovery({
  email: computed(() => page.form.values.email),
  schoolId: page.tenantId,
  actorId: computed(() => currentUser.value?.id ?? null),
  authorizationGeneration: authorizationContext,
  routeName: computed(() => route.name),
  restoreUser,
  onRestored: async ({ userId }) => {
    page.form.reset()
    await router.push({
      name: 'userDetail',
      params: { userId },
      query: { user_mode: 'school' },
    })
  },
})
const formError = computed(() =>
  recovery.visible.value ? null : (recovery.feedback.value ?? page.form.formError.value),
)
const roleLookup = useAdminLookup({
  loader: listRoles,
  tenantId: page.tenantId,
  selectedIds: selectedRoleIds,
  operationId: 'listRoles',
  status: 'active',
})
const postCreateLifecycle = useAccountLifecycleActions({
  target: page.result,
  schoolId: tenantId,
  actorId: computed(() => currentUser.value?.id ?? null),
  permissions: scopedPermissions,
  roles,
  routeName: computed(() => route.name),
  refreshTarget: async () => {
    const createdUserId = page.result.value?.id
    if (!createdUserId) return null
    const user = await getUser(createdUserId, { schoolId: tenantId.value })
    page.setResult(user)
    return user
  },
})

watch(
  () => page.form.formError.value,
  (feedback) => {
    if (feedback) recovery.accept(feedback)
  },
)

watch(
  [
    () => page.form.values.email,
    page.tenantId,
    () => currentUser.value?.id ?? null,
    authorizationContext,
    () => route.name,
  ],
  () => {
    page.form.invalidate()
    recovery.invalidateIfContextChanged()
    page.form.clearErrors()
  },
  { flush: 'sync' },
)
async function submit() {
  if (recovery.visible.value) {
    recovery.invalidate()
    page.form.clearErrors()
  }
  const user = await page.submit()
  if (!user) return
  if (!['active', 'invited'].includes(user.status)) {
    await page.finish()
    return
  }
  await router.replace({
    name: 'userCreate',
    query: { ...route.query, created_user_id: user.id },
  })
}

async function requestPasswordDelivery() {
  try {
    await postCreateLifecycle.requestPasswordDelivery()
  } catch {
    /* composable owns safe feedback */
  }
}

async function submitRecovery() {
  try {
    await recovery.submit()
  } catch {
    // Recovery composable owns normalized validation and terminal feedback.
  }
}

function cancel() {
  recovery.invalidate()
  page.cancel()
}

function cancelRecovery() {
  recovery.cancel()
  page.form.clearErrors()
}

onMounted(async () => {
  roleLookup.load(1)
  const persistedUserId = String(route.query.created_user_id ?? '')
  if (!persistedUserId || page.result.value) return
  try {
    const user = await getUser(persistedUserId, { schoolId: tenantId.value })
    if (['active', 'invited'].includes(user?.status)) page.setResult(user)
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
    :form-error="formError"
    @submit="submit"
    @cancel="cancel"
  >
    <UserRecoveryAlert
      :visible="recovery.visible.value"
      :pending="recovery.pending.value"
      @restore="recovery.open"
    />
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
      :title="
        t(
          page.result.value.status === 'active'
            ? 'accountLifecycle.delivery.createdUser'
            : 'accountLifecycle.invitation.createdUser',
        )
      "
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
    <AccountLifecycleActions
      v-if="page.result.value.status === 'active'"
      delivery-only
      :eligibility="postCreateLifecycle.eligibility.value"
      :delivery="postCreateLifecycle.delivery.value"
      :delivery-pending="postCreateLifecycle.deliveryPending.value"
      :delivery-error="postCreateLifecycle.deliveryError.value"
      @password-delivery="requestPasswordDelivery"
    />
    <div class="flex justify-end">
      <ElButton type="primary" @click="page.finish">{{
        t('administration.common.finish')
      }}</ElButton>
    </div>
  </section>
  <AdminLifecycleDialog
    v-model:open="recovery.dialogOpen.value"
    v-model:values="recovery.dialogValues"
    :action="recovery.dialogAction.value"
    :resource-label="t('administration.users.recovery.resourceLabel')"
    :pending="recovery.pending.value"
    :field-errors="recovery.dialogFieldErrors.value"
    :form-error="recovery.dialogFormError.value"
    @submit="submitRecovery"
    @cancel="cancelRecovery"
  />
</template>
