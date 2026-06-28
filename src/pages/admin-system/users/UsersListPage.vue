<script setup>
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { mapUserTableSort } from '@/contracts/admin-system/users'
import {
  deriveBulkLifecycleActions,
  deriveLifecycleActions,
} from '@/composables/admin-system/useAdminActionEligibility'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'
import { useAdminBulkLifecycle } from '@/composables/admin-system/useAdminBulkLifecycle'
import {
  activateUser,
  deactivateUser,
  deleteUser,
  bulkLifecycleUsers,
  listUsers,
  restoreUser,
} from '@/services/admin-system/users'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import AdminBulkActionBar from '@/components/ui/admin/AdminBulkActionBar.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import UserFilters from '@/components/admin-system/users/UserFilters.vue'
import UserTable from '@/components/admin-system/users/UserTable.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const sessionStore = useAuthSessionStore()
const { activeSchool } = storeToRefs(sessionStore)
const tenantId = computed(() => activeSchool.value?.id ?? null)
const list = useAdministrationResourceList({
  resource: 'users',
  loader: listUsers,
  operationId: 'listUsers',
  tenantOwned: true,
})
const canManage = computed(() => list.can(['users.view', 'users.manage', 'roles.view']))
const lifecycle = useAdminLifecycleAction({
  routeName: route.name,
  submitter: ({ target, action, values }) => {
    const services = { activate: activateUser, deactivate: deactivateUser, delete: deleteUser, restore: restoreUser }
    return services[action](target.id, values, { schoolId: tenantId.value })
  },
  onSuccess: async () => {
    ElMessage.success(t('administration.common.updateSuccess'))
    await list.load(list.query.value)
  },
})
const bulk = useAdminBulkLifecycle({
  operationId: 'bulkLifecycleUsers',
  routeName: route.name,
  submitter: (input) => bulkLifecycleUsers(input, { schoolId: tenantId.value }),
  onSuccess: async () => {
    ElMessage.success(t('administration.common.updateSuccess'))
    await list.load(list.query.value)
  },
})
const bulkActions = computed(() =>
  deriveBulkLifecycleActions({
    resource: 'users',
    selectedSummaries: bulk.selectedSummaries.value,
    permissions: sessionStore.permissionCodes,
    schoolReady: Boolean(tenantId.value),
  }),
)

watch(
  [
    tenantId,
    () => sessionStore.permissionCodes.join('|'),
    () => list.query.value.page,
    () => list.query.value.perPage,
    () => list.query.value.status,
    () => list.query.value.sort,
    () => list.query.value.search,
  ],
  () => bulk.clearSelection(),
)

function onView(row) {
  router.push({ name: 'userDetail', params: { userId: row.id }, query: route.query })
}

function onEdit(row) {
  router.push({
    name: 'userEdit',
    params: { userId: row.id },
    query: route.query,
  })
}

function lifecycleActions(row) {
  return deriveLifecycleActions({
    resource: 'users',
    status: row.status,
    permissions: sessionStore.permissionCodes,
    schoolReady: Boolean(tenantId.value),
  })
}

function onLifecycle({ row, action }) {
  lifecycle.launch(row, action)
}

function onToggleSelection({ row, checked }) {
  bulk.toggle(row, checked)
}

async function submitLifecycle() {
  try {
    await lifecycle.submit()
  } catch {}
}

async function submitBulkLifecycle() {
  try {
    await bulk.submit(bulk.action.value)
  } catch {}
}
</script>
<template>
  <AdminListPage
    :title="t('administration.users.title')"
    :state="list.status.value"
    :feedback="list.error.value"
    :can-create="list.can(['users.view', 'users.manage', 'roles.view'])"
    :create-to="{ name: 'userCreate', query: $route.query }"
    @retry="list.retry()"
    @reset="list.resetFilters"
  >
    <template #filters
      ><UserFilters
        :status="list.query.value.status"
        :sort="list.query.value.sort"
        @update:status="list.updateQuery({ status: $event })"
        @update:sort="list.updateQuery({ sort: $event })"
        @reset="list.resetFilters"
    /></template>
    <AdminBulkActionBar
      :selected-count="bulk.selectedCount.value"
      :actions="bulkActions"
      :over-limit="bulk.overLimit.value"
      :pending="bulk.pending.value"
      @action="(action) => { bulk.action.value = action }"
      @clear="bulk.clearSelection"
    />
    <UserTable
      :rows="list.items.value"
      :can-manage="canManage"
      :action-resolver="lifecycleActions"
      :selected-ids="bulk.selectedIds.value"
      bulk-enabled
      @sort="list.updateQuery({ sort: mapUserTableSort($event) })"
      @view="onView"
      @edit="onEdit"
      @lifecycle="onLifecycle"
      @toggle-selection="onToggleSelection"
    />
    <template #pagination
      ><AdminPagination
        :page="list.meta.value.page"
        :per-page="list.meta.value.perPage"
        :total="list.meta.value.total"
        @update:page="list.updateQuery({ page: $event })"
        @update:per-page="list.updateQuery({ perPage: $event })"
    /></template>
  </AdminListPage>
  <AdminLifecycleDialog
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
  <AdminLifecycleDialog
    v-if="bulk.selectedCount.value > 0 && bulk.action.value"
    :open="Boolean(bulk.action.value)"
    @update:open="(open) => { if (!open) bulk.action.value = null }"
    v-model:values="bulk.form"
    :action="bulk.action.value"
    resource-type="users"
    bulk
    :selected-count="bulk.selectedCount.value"
    :pending="bulk.pending.value"
    :field-errors="bulk.fieldErrors.value"
    :form-error="bulk.formError.value"
    @submit="submitBulkLifecycle"
    @cancel="() => { bulk.action.value = null }"
  />
</template>
