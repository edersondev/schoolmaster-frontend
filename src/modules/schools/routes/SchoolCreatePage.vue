<script setup>
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import SchoolProfileForm from '../components/SchoolProfileForm.vue'
import { useSchoolForm } from '../composables/useSchoolForm'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const form = useSchoolForm({ mode: 'create' })

useUnsavedChangesGuard({ isDirty: form.isDirty, submitted: form.submitted })

function destination() {
  return createReturnToListLocation(route, 'schoolsList')
}

async function submit() {
  try {
    await form.submit()
    ElMessage.success(t('administration.common.success'))
    await router.push(destination())
  } catch {
    // Form owns feedback.
  }
}

function cancel() {
  router.push(destination())
}

onMounted(() => form.loadLookups())
</script>

<template>
  <AdminFormPage
    :title="t('administration.schools.createTitle')"
    :pending="form.pending.value"
    :field-errors="form.fieldErrors.value"
    :form-error="form.formError.value"
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
      @update:active-tab="form.activeTab.value = $event"
    />
  </AdminFormPage>
</template>
