import { reactive, shallowRef } from 'vue'
import { createStudentStatusDraft, validateStudentLifecycleDraft } from '@/contracts/admin-system/student-profiles'
import { updateStudentProfileStatus } from '@/services/admin-system/studentProfiles'

export function useStudentProfileLifecycle(options = {}) {
  const form = reactive(createStudentStatusDraft())
  const pending = shallowRef(false)
  const fieldErrors = shallowRef({})
  const feedback = shallowRef(null)
  const requestId = shallowRef(0)

  function reset(overrides = {}) {
    Object.assign(form, createStudentStatusDraft(overrides))
    fieldErrors.value = {}
    feedback.value = null
  }

  async function submit(studentProfileId) {
    fieldErrors.value = validateStudentLifecycleDraft(form)
    if (Object.keys(fieldErrors.value).length > 0) return null
    const id = requestId.value + 1
    requestId.value = id
    pending.value = true
    try {
      const result = await (options.submitter ?? updateStudentProfileStatus)(studentProfileId, form, options.serviceOptions?.())
      if (id !== requestId.value) return null
      feedback.value = { type: 'success' }
      return result
    } catch (err) {
      if (id === requestId.value) {
        fieldErrors.value = err.fieldErrors ?? {}
        feedback.value = err
      }
      throw err
    } finally {
      if (id === requestId.value) pending.value = false
    }
  }

  return { form, pending, fieldErrors, feedback, reset, submit }
}
