<script setup>
import { useI18n } from 'vue-i18n'
import { listSchools } from '@/services/admin-system/schools'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import SchoolFilters from '@/components/admin-system/schools/SchoolFilters.vue'
import SchoolTable from '@/components/admin-system/schools/SchoolTable.vue'

const { t } = useI18n()
const list = useAdministrationResourceList({
  resource: 'schools',
  loader: listSchools,
  operationId: 'listSchools',
  tenantOwned: false,
})
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
    <SchoolTable :rows="list.items.value" />
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
</template>
