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
import { activateUser, deactivateUser, deleteUser, getUser, restoreUser } from '@/services/admin-system/users'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminDetailPage from '@/components/ui/admin/AdminDetailPage.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import UserDetailSections from '@/components/admin-system/users/UserDetailSections.vue'

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
async function submitLifecycle() { try { await lifecycle.submit() } catch {} }

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
    <UserDetailSections v-if="detail.record.value" :record="detail.record.value" />
  </AdminDetailPage>
  <AdminLifecycleDialog v-if="lifecycle.target.value" v-model:open="lifecycle.open.value" v-model:values="lifecycle.form" :action="lifecycle.action.value" :resource-label="lifecycle.target.value?.fullName ?? ''" resource-type="users" :current-status="lifecycle.target.value?.status ?? ''" :pending="lifecycle.pending.value" :field-errors="lifecycle.fieldErrors.value" :form-error="lifecycle.formError.value" @submit="submitLifecycle" @cancel="lifecycle.close" />
</template>
