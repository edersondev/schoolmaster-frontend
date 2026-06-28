<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createAcademicPeriodForm,
  validateAcademicPeriodForm,
} from '@/contracts/admin-system/academics'
import { createAcademicPeriod } from '@/services/admin-system/academic-periods'
import { listAcademicYears } from '@/services/admin-system/academic-years'
import { useAdministrationCreatePage } from '@/composables/admin-system/useAdministrationCreatePage'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import AcademicPeriodForm from '@/components/admin-system/academic-periods/AcademicPeriodForm.vue'
const { t } = useI18n()
const page = useAdministrationCreatePage({
  initialValues: createAcademicPeriodForm(),
  validate: validateAcademicPeriodForm,
  submitter: createAcademicPeriod,
  operationId: 'createAcademicPeriod',
  listRouteName: 'academicPeriodsList',
  tenantOwned: true,
})
const selectedYearIds = computed(() =>
  page.form.values.academicYearId ? [page.form.values.academicYearId] : [],
)
const yearLookup = useAdminLookup({
  loader: listAcademicYears,
  tenantId: page.tenantId,
  selectedIds: selectedYearIds,
  operationId: 'listAcademicYears',
  status: 'active',
})
onMounted(() => yearLookup.load(1))
</script>
<template>
  <AdminFormPage
    :title="t('administration.academicPeriods.createTitle')"
    :pending="page.form.pending.value"
    :field-errors="page.form.fieldErrors.value"
    :form-error="page.form.formError.value"
    @submit="page.submit"
    @cancel="page.cancel"
  >
    <AcademicPeriodForm
      v-model="page.form.values"
      :errors="page.form.fieldErrors.value"
      :years="yearLookup.options.value"
      :years-loading="yearLookup.status.value === 'loading'"
      :lookup-meta="yearLookup.meta.value"
      @lookup-page="yearLookup.setPage"
    />
  </AdminFormPage>
</template>
