<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { createGuardianForm, validateGuardianForm } from '@/contracts/admin-system/guardians'
import { createGuardian } from '@/services/admin-system/guardians'
import { useAdministrationCreatePage } from '@/composables/admin-system/useAdministrationCreatePage'
import { useStudentProfileLookup } from '@/composables/admin-system/useStudentProfileLookup'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import GuardianForm from '@/components/admin-system/guardians/GuardianForm.vue'
const { t } = useI18n()
const session = useAuthSessionStore()
const page = useAdministrationCreatePage({
  initialValues: createGuardianForm(),
  validate: validateGuardianForm,
  submitter: createGuardian,
  operationId: 'createGuardian',
  listRouteName: 'guardiansList',
  tenantOwned: true,
})
const selectedIds = computed(() => page.form.values.studentProfileIds)
const lookup = useStudentProfileLookup({ tenantId: page.tenantId, selectedIds })
const canLookupStudents = computed(() => session.hasPermission('student_profiles.view'))
</script>
<template>
  <AdminFormPage
    :title="t('administration.guardians.createTitle')"
    :pending="page.form.pending.value"
    :field-errors="page.form.fieldErrors.value"
    :form-error="page.form.formError.value"
    @submit="page.submit"
    @cancel="page.cancel"
  >
    <GuardianForm
      v-model="page.form.values"
      :errors="page.form.fieldErrors.value"
      :student-options="lookup.options.value"
      :lookup-loading="lookup.loading.value"
      :can-lookup-students="canLookupStudents"
      @search-students="lookup.search"
    />
  </AdminFormPage>
</template>
