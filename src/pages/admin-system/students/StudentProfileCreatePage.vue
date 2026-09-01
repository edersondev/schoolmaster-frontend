<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStudentCreateWorkflow } from '@/composables/admin-system/useStudentCreateWorkflow'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import StudentCreateGuardiansTab from '@/components/admin-system/students/StudentCreateGuardiansTab.vue'
import StudentCreateStudentTab from '@/components/admin-system/students/StudentCreateStudentTab.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const workflow = useStudentCreateWorkflow()
const page = workflow.page

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
    <ElTabs v-model="workflow.activeTab.value" class="student-create-tabs">
      <ElTabPane name="student">
        <template #label>
          <span>{{ t('studentGuardianTabs.tabs.student') }}</span>
          <ElBadge v-if="workflow.tabErrors.value.student" is-dot class="ml-2" />
        </template>
        <StudentCreateStudentTab
          v-model="page.form.values"
          :field-errors="page.form.fieldErrors.value"
        />
      </ElTabPane>
      <ElTabPane name="guardians">
        <template #label>
          <span>{{ t('studentGuardianTabs.tabs.guardians') }}</span>
          <ElBadge v-if="workflow.tabErrors.value.guardians" is-dot class="ml-2" />
        </template>
        <StudentCreateGuardiansTab
          :entries="workflow.guardianEntries.value"
          :field-errors="page.form.fieldErrors.value"
          :can-manage="workflow.canManageGuardians.value"
          :can-add="workflow.canAddGuardian.value"
          :maximum-reached="workflow.maximumReached.value"
          :pending="page.form.pending.value"
          :lookup="workflow.lookupGuardians"
          @add="workflow.addGuardian"
          @remove="workflow.removeGuardian"
          @update="workflow.updateGuardian"
        />
      </ElTabPane>
    </ElTabs>
  </AdminFormPage>
</template>
