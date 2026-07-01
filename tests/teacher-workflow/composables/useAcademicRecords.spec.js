import { describe, expect, it } from 'vitest'
import {
  validateCorrectionReason,
  validateGradeCorrectionDraft,
  useGrades,
} from '@/modules/teacher-workflow/composables/useGrades'
import {
  validateAttendanceCorrectionDraft,
  useAttendance,
} from '@/modules/teacher-workflow/composables/useAttendance'

describe('academic record composables', () => {
  it('validates correction reason length', () => {
    expect(validateCorrectionReason('short')).toMatch(/10/)
    expect(validateCorrectionReason('a'.repeat(501))).toMatch(/500/)
    expect(validateCorrectionReason('valid reason')).toBe('')
  })

  it('validates grade correction value before submit', async () => {
    expect(validateGradeCorrectionDraft({ gradeValue: null, correctionReason: 'valid reason' }).gradeValue).toBeTruthy()

    const composable = useGrades({ service: { correct: async () => ({}) } })
    composable.state.detail = { id: 'grade-1' }
    composable.state.correctionDraft = { gradeValue: null, correctionReason: 'valid reason' }

    await composable.correct()

    expect(composable.state.feedback.fields.gradeValue).toBeTruthy()
  })

  it('validates attendance correction status before submit', async () => {
    expect(
      validateAttendanceCorrectionDraft({ attendanceStatus: '', correctionReason: 'valid reason' }).attendanceStatus,
    ).toBeTruthy()

    const composable = useAttendance({ service: { correct: async () => ({}) } })
    composable.state.detail = { id: 'attendance-1' }
    composable.state.correctionDraft = { attendanceStatus: '', correctionReason: 'valid reason' }

    await composable.correct()

    expect(composable.state.feedback.fields.attendanceStatus).toBeTruthy()
  })
})
