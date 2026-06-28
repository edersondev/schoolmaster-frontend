import { describe, expect, it, vi } from 'vitest'
import { createAcademicPeriodsService } from '@/services/admin-system/academic-periods'
import { createAcademicYearsService } from '@/services/admin-system/academic-years'

describe('academic bulk lifecycle service', () => {
  it('sends academic year bulk lifecycle requests', async () => {
    const client = {
      post: vi.fn(() => ({
        data: { data: { resource_type: 'academic_years', affected_ids: ['ay1', 'ay2'] } },
      })),
    }

    const result = await createAcademicYearsService(client).bulkLifecycleAcademicYears(
      {
        action: 'deactivate',
        ids: ['ay1', 'ay1', 'ay2'],
        effectiveAt: '2026-06-28',
        reason: 'Calendar rollover',
      },
      { schoolId: 'school1' },
    )

    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/academic-years/bulk-lifecycle',
      {
        action: 'deactivate',
        ids: ['ay1', 'ay2'],
        effective_at: '2026-06-28',
        reason: 'Calendar rollover',
      },
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-School-Id': 'school1' }),
      }),
    )
    expect(result.affectedIds).toEqual(['ay1', 'ay2'])
  })

  it('sends academic period requests and keeps dependency conflict feedback safe', async () => {
    const client = {
      post: vi.fn(() =>
        Promise.reject({
          response: { status: 409, data: { error: { code: 'dependency_conflict' } } },
        }),
      ),
    }

    await expect(
      createAcademicPeriodsService(client).bulkLifecycleAcademicPeriods(
        {
          action: 'delete',
          ids: ['ap1'],
          effectiveAt: '2026-06-28',
          reason: 'End of term',
        },
        { schoolId: 'school1' },
      ),
    ).rejects.toMatchObject({
      type: 'conflict',
      conflictKind: 'dependency',
      operationId: 'bulkLifecycleAcademicPeriods',
    })
  })
})
