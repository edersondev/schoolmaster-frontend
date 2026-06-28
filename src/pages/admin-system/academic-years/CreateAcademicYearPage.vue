<script setup>
import { useI18n } from 'vue-i18n'
import { createAcademicYearForm, validateAcademicYearForm } from '@/contracts/admin-system/academics'
import { createAcademicYear } from '@/services/admin-system/academic-years'
import { useAdministrationCreatePage } from '@/composables/admin-system/useAdministrationCreatePage'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import AcademicYearForm from '@/components/admin-system/academic-years/AcademicYearForm.vue'
const { t } = useI18n()
const page = useAdministrationCreatePage({
  initialValues: createAcademicYearForm(),
  validate: validateAcademicYearForm,
  submitter: createAcademicYear,
  operationId: 'createAcademicYear',
  listRouteName: 'academicYearsList',
  tenantOwned: true,
})
</script>
<template>
  <AdminFormPage
    :title="t('administration.academicYears.createTitle')"
    :pending="page.form.pending.value"
    :field-errors="page.form.fieldErrors.value"
    :form-error="page.form.formError.value"
    @submit="page.submit"
    @cancel="page.cancel"
  >
    <AcademicYearForm v-model="page.form.values" :errors="page.form.fieldErrors.value" />
  </AdminFormPage>
</template>
