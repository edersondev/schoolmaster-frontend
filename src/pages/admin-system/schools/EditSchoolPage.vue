<script setup>
import { computed, shallowRef, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  createSchoolForm,
  mapSchoolForm,
  validateSchoolForm,
} from '@/contracts/admin-system/schools'
import { useAdminCreateForm } from '@/composables/admin-system/useAdminCreateForm'
import { useUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'
import { getSchool, updateSchool } from '@/services/admin-system/schools'
import AdminFeedbackState from '@/components/ui/admin/AdminFeedbackState.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import SchoolForm from '@/components/admin-system/schools/SchoolForm.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loadState = shallowRef('loading')
const loadError = shallowRef(null)
const schoolId = computed(() => String(route.params.schoolId ?? ''))
const form = useAdminCreateForm({
  initialValues: createSchoolForm(),
  operationId: 'updateSchool',
  routeName: route.name,
  validate: validateSchoolForm,
  submitter: (values) => updateSchool(schoolId.value, values),
})

useUnsavedChangesGuard({ isDirty: form.isDirty, submitted: form.submitted })

function destination() {
  return { name: 'schoolsList', query: route.query }
}

async function loadSchool() {
  loadState.value = 'loading'
  loadError.value = null

  try {
    const school = await getSchool(schoolId.value)
    form.reset(mapSchoolForm(school))
    loadState.value = 'ready'
  } catch (error) {
    loadError.value = normalizeAdministrationError(error, {
      operationId: 'getSchool',
      routeName: route.name,
    })
    loadState.value = loadError.value.type
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
  <section v-if="loadState !== 'ready'" class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="font-display text-2xl font-semibold text-sm-text">
      {{ t('administration.schools.editTitle') }}
    </h1>
    <AdminFeedbackState :state="loadState" :feedback="loadError" @retry="loadSchool" />
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
    <SchoolForm
      v-model="form.values"
      :errors="form.fieldErrors.value"
      allow-remove-address
      readonly-code
      show-status
    />
  </AdminFormPage>
</template>
