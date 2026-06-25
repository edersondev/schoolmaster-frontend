<script setup>
import { useI18n } from 'vue-i18n'
import { createSchoolForm } from '@/contracts/admin-system/schools'
import { createSchool } from '@/services/admin-system/schools'
import { useAdministrationCreatePage } from '@/composables/admin-system/useAdministrationCreatePage'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import SchoolForm from '@/components/admin-system/schools/SchoolForm.vue'

const { t } = useI18n()
const page = useAdministrationCreatePage({
  initialValues: createSchoolForm(),
  submitter: createSchool,
  operationId: 'createSchool',
  listRouteName: 'schoolsList',
  tenantOwned: false,
})
</script>
<template>
  <AdminFormPage
    :title="t('administration.schools.createTitle')"
    :pending="page.form.pending.value"
    :field-errors="page.form.fieldErrors.value"
    :form-error="page.form.formError.value"
    @submit="page.submit"
    @cancel="page.cancel"
  >
    <SchoolForm v-model="page.form.values" :errors="page.form.fieldErrors.value" />
  </AdminFormPage>
</template>
