<script setup>
import { useI18n } from 'vue-i18n'
import { listRoles } from '@/services/admin-system/roles'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import RoleFilters from '@/components/admin-system/roles/RoleFilters.vue'
import RoleTable from '@/components/admin-system/roles/RoleTable.vue'
const { t } = useI18n()
const list = useAdministrationResourceList({
  resource: 'roles',
  loader: listRoles,
  operationId: 'listRoles',
  tenantOwned: true,
})
</script>
<template>
  <AdminListPage
    :title="t('administration.roles.title')"
    :state="list.status.value"
    :feedback="list.error.value"
    :can-create="list.can(['roles.view', 'roles.manage', 'permissions.view'])"
    :create-to="{ name: 'roleCreate', query: $route.query }"
    @retry="list.retry()"
    @reset="list.resetFilters"
  >
    <template #filters
      ><RoleFilters
        :status="list.query.value.status"
        @update:status="list.updateQuery({ status: $event })"
        @reset="list.resetFilters"
    /></template>
    <RoleTable :rows="list.items.value" />
    <template #pagination
      ><AdminPagination
        :page="list.meta.value.page"
        :per-page="list.meta.value.perPage"
        :total="list.meta.value.total"
        @update:page="list.updateQuery({ page: $event })"
        @update:per-page="list.updateQuery({ perPage: $event })"
    /></template>
  </AdminListPage>
</template>
