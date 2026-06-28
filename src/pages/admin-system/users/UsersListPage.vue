<script setup>
import { computed, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  createUserDeleteForm,
  mapUserTableSort,
  validateUserDeleteForm,
} from '@/contracts/admin-system/users'
import { deleteUser, listUsers } from '@/services/admin-system/users'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useAdminCreateForm } from '@/composables/admin-system/useAdminCreateForm'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import UserDeleteDialog from '@/components/admin-system/users/UserDeleteDialog.vue'
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
const deleteDialogOpen = shallowRef(false)
const selectedUser = shallowRef(null)
const deleteForm = useAdminCreateForm({
  initialValues: createUserDeleteForm(),
  operationId: 'deleteUser',
  routeName: route.name,
  validate: validateUserDeleteForm,
  submitter: (values) => deleteUser(selectedUser.value.id, values, { schoolId: tenantId.value }),
})

function onEdit(row) {
  router.push({
    name: 'userEdit',
    params: { userId: row.id },
    query: route.query,
  })
}

function onOpenDelete(row) {
  selectedUser.value = row
  deleteForm.reset(createUserDeleteForm())
  deleteDialogOpen.value = true
}

function closeDeleteDialog() {
  deleteDialogOpen.value = false
  selectedUser.value = null
  deleteForm.reset(createUserDeleteForm())
}

async function submitDelete() {
  try {
    await deleteForm.submit()
    ElMessage.success(t('administration.common.deleteSuccess'))
    closeDeleteDialog()
    await list.load(list.query.value)
  } catch {
    // Delete form owns normalized feedback.
  }
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
    <UserTable
      :rows="list.items.value"
      :can-manage="canManage"
      @sort="list.updateQuery({ sort: mapUserTableSort($event) })"
      @edit="onEdit"
      @delete="onOpenDelete"
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
  <UserDeleteDialog
    v-model:open="deleteDialogOpen"
    v-model:values="deleteForm.values"
    :user-name="selectedUser?.fullName ?? ''"
    :pending="deleteForm.pending.value"
    :field-errors="deleteForm.fieldErrors.value"
    :form-error="deleteForm.formError.value"
    @submit="submitDelete"
    @cancel="closeDeleteDialog"
  />
</template>
