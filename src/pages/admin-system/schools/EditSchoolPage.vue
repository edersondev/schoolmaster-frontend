<script setup>
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  createSchoolForm,
  mapSchoolForm,
  validateSchoolForm,
} from '@/contracts/admin-system/schools'
import { useAdminDetail } from '@/composables/admin-system/useAdminDetail'
import { useAdminUpdateForm } from '@/composables/admin-system/useAdminUpdateForm'
import { useUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'
import { getSchool, updateSchool } from '@/services/admin-system/schools'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminFeedbackState from '@/components/ui/admin/AdminFeedbackState.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import SchoolEditFields from '@/components/admin-system/schools/SchoolEditFields.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const schoolId = computed(() => String(route.params.schoolId ?? ''))
const detail = useAdminDetail({
  id: schoolId,
  loader: getSchool,
  operationId: 'getSchool',
  routeName: route.name,
})
const form = useAdminUpdateForm({
  initialValues: createSchoolForm(),
  operationId: 'updateSchool',
  routeName: route.name,
  validate: validateSchoolForm,
  submitter: (values) => updateSchool(schoolId.value, values),
  mapResult: mapSchoolForm,
})

useUnsavedChangesGuard({ isDirty: form.isDirty, submitted: form.submitted })

function destination() {
  return createReturnToListLocation(route, 'schoolsList')
}

async function loadSchool() {
  const school = await detail.load()
  if (school) {
    form.reset(mapSchoolForm(school))
  }
}

async function submit() {
  try {
    await form.submit()
    ElMessage.success(t('administration.common.updateSuccess'))
    await router.push(destination())
  } catch {
    // Edit form owns normalized feedback.
  }
}

function cancel() {
  router.push(destination())
}

watch(schoolId, loadSchool, { immediate: true })
</script>

<template>
  <section v-if="detail.status.value !== 'ready'" class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="font-display text-2xl font-semibold text-sm-text">
      {{ t('administration.schools.editTitle') }}
    </h1>
    <AdminFeedbackState :state="detail.status.value" :feedback="detail.error.value" @retry="loadSchool" />
    <div class="flex justify-end">
      <ElButton @click="cancel">{{ t('administration.common.cancel') }}</ElButton>
    </div>
  </section>

  <AdminFormPage
    v-else
    :title="t('administration.schools.editTitle')"
    :pending="form.pending.value"
    :field-errors="form.fieldErrors.value"
    :form-error="form.formError.value"
    :submit-label="t('administration.common.update')"
    @submit="submit"
    @cancel="cancel"
  >
    <SchoolEditFields
      v-model="form.values"
      :errors="form.fieldErrors.value"
    />
  </AdminFormPage>
</template>
