import { describe, expect, it } from 'vitest'
import {
  STUDENT_PROFILE_BLOCKED_ACTIONS,
  createStudentProfileDraft,
  createStudentStatusDraft,
  createStudentTransferDraft,
  mapStudentProfile,
  mapStudentProfileCreateRequest,
  mapStudentStatusRequest,
  mapStudentTransferRequest,
  validateStudentLifecycleDraft,
  validateStudentProfileDraft,
} from '@/contracts/admin-system/student-profiles'
import { studentProfile } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('student profile contract', () => {
  it('maps profiles and blocks general edit metadata', () => {
    expect(mapStudentProfile(studentProfile)).toMatchObject({ id: 'student-1', fullName: 'Ana Silva' })
    expect(STUDENT_PROFILE_BLOCKED_ACTIONS.generalEdit).toBeTruthy()
  })

  it('projects approved create/status/transfer payloads only', () => {
    const draft = createStudentProfileDraft({ registrationNumber: 'R1', firstName: 'A', lastName: 'B', enrolledAt: '2026-01-01', extra: 'x' })
    expect(validateStudentProfileDraft(draft)).toEqual({})
    expect(mapStudentProfileCreateRequest(draft)).not.toHaveProperty('extra')
    expect(mapStudentStatusRequest(createStudentStatusDraft({ status: 'inactive', effectiveAt: '2026-01-02', reason: 'move' }))).toEqual({ status: 'inactive', effective_at: '2026-01-02', reason: 'move' })
    expect(mapStudentTransferRequest(createStudentTransferDraft({ effectiveAt: '2026-01-02', reason: 'move' }))).toEqual({ effective_at: '2026-01-02', reason: 'move' })
    expect(validateStudentLifecycleDraft({})).toHaveProperty('effective_at')
  })
})
