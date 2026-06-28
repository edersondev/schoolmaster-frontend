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
import { activateRole, deactivateRole, deleteRole, getRole, restoreRole } from '@/services/admin-system/roles'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminDetailPage from '@/components/ui/admin/AdminDetailPage.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import RoleDetailSections from '@/components/admin-system/roles/RoleDetailSections.vue'

const route = useRoute()
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
const canEdit = computed(() =>
  ['roles.view', 'roles.manage', 'permissions.view'].every(sessionStore.hasPermission),
)
const returnTo = computed(() => createReturnToListLocation(route, 'rolesList'))
const editTo = computed(() => ({ name: 'roleEdit', params: route.params, query: route.query }))
const actions = computed(() => deriveLifecycleActions({ resource: 'roles', status: detail.record.value?.status, permissions: sessionStore.permissionCodes, schoolReady: Boolean(tenantId.value) }))
const lifecycle = useAdminLifecycleAction({
  routeName: route.name,
  submitter: ({ target, action, values }) => ({ activate: activateRole, deactivate: deactivateRole, delete: deleteRole, restore: restoreRole })[action](target.id, values, { schoolId: tenantId.value }),
  onSuccess: async () => { ElMessage.success(t('administration.common.updateSuccess')); await detail.load() },
})
async function submitLifecycle() { try { await lifecycle.submit() } catch {} }

watch([roleId, tenantId], () => detail.load(), { immediate: true })
</script>

<template>
  <AdminDetailPage
    :title="detail.record.value?.name ?? t('administration.roles.detailTitle')"
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
    <RoleDetailSections v-if="detail.record.value" :record="detail.record.value" />
  </AdminDetailPage>
  <AdminLifecycleDialog v-if="lifecycle.target.value" v-model:open="lifecycle.open.value" v-model:values="lifecycle.form" :action="lifecycle.action.value" :resource-label="lifecycle.target.value?.name ?? ''" resource-type="roles" :current-status="lifecycle.target.value?.status ?? ''" :pending="lifecycle.pending.value" :field-errors="lifecycle.fieldErrors.value" :form-error="lifecycle.formError.value" @submit="submitLifecycle" @cancel="lifecycle.close" />
</template>
