<script setup>
import { useI18n } from 'vue-i18n'
import { listGuardians } from '@/services/admin-system/guardians'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import GuardianFilters from '@/components/admin-system/guardians/GuardianFilters.vue'
import GuardianTable from '@/components/admin-system/guardians/GuardianTable.vue'
const { t } = useI18n()
const list = useAdministrationResourceList({
  resource: 'guardians',
  loader: listGuardians,
  operationId: 'listGuardians',
  tenantOwned: true,
})
</script>
<template>
  <AdminListPage
    :title="t('administration.guardians.title')"
    :state="list.status.value"
    :feedback="list.error.value"
    :can-create="list.can(['guardians.view', 'guardians.manage'])"
    :create-to="{ name: 'guardianCreate', query: $route.query }"
    @retry="list.retry()"
    @reset="list.resetFilters"
  >
    <template #filters
      ><GuardianFilters
        :status="list.query.value.status"
        @update:status="list.updateQuery({ status: $event })"
        @reset="list.resetFilters"
    /></template>
    <GuardianTable :rows="list.items.value" />
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
