import { describe, expect, it, vi } from 'vitest'
import {
  createStudentAcademicOverviewSummary,
  useStudentAcademicOverview,
} from '@/composables/student/useStudentAcademicOverview'
import { activeStudentContext } from '../test-utils'

describe('useStudentAcademicOverview', () => {
  it('aggregates counts and statuses without GPA or attendance-rate metrics', () => {
    const summary = createStudentAcademicOverviewSummary({
      learningSets: [{ entries: [{ contentItem: { downloadAvailable: true } }, { contentItem: { downloadAvailable: false } }] }],
      grades: [{ status: 'active' }, { status: 'archived' }],
      attendance: [{ attendanceStatus: 'present' }, { attendanceStatus: 'absent' }],
    })
    expect(summary).toEqual({
      assignedLearningSetCount: 1,
      downloadableContentCount: 1,
      unavailableContentCount: 1,
      gradeStatusCounts: { active: 1, archived: 1 },
      attendanceStatusCounts: { present: 1, absent: 1 },
    })
    expect(summary.gpa).toBeUndefined()
    expect(summary.attendanceRate).toBeUndefined()
  })

  it('loads overview from approved list responses only', async () => {
    const service = {
      listAssignedLearningSets: vi.fn().mockResolvedValue({ items: [], meta: {} }),
      listStudentGrades: vi.fn().mockResolvedValue({ items: [{ status: 'active' }], meta: {} }),
      listStudentAttendance: vi.fn().mockResolvedValue({ items: [{ attendanceStatus: 'present' }], meta: {} }),
    }
    const overview = useStudentAcademicOverview({ context: activeStudentContext, service })
    await overview.load()
    expect(service.listAssignedLearningSets).toHaveBeenCalled()
    expect(overview.summary.value.gradeStatusCounts).toEqual({ active: 1 })
  })
})
