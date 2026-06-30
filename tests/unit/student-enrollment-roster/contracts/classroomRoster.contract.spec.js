import { describe, expect, it } from 'vitest'
import {
  ROSTER_BATCH_LIMIT,
  createRosterMembershipBatchDraft,
  mapClassSection,
  mapRosterBatchAddRequest,
  mapRosterBatchEndRequest,
  uniqueIds,
  validateRosterBatchAddDraft,
} from '@/contracts/admin-system/classroom-roster'
import { classSection } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('classroom roster contract', () => {
  it('maps sections and caps batch membership requests', () => {
    expect(mapClassSection(classSection)).toMatchObject({ id: 'section-1', academicPeriodId: 'period-1' })
    expect(ROSTER_BATCH_LIMIT).toBe(100)
    expect(uniqueIds(['a', 'a', 'b'])).toEqual(['a', 'b'])
  })

  it('projects add/end batch payloads', () => {
    const add = createRosterMembershipBatchDraft({ academicPeriodId: 'period-1', effectiveStartDate: '2026-02-01', studentProfileIds: ['s1'] })
    expect(validateRosterBatchAddDraft(add)).toEqual({})
    expect(mapRosterBatchAddRequest(add)).toEqual({ academic_period_id: 'period-1', effective_start_date: '2026-02-01', student_profile_ids: ['s1'] })
    expect(mapRosterBatchEndRequest({ effectiveEndDate: '2026-03-01', reason: 'end', rosterMembershipIds: ['m1'] })).toEqual({ effective_end_date: '2026-03-01', reason: 'end', roster_membership_ids: ['m1'] })
  })
})
