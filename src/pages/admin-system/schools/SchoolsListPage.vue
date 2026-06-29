<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { deriveLifecycleActions } from '@/composables/admin-system/useAdminActionEligibility'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  activateSchool,
  deactivateSchool,
  deleteSchool,
  listSchools,
  restoreSchool,
} from '@/services/admin-system/schools'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import SchoolFilters from '@/components/admin-system/schools/SchoolFilters.vue'
import SchoolTable from '@/components/admin-system/schools/SchoolTable.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const sessionStore = useAuthSessionStore()
const list = useAdministrationResourceList({
  resource: 'schools',
  loader: listSchools,
  operationId: 'listSchools',
  tenantOwned: false,
})
const canManage = computed(() => list.can(['schools.view', 'schools.manage']))
const lifecycle = useAdminLifecycleAction({
  routeName: route.name,
  submitter: ({ target, action, values }) => {
    const services = { activate: activateSchool, deactivate: deactivateSchool, delete: deleteSchool, restore: restoreSchool }
    return services[action](target.id, values)
  },
  onSuccess: async () => {
    ElMessage.success(t('administration.common.updateSuccess'))
    await list.load(list.query.value)
  },
})

function onView(row) {
  router.push({ name: 'schoolDetail', params: { schoolId: row.id }, query: route.query })
}

function onEdit(row) {
  router.push({
    name: 'schoolEdit',
    params: { schoolId: row.id },
    query: route.query,
  })
}

function lifecycleActions(row) {
  return deriveLifecycleActions({
    resource: 'schools',
    status: row.status,
    permissions: sessionStore.permissionCodes,
    schoolReady: true,
  })
}

function onLifecycle({ row, action }) {
  lifecycle.launch(row, action)
}

async function submitLifecycle() {
  try {
    await lifecycle.submit()
  } catch {}
}
</script>
<template>
  <AdminListPage
    :title="t('administration.schools.title')"
    :state="list.status.value"
    :feedback="list.error.value"
    :can-create="list.can(['schools.view', 'schools.manage'])"
    :create-to="{ name: 'schoolCreate', query: $route.query }"
    @retry="list.retry()"
    @reset="list.resetFilters"
  >
    <template #filters>
      <SchoolFilters
        :status="list.query.value.status"
        @update:status="list.updateQuery({ status: $event })"
        @reset="list.resetFilters"
      />
    </template>
    <SchoolTable
      :rows="list.items.value"
      :can-manage="canManage"
      :action-resolver="lifecycleActions"
      @view="onView"
      @edit="onEdit"
      @lifecycle="onLifecycle"
    />
    <template #pagination>
      <AdminPagination
        :page="list.meta.value.page"
        :per-page="list.meta.value.perPage"
        :total="list.meta.value.total"
        @update:page="list.updateQuery({ page: $event })"
        @update:per-page="list.updateQuery({ perPage: $event })"
      />
    </template>
  </AdminListPage>
  <AdminLifecycleDialog
    v-model:open="lifecycle.open.value"
    v-model:values="lifecycle.form"
    :action="lifecycle.action.value"
    :resource-label="lifecycle.target.value?.name ?? ''"
    resource-type="schools"
    :current-status="lifecycle.target.value?.status ?? ''"
    :pending="lifecycle.pending.value"
    :field-errors="lifecycle.fieldErrors.value"
    :form-error="lifecycle.formError.value"
    @submit="submitLifecycle"
    @cancel="lifecycle.close"
  />
</template>
