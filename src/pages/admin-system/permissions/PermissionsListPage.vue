<script setup>
import { useI18n } from 'vue-i18n'
import { listPermissions } from '@/services/admin-system/permissions'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import PermissionTable from '@/components/admin-system/permissions/PermissionTable.vue'
const { t } = useI18n()
const list = useAdministrationResourceList({
  resource: 'permissions',
  loader: listPermissions,
  operationId: 'listPermissions',
  tenantOwned: true,
})
</script>
<template>
  <AdminListPage
    :title="t('administration.permissions.title')"
    :state="list.status.value"
    :feedback="list.error.value"
    @retry="list.retry()"
  >
    <PermissionTable :rows="list.items.value" />
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
