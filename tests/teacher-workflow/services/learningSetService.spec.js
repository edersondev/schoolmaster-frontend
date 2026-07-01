import { describe, expect, it } from 'vitest'
import {
  assertNoUndocumentedScopedFilters,
  createLearningSetService,
  mapLearningSetRequest,
} from '@/modules/teacher-workflow/services/learningSetService'

describe('learningSetService contract gates', () => {
  it('blocks undocumented scoped list filters', () => {
    expect(() => assertNoUndocumentedScopedFilters({ academicPeriodId: 'period-1' })).toThrow(
      /Learning-set scoped filter/,
    )
  })

  it('blocks create while roster-aware OpenAPI create remains missing', async () => {
    const service = createLearningSetService({})
    expect(() => service.create({ title: 'Set' })).toThrow(/roster-aware OpenAPI/)
    try {
      service.create({ title: 'Set' })
    } catch (error) {
      expect(error).toMatchObject({
      feedbackState: 'unsupported-contract',
      })
    }
  })

  it('maps roster-aware update fields without legacy student_profile_ids', () => {
    expect(
      mapLearningSetRequest({
        academicPeriodId: 'period-1',
        title: 'Set',
        entries: [{ type: 'content_item', id: 'content-1' }],
        rosterAssignment: { classSectionId: 'section-1' },
        studentProfileIds: ['blocked'],
      }),
    ).toEqual({
      academic_period_id: 'period-1',
      title: 'Set',
      description: null,
      entries: [{ type: 'content_item', id: 'content-1' }],
      roster_assignment: { class_section_id: 'section-1' },
      due_at: null,
    })
  })
})
