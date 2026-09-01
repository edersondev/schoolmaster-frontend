import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  createGuardianEntryDraft,
  GUARDIAN_ENTRY_MODES,
  STUDENT_GUARDIAN_MAX_ENTRIES,
} from '@/contracts/admin-system/student-guardian-tabs'
import { useAdministrationCreatePage } from './useAdministrationCreatePage'
import {
  createStudentProfileDraft,
  validateStudentProfileDraft,
} from '@/contracts/admin-system/student-profiles'
import { createStudentProfile } from '@/services/admin-system/studentProfiles'
import { lookupActiveGuardians } from '@/services/admin-system/guardians'

export const STUDENT_CREATE_TABS = Object.freeze({
  student: 'student',
  guardians: 'guardians',
})

export function useStudentCreateWorkflow() {
  const activeTab = ref(STUDENT_CREATE_TABS.student)
  const sessionStore = useAuthSessionStore()
  const { activeSchool } = storeToRefs(sessionStore)
  const canManageGuardians = computed(() =>
    typeof sessionStore.hasPermission === 'function'
      ? sessionStore.hasPermission('guardians.manage')
      : (sessionStore.permissionCodes ?? []).includes('guardians.manage'),
  )
  const page = useAdministrationCreatePage({
    initialValues: createStudentProfileDraft(),
    validate: validateStudentProfileDraft,
    submitter: createStudentProfile,
    operationId: 'createStudentProfile',
    listRouteName: 'studentProfilesList',
    tenantOwned: true,
    navigateOnSuccess: false,
  })

  const guardianEntries = computed(() => page.form.values.guardianAssociations ?? [])
  const canAddGuardian = computed(
    () => canManageGuardians.value && guardianEntries.value.length < STUDENT_GUARDIAN_MAX_ENTRIES,
  )
  const maximumReached = computed(
    () => guardianEntries.value.length >= STUDENT_GUARDIAN_MAX_ENTRIES,
  )
  const tabErrors = computed(() => {
    const fields = Object.keys(page.form.fieldErrors.value)
    return {
      student: fields.some((field) => !field.startsWith('guardian_associations')),
      guardians: fields.some((field) => field.startsWith('guardian_associations')),
    }
  })

  function addGuardian(mode = GUARDIAN_ENTRY_MODES.new) {
    if (!canAddGuardian.value) return null
    const entry = createGuardianEntryDraft({ mode })
    page.form.values.guardianAssociations.push(entry)
    activeTab.value = STUDENT_CREATE_TABS.guardians
    return entry
  }

  function removeGuardian(entryId) {
    const index = page.form.values.guardianAssociations.findIndex(
      (entry) => entry.entryId === entryId,
    )
    if (index >= 0) page.form.values.guardianAssociations.splice(index, 1)
  }

  function updateGuardian(entryId, patch) {
    const entry = page.form.values.guardianAssociations.find(
      (candidate) => candidate.entryId === entryId,
    )
    if (!entry) return
    Object.assign(entry, patch)
  }

  async function lookupGuardians(query = {}, options = {}) {
    if (!canManageGuardians.value || !activeSchool.value?.id) {
      return { items: [], meta: { page: 1, perPage: 10, total: 0 } }
    }

    return lookupActiveGuardians(query, {
      schoolId: activeSchool.value.id,
      signal: options.signal,
    })
  }

  return {
    page,
    activeTab,
    canManageGuardians,
    guardianEntries,
    canAddGuardian,
    maximumReached,
    tabErrors,
    addGuardian,
    removeGuardian,
    updateGuardian,
    lookupGuardians,
  }
}
