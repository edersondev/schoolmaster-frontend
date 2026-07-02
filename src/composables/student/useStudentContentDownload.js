import { reactive, readonly } from 'vue'
import { studentSelfServiceService } from '@/services/student/studentSelfServiceService'
import { STUDENT_FEEDBACK_STATES } from '@/contracts/student/studentSelfServiceContract'
import { useStudentSelfServiceStaleGuard } from './useStudentSelfServiceStaleGuard'
import { useStudentWorkspaceContext } from './useStudentWorkspaceContext'

export function useStudentContentDownload({
  context = null,
  service = studentSelfServiceService,
} = {}) {
  const workspace = context ?? useStudentWorkspaceContext()
  const staleGuard = useStudentSelfServiceStaleGuard()
  const state = reactive({
    pendingId: null,
    feedback: null,
    result: null,
  })

  async function download(contentItem = {}) {
    if (!workspace.schoolId) {
      state.feedback = { type: STUDENT_FEEDBACK_STATES.noActiveSchool }
      return null
    }
    if (contentItem.downloadAvailable !== true) {
      state.feedback = { type: STUDENT_FEEDBACK_STATES.unavailableContent }
      return null
    }

    state.pendingId = contentItem.id
    state.feedback = { type: STUDENT_FEEDBACK_STATES.loading }
    const captured = staleGuard.capture([workspace.schoolId, contentItem.id])
    try {
      const result = await service.downloadAssignedContent(
        { contentItemId: contentItem.id },
        { schoolId: workspace.schoolId },
      )
      if (!staleGuard.isCurrent(captured, [workspace.schoolId, contentItem.id])) return null
      state.result = result
      state.feedback = { type: STUDENT_FEEDBACK_STATES.success }
      return result
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      if (staleGuard.isCurrent(captured, [workspace.schoolId, contentItem.id])) state.pendingId = null
    }
  }

  return { state: readonly(state), download }
}
