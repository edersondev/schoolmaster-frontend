<script setup>
import { useI18n } from 'vue-i18n'
import { mapUserTableSort } from '@/contracts/admin-system/users'
import { listUsers } from '@/services/admin-system/users'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import UserFilters from '@/components/admin-system/users/UserFilters.vue'
import UserTable from '@/components/admin-system/users/UserTable.vue'
const { t } = useI18n()
const list = useAdministrationResourceList({
  resource: 'users',
  loader: listUsers,
  operationId: 'listUsers',
  tenantOwned: true,
})
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
      @sort="list.updateQuery({ sort: mapUserTableSort($event) })"
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
</template>
