<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { listAcademicPeriods } from '@/services/admin-system/academic-periods'
import { listAcademicYears } from '@/services/admin-system/academic-years'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import AcademicPeriodFilters from '@/components/admin-system/academic-periods/AcademicPeriodFilters.vue'
import AcademicPeriodTable from '@/components/admin-system/academic-periods/AcademicPeriodTable.vue'
const { t } = useI18n()
const { activeSchool } = storeToRefs(useAuthSessionStore())
const tenantId = computed(() => activeSchool.value?.id ?? null)
const list = useAdministrationResourceList({
  resource: 'academic-periods',
  loader: listAcademicPeriods,
  operationId: 'listAcademicPeriods',
  tenantOwned: true,
  tenantResetQuery: { academicYearId: '' },
})
const selectedYearIds = computed(() =>
  list.query.value.academicYearId ? [list.query.value.academicYearId] : [],
)
const yearLookup = useAdminLookup({
  loader: listAcademicYears,
  tenantId,
  selectedIds: selectedYearIds,
  operationId: 'listAcademicYears',
})
onMounted(() => yearLookup.load(1))
</script>
<template>
  <AdminListPage
    :title="t('administration.academicPeriods.title')"
    :state="list.status.value"
    :feedback="list.error.value"
    :can-create="
      list.can(['academic_periods.view', 'academic_periods.manage', 'academic_years.view'])
    "
    :create-to="{ name: 'academicPeriodCreate', query: $route.query }"
    @retry="list.retry()"
    @reset="list.resetFilters"
  >
    <template #filters
      ><AcademicPeriodFilters
        :status="list.query.value.status"
        :academic-year-id="list.query.value.academicYearId"
        :years="yearLookup.options.value"
        :years-loading="yearLookup.status.value === 'loading'"
        :lookup-meta="yearLookup.meta.value"
        @update:status="list.updateQuery({ status: $event })"
        @update:academic-year-id="list.updateQuery({ academicYearId: $event })"
        @lookup-page="yearLookup.setPage"
        @reset="list.resetFilters"
    /></template>
    <AcademicPeriodTable :rows="list.items.value" />
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
