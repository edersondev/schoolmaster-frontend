<script setup>
import { useI18n } from 'vue-i18n'
import { listAcademicYears } from '@/services/admin-system/academic-years'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import AcademicYearFilters from '@/components/admin-system/academic-years/AcademicYearFilters.vue'
import AcademicYearTable from '@/components/admin-system/academic-years/AcademicYearTable.vue'
const { t } = useI18n()
const list = useAdministrationResourceList({
  resource: 'academic-years',
  loader: listAcademicYears,
  operationId: 'listAcademicYears',
  tenantOwned: true,
})
</script>
<template>
  <AdminListPage
    :title="t('administration.academicYears.title')"
    :state="list.status.value"
    :feedback="list.error.value"
    :can-create="list.can(['academic_years.view', 'academic_years.manage'])"
    :create-to="{ name: 'academicYearCreate', query: $route.query }"
    @retry="list.retry()"
    @reset="list.resetFilters"
  >
    <template #filters
      ><AcademicYearFilters
        :status="list.query.value.status"
        @update:status="list.updateQuery({ status: $event })"
        @reset="list.resetFilters"
    /></template>
    <AcademicYearTable :rows="list.items.value" />
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
