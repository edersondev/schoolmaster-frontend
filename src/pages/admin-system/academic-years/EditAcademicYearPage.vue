<script setup>
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { createAcademicYearForm, mapAcademicYearForm, validateAcademicYearForm } from '@/contracts/admin-system/academics'
import { useAdminDetail } from '@/composables/admin-system/useAdminDetail'
import { useAdminUpdateForm } from '@/composables/admin-system/useAdminUpdateForm'
import { useUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { getAcademicYear, updateAcademicYear } from '@/services/admin-system/academic-years'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminFeedbackState from '@/components/ui/admin/AdminFeedbackState.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import AcademicYearEditFields from '@/components/admin-system/academic-years/AcademicYearEditFields.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { activeSchool } = storeToRefs(useAuthSessionStore())
const academicYearId = computed(() => String(route.params.academicYearId ?? ''))
const tenantId = computed(() => activeSchool.value?.id ?? null)
const detail = useAdminDetail({ id: academicYearId, schoolId: tenantId, schoolRequired: true, loader: getAcademicYear, operationId: 'getAcademicYear', routeName: route.name })
const form = useAdminUpdateForm({ initialValues: createAcademicYearForm(), operationId: 'updateAcademicYear', routeName: route.name, validate: validateAcademicYearForm, submitter: (values) => updateAcademicYear(academicYearId.value, values, { schoolId: tenantId.value }), mapResult: mapAcademicYearForm })
useUnsavedChangesGuard({ isDirty: form.isDirty, submitted: form.submitted })
const destination = () => createReturnToListLocation(route, 'academicYearsList')
async function loadRecord() { const record = await detail.load(); if (record) form.reset(mapAcademicYearForm(record)) }
async function submit() { try { await form.submit(); ElMessage.success(t('administration.common.updateSuccess')); await router.push(destination()) } catch {} }
function cancel() { router.push(destination()) }
watch([academicYearId, tenantId], loadRecord, { immediate: true })
</script>

<template>
  <section v-if="detail.status.value !== 'ready'" class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="font-display text-2xl font-semibold text-sm-text">{{ t('administration.academicYears.editTitle') }}</h1>
    <AdminFeedbackState :state="detail.status.value" :feedback="detail.error.value" @retry="loadRecord" />
    <div class="flex justify-end"><ElButton @click="cancel">{{ t('administration.common.cancel') }}</ElButton></div>
  </section>
  <AdminFormPage v-else :title="t('administration.academicYears.editTitle')" :pending="form.pending.value" :field-errors="form.fieldErrors.value" :form-error="form.formError.value" :submit-label="t('administration.common.update')" @submit="submit" @cancel="cancel">
    <AcademicYearEditFields v-model="form.values" :errors="form.fieldErrors.value" />
  </AdminFormPage>
</template>
