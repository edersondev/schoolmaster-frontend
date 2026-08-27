<script setup>
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { deriveLifecycleActions } from '@/composables/admin-system/useAdminActionEligibility'
import { useAdminDetail } from '@/composables/admin-system/useAdminDetail'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'
import { useAccountLifecycleActions } from '@/composables/admin-system/useAccountLifecycleActions'
import {
  activateUser,
  deactivateUser,
  deleteUser,
  getUser,
  restoreUser,
} from '@/services/admin-system/users'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminDetailPage from '@/components/ui/admin/AdminDetailPage.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import AdminAccountLifecycleDialog from '@/components/ui/admin/AdminAccountLifecycleDialog.vue'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import UserDetailSections from '@/components/admin-system/users/UserDetailSections.vue'
import UserInvitationPanel from '@/components/admin-system/users/UserInvitationPanel.vue'
import AccountLockPanel from '@/components/admin-system/users/AccountLockPanel.vue'
import AccountLifecycleActions from '@/components/admin-system/users/AccountLifecycleActions.vue'
import { resolveUserLookupMode, userLookupRouteQuery } from '@/contracts/admin-system/user-lookup'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const sessionStore = useAuthSessionStore()
const { activeSchool, currentUser, roles, scopedPermissions } = storeToRefs(sessionStore)
const userId = computed(() => String(route.params.userId ?? ''))
const lookupMode = computed(() =>
  resolveUserLookupMode({
    requestedMode: route.query.user_mode ?? null,
    activeSchool: activeSchool.value,
    permissions: scopedPermissions.value,
    roles: roles.value,
  }),
)
const tenantId = computed(() => lookupMode.value?.schoolId ?? null)

watch(
  () => lookupMode.value?.scope,
  (scope) => {
    if (scope && route.query.user_mode !== scope) {
      void router.replace({ query: userLookupRouteQuery(lookupMode.value, route.query) })
    }
  },
  { immediate: true },
)
const detail = useAdminDetail({
  id: userId,
  schoolId: tenantId,
  schoolRequired: false,
  enabled: computed(() => Boolean(lookupMode.value)),
  loader: getUser,
  operationId: 'getUser',
  routeName: route.name,
})
const canEdit = computed(
  () =>
    lookupMode.value?.scope === 'school' &&
    ['users.view', 'users.manage', 'roles.view'].every(sessionStore.hasPermission),
)
const returnTo = computed(() => createReturnToListLocation(route, 'usersList'))
const editTo = computed(() => ({ name: 'userEdit', params: route.params, query: route.query }))
const actions = computed(() =>
  deriveLifecycleActions({
    resource: 'users',
    status: detail.record.value?.status,
    permissions: sessionStore.permissionCodes,
    schoolReady: Boolean(tenantId.value),
  }),
)
const lifecycle = useAdminLifecycleAction({
  routeName: route.name,
  submitter: ({ target, action, values }) =>
    ({
      activate: activateUser,
      deactivate: deactivateUser,
      delete: deleteUser,
      restore: restoreUser,
    })[action](target.id, values, { schoolId: tenantId.value }),
  onSuccess: async () => {
    ElMessage.success(t('administration.common.updateSuccess'))
    await detail.load()
  },
})
const accountLifecycle = useAccountLifecycleActions({
  target: detail.record,
  targetId: userId,
  schoolId: tenantId,
  actorId: computed(() => currentUser.value?.id ?? null),
  permissions: scopedPermissions,
  roles,
  routeIdentity: computed(() => route.fullPath),
  refreshTarget: detail.load,
})
async function submitLifecycle() {
  try {
    await lifecycle.submit()
  } catch {
    /* composable owns feedback */
  }
}
async function submitAccountLifecycle() {
  try {
    await accountLifecycle.submit()
  } catch {
    /* composable owns feedback */
  }
}
async function requestPasswordDelivery() {
  try {
    await accountLifecycle.requestPasswordDelivery()
  } catch {
    /* composable owns safe feedback */
  }
}

watch(
  [userId, () => lookupMode.value?.scope, tenantId],
  () => (lookupMode.value ? detail.load() : detail.reset()),
  { immediate: true },
)
</script>

<template>
  <AdminDetailPage
    :title="detail.record.value?.fullName ?? t('administration.users.detailTitle')"
    :status="detail.status.value"
    :feedback="detail.error.value"
    :record-status="detail.record.value?.status"
    :return-to="returnTo"
    :can-edit="canEdit"
    :edit-to="editTo"
    @retry="detail.retry()"
  >
    <template #actions>
      <AdminRowActions :actions="actions" @action="lifecycle.launch(detail.record.value, $event)" />
    </template>
    <template v-if="detail.record.value">
      <UserDetailSections :record="detail.record.value" />
      <UserInvitationPanel
        v-if="!accountLifecycle.eligibility.value.blocked"
        :user="detail.record.value"
        :school-id="tenantId"
        :actor-id="currentUser?.id"
        :permissions="scopedPermissions"
        :roles="roles"
      />
      <AccountLockPanel
        :lock="accountLifecycle.lock.value"
        :loading="accountLifecycle.loading.value"
        :hidden="accountLifecycle.eligibility.value.blocked"
        :error="accountLifecycle.error.value"
      />
      <AccountLifecycleActions
        v-if="!accountLifecycle.eligibility.value.blocked"
        :eligibility="accountLifecycle.eligibility.value"
        :pending="accountLifecycle.pending.value"
        :delivery="accountLifecycle.delivery.value"
        :delivery-pending="accountLifecycle.deliveryPending.value"
        :delivery-error="accountLifecycle.deliveryError.value"
        @action="accountLifecycle.launch"
        @refresh="accountLifecycle.loadLock"
        @password-delivery="requestPasswordDelivery"
      />
    </template>
  </AdminDetailPage>
  <AdminLifecycleDialog
    v-if="lifecycle.target.value"
    v-model:open="lifecycle.open.value"
    v-model:values="lifecycle.form"
    :action="lifecycle.action.value"
    :resource-label="lifecycle.target.value?.fullName ?? ''"
    resource-type="users"
    :current-status="lifecycle.target.value?.status ?? ''"
    :pending="lifecycle.pending.value"
    :field-errors="lifecycle.fieldErrors.value"
    :form-error="lifecycle.formError.value"
    @submit="submitLifecycle"
    @cancel="lifecycle.close"
  />
  <AdminAccountLifecycleDialog
    v-model:open="accountLifecycle.open.value"
    v-model:reason="accountLifecycle.reason.value"
    :action="accountLifecycle.action.value"
    :pending="accountLifecycle.pending.value"
    :field-errors="accountLifecycle.fieldErrors.value"
    @submit="submitAccountLifecycle"
    @cancel="accountLifecycle.close"
  />
</template>
