<script setup>
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'
import { useUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import { activateSchool, deactivateSchool } from '@/services/admin-system/schools'
import AdminFeedbackState from '@/components/ui/admin/AdminFeedbackState.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import SchoolProfileForm from '../components/SchoolProfileForm.vue'
import { useSchoolForm } from '../composables/useSchoolForm'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const schoolId = computed(() => String(route.params.schoolId ?? ''))
const form = useSchoolForm({ mode: 'edit' })
const lifecycle = useAdminLifecycleAction({
  routeName: route.name,
  submitter: ({ target, action, values }) => {
    const services = {
      activate: activateSchool,
      deactivate: deactivateSchool,
    }
    return services[action](target.id, values)
  },
  onSuccess: async () => {
    ElMessage.success(t('administration.common.updateSuccess'))
    await load()
  },
})
const blockingState = computed(() =>
  [
    'loading',
    'forbidden',
    'not-found',
    'tenant-mismatch',
    'inactive-context',
    'unauthorized',
    'unavailable',
    'unknown',
  ].includes(form.status.value)
    ? form.status.value
    : null,
)

useUnsavedChangesGuard({ isDirty: form.isDirty, submitted: form.submitted })

function destination() {
  return createReturnToListLocation(route, 'schoolsList')
}

async function load() {
  await Promise.all([form.loadLookups(), form.loadSchool(schoolId.value)])
}

async function submit() {
  try {
    await form.submit(schoolId.value)
    ElMessage.success(t('administration.common.updateSuccess'))
    await router.push(destination())
  } catch {
    // Form owns feedback.
  }
}

function changeStatus(nextStatus) {
  const currentStatus = Number(form.values.status) === 1 ? 1 : 0
  if (nextStatus === currentStatus) return

  lifecycle.launch(
    {
      id: schoolId.value,
      name: form.values.name,
      status: currentStatus === 1 ? 'active' : 'inactive',
    },
    nextStatus === 1 ? 'activate' : 'deactivate',
  )
}

async function submitLifecycle() {
  try {
    await lifecycle.submit()
  } catch {
    // useAdminLifecycleAction owns field and form error state.
  }
}

function cancel() {
  router.push(destination())
}

watch(schoolId, load, { immediate: true })
</script>

<template>
  <section v-if="blockingState" class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="font-display text-2xl font-semibold text-sm-text">
      {{ t('administration.schools.editTitle') }}
    </h1>
    <AdminFeedbackState :state="blockingState" :feedback="form.formError.value" @retry="load" />
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
    <SchoolProfileForm
      v-model="form.values"
      :active-tab="form.activeTab.value"
      :errors="form.fieldErrors.value"
      :tab-errors="form.tabErrors.value"
      :lookups="form.lookups"
      :lookup-status="form.lookupStatus.value"
      readonly-document
      @update:active-tab="form.activeTab.value = $event"
      @status-change="changeStatus"
    />
  </AdminFormPage>
  <AdminLifecycleDialog
    v-model:open="lifecycle.open.value"
    v-model:values="lifecycle.form"
    :action="lifecycle.action.value"
    :resource-label="lifecycle.target.value?.name ?? ''"
    resource-type="schools"
    :current-status="lifecycle.target.value?.status ?? ''"
    :pending="lifecycle.pending.value"
    :field-errors="lifecycle.fieldErrors.value"
    :form-error="lifecycle.formError.value"
    @submit="submitLifecycle"
    @cancel="lifecycle.close"
  />
</template>
