import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useAdminCreateForm } from './useAdminCreateForm'
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard'

export function useAdministrationCreatePage(options) {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const sessionStore = useAuthSessionStore()
  const { activeSchool } = storeToRefs(sessionStore)
  const tenantId = computed(() => (options.tenantOwned ? (activeSchool.value?.id ?? null) : null))
  const form = useAdminCreateForm({
    initialValues: options.initialValues,
    operationId: options.operationId,
    routeName: route.name,
    validate: options.validate,
    submitter: (values) => options.submitter(values, { schoolId: tenantId.value }),
  })
  useUnsavedChangesGuard({ isDirty: form.isDirty, submitted: form.submitted })
  if (options.tenantOwned) {
    watch(tenantId, (schoolId, previousSchoolId) => {
      if (previousSchoolId && schoolId !== previousSchoolId) form.reset()
    })
  }

  const destination = () => ({ name: options.listRouteName, query: route.query })

  async function submit() {
    try {
      await form.submit()
      ElMessage.success(t('administration.common.success'))
      await router.push(destination())
    } catch {
      // Form composable owns normalized feedback.
    }
  }

  return { form, submit, cancel: () => router.push(destination()), tenantId }
}
