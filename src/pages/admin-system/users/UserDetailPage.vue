<script setup>
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { deriveLifecycleActions } from '@/composables/admin-system/useAdminActionEligibility'
import { useAdminDetail } from '@/composables/admin-system/useAdminDetail'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'
import { useAccountLifecycleActions } from '@/composables/admin-system/useAccountLifecycleActions'
import { activateUser, deactivateUser, deleteUser, getUser, restoreUser } from '@/services/admin-system/users'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminDetailPage from '@/components/ui/admin/AdminDetailPage.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import AdminAccountLifecycleDialog from '@/components/ui/admin/AdminAccountLifecycleDialog.vue'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import UserDetailSections from '@/components/admin-system/users/UserDetailSections.vue'
import UserInvitationPanel from '@/components/admin-system/users/UserInvitationPanel.vue'
import AccountLockPanel from '@/components/admin-system/users/AccountLockPanel.vue'
import AccountLifecycleActions from '@/components/admin-system/users/AccountLifecycleActions.vue'

const route = useRoute()
const { t } = useI18n()
const sessionStore = useAuthSessionStore()
const { activeSchool } = storeToRefs(sessionStore)
const userId = computed(() => String(route.params.userId ?? ''))
const tenantId = computed(() => activeSchool.value?.id ?? null)
const detail = useAdminDetail({
  id: userId,
  schoolId: tenantId,
  schoolRequired: true,
  loader: getUser,
  operationId: 'getUser',
  routeName: route.name,
})
const canEdit = computed(() =>
  ['users.view', 'users.manage', 'roles.view'].every(sessionStore.hasPermission),
)
const returnTo = computed(() => createReturnToListLocation(route, 'usersList'))
const editTo = computed(() => ({ name: 'userEdit', params: route.params, query: route.query }))
const actions = computed(() => deriveLifecycleActions({ resource: 'users', status: detail.record.value?.status, permissions: sessionStore.permissionCodes, schoolReady: Boolean(tenantId.value) }))
const lifecycle = useAdminLifecycleAction({
  routeName: route.name,
  submitter: ({ target, action, values }) => ({ activate: activateUser, deactivate: deactivateUser, delete: deleteUser, restore: restoreUser })[action](target.id, values, { schoolId: tenantId.value }),
  onSuccess: async () => { ElMessage.success(t('administration.common.updateSuccess')); await detail.load() },
})
const accountLifecycle = useAccountLifecycleActions({
  target: detail.record,
  schoolId: tenantId,
  permissions: computed(() => sessionStore.permissionCodes),
})
async function submitLifecycle() { try { await lifecycle.submit() } catch { /* composable owns feedback */ } }
async function submitAccountLifecycle() { try { await accountLifecycle.submit() } catch { /* composable owns feedback */ } }

watch([userId, tenantId], () => detail.load(), { immediate: true })
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
        :user="detail.record.value"
        :school-id="tenantId"
        :permissions="sessionStore.permissionCodes"
      />
      <AccountLockPanel
        :lock="accountLifecycle.lock.value"
        :loading="accountLifecycle.loading.value"
        :hidden="accountLifecycle.eligibility.value.blocked"
      />
      <AccountLifecycleActions
        :eligibility="accountLifecycle.eligibility.value"
        :pending="accountLifecycle.pending.value"
        @action="accountLifecycle.launch"
        @refresh="accountLifecycle.loadLock"
      />
    </template>
  </AdminDetailPage>
  <AdminLifecycleDialog v-if="lifecycle.target.value" v-model:open="lifecycle.open.value" v-model:values="lifecycle.form" :action="lifecycle.action.value" :resource-label="lifecycle.target.value?.fullName ?? ''" resource-type="users" :current-status="lifecycle.target.value?.status ?? ''" :pending="lifecycle.pending.value" :field-errors="lifecycle.fieldErrors.value" :form-error="lifecycle.formError.value" @submit="submitLifecycle" @cancel="lifecycle.close" />
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
