<script setup>
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { createGuardianForm, mapGuardianForm, validateGuardianForm } from '@/contracts/admin-system/guardians'
import { useAdminDetail } from '@/composables/admin-system/useAdminDetail'
import { useAdminUpdateForm } from '@/composables/admin-system/useAdminUpdateForm'
import { useUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { getGuardian, updateGuardian } from '@/services/admin-system/guardians'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminFeedbackState from '@/components/ui/admin/AdminFeedbackState.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import GuardianEditFields from '@/components/admin-system/guardians/GuardianEditFields.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { activeSchool } = storeToRefs(useAuthSessionStore())
const guardianId = computed(() => String(route.params.guardianId ?? ''))
const tenantId = computed(() => activeSchool.value?.id ?? null)
const detail = useAdminDetail({ id: guardianId, schoolId: tenantId, schoolRequired: true, loader: getGuardian, operationId: 'getGuardian', routeName: route.name })
const form = useAdminUpdateForm({ initialValues: createGuardianForm(), operationId: 'updateGuardian', routeName: route.name, validate: validateGuardianForm, submitter: (values) => updateGuardian(guardianId.value, values, { schoolId: tenantId.value }), mapResult: mapGuardianForm })
useUnsavedChangesGuard({ isDirty: form.isDirty, submitted: form.submitted })
const destination = () => createReturnToListLocation(route, 'guardiansList')
async function loadRecord() { const record = await detail.load(); if (record) form.reset(mapGuardianForm(record)) }
async function submit() { try { await form.submit(); ElMessage.success(t('administration.common.updateSuccess')); await router.push(destination()) } catch {} }
function cancel() { router.push(destination()) }
watch([guardianId, tenantId], loadRecord, { immediate: true })
</script>

<template>
  <section v-if="detail.status.value !== 'ready'" class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="font-display text-2xl font-semibold text-sm-text">{{ t('administration.guardians.editTitle') }}</h1>
    <AdminFeedbackState :state="detail.status.value" :feedback="detail.error.value" @retry="loadRecord" />
    <div class="flex justify-end"><ElButton @click="cancel">{{ t('administration.common.cancel') }}</ElButton></div>
  </section>
  <AdminFormPage v-else :title="t('administration.guardians.editTitle')" :pending="form.pending.value" :field-errors="form.fieldErrors.value" :form-error="form.formError.value" :submit-label="t('administration.common.update')" @submit="submit" @cancel="cancel">
    <GuardianEditFields v-model="form.values" :errors="form.fieldErrors.value" />
  </AdminFormPage>
</template>
