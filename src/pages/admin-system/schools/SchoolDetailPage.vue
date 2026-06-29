<script setup>
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { deriveLifecycleActions } from '@/composables/admin-system/useAdminActionEligibility'
import { useAdminDetail } from '@/composables/admin-system/useAdminDetail'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'
import { activateSchool, deactivateSchool, deleteSchool, getSchool, restoreSchool } from '@/services/admin-system/schools'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminDetailPage from '@/components/ui/admin/AdminDetailPage.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import SchoolDetailSections from '@/components/admin-system/schools/SchoolDetailSections.vue'

const route = useRoute()
const { t } = useI18n()
const sessionStore = useAuthSessionStore()
const schoolId = computed(() => String(route.params.schoolId ?? ''))
const detail = useAdminDetail({
  id: schoolId,
  loader: getSchool,
  operationId: 'getSchool',
  routeName: route.name,
})
const canEdit = computed(() => ['schools.view', 'schools.manage'].every(sessionStore.hasPermission))
const returnTo = computed(() => createReturnToListLocation(route, 'schoolsList'))
const editTo = computed(() => ({ name: 'schoolEdit', params: route.params, query: route.query }))
const actions = computed(() => deriveLifecycleActions({ resource: 'schools', status: detail.record.value?.status, permissions: sessionStore.permissionCodes }))
const lifecycle = useAdminLifecycleAction({
  routeName: route.name,
  submitter: ({ target, action, values }) => ({ activate: activateSchool, deactivate: deactivateSchool, delete: deleteSchool, restore: restoreSchool })[action](target.id, values),
  onSuccess: async () => {
    ElMessage.success(t('administration.common.updateSuccess'))
    await detail.load()
  },
})
async function submitLifecycle() { try { await lifecycle.submit() } catch {} }

watch(schoolId, () => detail.load(), { immediate: true })
</script>

<template>
  <AdminDetailPage
    :title="detail.record.value?.name ?? t('administration.schools.detailTitle')"
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
    <SchoolDetailSections v-if="detail.record.value" :record="detail.record.value" />
  </AdminDetailPage>
  <AdminLifecycleDialog v-if="lifecycle.target.value" v-model:open="lifecycle.open.value" v-model:values="lifecycle.form" :action="lifecycle.action.value" :resource-label="lifecycle.target.value?.name ?? ''" resource-type="schools" :current-status="lifecycle.target.value?.status ?? ''" :pending="lifecycle.pending.value" :field-errors="lifecycle.fieldErrors.value" :form-error="lifecycle.formError.value" @submit="submitLifecycle" @cancel="lifecycle.close" />
</template>
