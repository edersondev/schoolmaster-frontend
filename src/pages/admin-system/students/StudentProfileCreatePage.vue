<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  createStudentProfileDraft,
  validateStudentProfileDraft,
} from '@/contracts/admin-system/student-profiles'
import { useAdministrationCreatePage } from '@/composables/admin-system/useAdministrationCreatePage'
import { createStudentProfile } from '@/services/admin-system/studentProfiles'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import StudentProfileForm from '@/components/admin-system/students/StudentProfileForm.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const page = useAdministrationCreatePage({
  initialValues: createStudentProfileDraft(),
  validate: validateStudentProfileDraft,
  submitter: createStudentProfile,
  operationId: 'createStudentProfile',
  listRouteName: 'studentProfilesList',
  tenantOwned: true,
  navigateOnSuccess: false,
})

async function submit() {
  const record = await page.submit()
  if (!record?.id) return
  await router.push({
    name: 'studentProfileDetail',
    params: { studentProfileId: record.id },
    query: route.query,
  })
}
</script>

<template>
  <AdminFormPage
    :title="t('studentEnrollmentRoster.students.create')"
    :pending="page.form.pending.value"
    :field-errors="page.form.fieldErrors.value"
    :form-error="page.form.formError.value"
    @submit="submit"
    @cancel="page.cancel"
  >
    <StudentProfileForm v-model="page.form.values" :field-errors="page.form.fieldErrors.value" />
  </AdminFormPage>
</template>
