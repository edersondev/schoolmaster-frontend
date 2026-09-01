import { computed, reactive, ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useStudentCreateWorkflow } from '@/composables/admin-system/useStudentCreateWorkflow'

vi.mock('@/composables/admin-system/useAdministrationCreatePage', () => ({
  useAdministrationCreatePage: () => ({
    form: {
      values: reactive({ guardianAssociations: [] }),
      fieldErrors: ref({}),
      pending: ref(false),
      submit: vi.fn(),
    },
  }),
}))

describe('useStudentCreateWorkflow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.activeSchool = { id: 'school-1', status: 'active' }
    store.permissions = [{ code: 'guardians.manage', status: 'active', scope: 'school' }]
  })

  it('manages tab state and max two guardian entries', () => {
    const workflow = useStudentCreateWorkflow()

    expect(workflow.canAddGuardian.value).toBe(true)
    workflow.addGuardian()
    workflow.addGuardian()
    workflow.addGuardian()

    expect(workflow.guardianEntries.value).toHaveLength(2)
    expect(workflow.maximumReached.value).toBe(true)
    expect(workflow.activeTab.value).toBe('guardians')
  })

  it('maps field errors to the owning tab', () => {
    const workflow = useStudentCreateWorkflow()
    workflow.page.form.fieldErrors = computed(() => ({
      first_name: ['Required'],
      'guardian_associations.0.full_name': ['Required'],
    }))

    expect(workflow.tabErrors.value).toEqual({ student: true, guardians: true })
  })
})
