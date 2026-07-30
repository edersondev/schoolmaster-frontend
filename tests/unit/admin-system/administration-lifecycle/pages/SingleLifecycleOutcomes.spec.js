import { describe, expect, it } from 'vitest'
import { mapLifecycleOutcome } from '@/contracts/admin-system/lifecycle'
import { applySchoolLifecycleContextOutcome } from '@/composables/auth/schoolContextLifecycle'
import { vi } from 'vitest'

describe('single lifecycle outcomes', () => {
  it('maps status and lifecycle history without undocumented fields', () => {
    expect(
      mapLifecycleOutcome({
        data: { resource_id: 'u1', status: 'inactive', lifecycle_history: [] },
      }),
    ).toEqual(
      expect.objectContaining({ resourceId: 'u1', status: 'inactive', lifecycleHistory: [] }),
    )
  })

  it.each(['deactivate', 'delete'])('invalidates current school after successful %s', (action) => {
    const session = {
      activeSchool: { id: 'school-1' },
      invalidateSchoolContext: vi.fn(() => true),
    }

    expect(
      applySchoolLifecycleContextOutcome({
        action,
        targetId: 'school-1',
        outcome: { resourceId: 'school-1' },
        session,
      }),
    ).toBe(true)
    expect(session.invalidateSchoolContext).toHaveBeenCalledWith({
      reason: 'inactive-school',
      schoolId: 'school-1',
    })
  })

  it.each(['activate', 'restore', 'deactivate'])(
    'does not invalidate for non-current or %s result',
    (action) => {
      const session = { activeSchool: { id: 'school-1' }, invalidateSchoolContext: vi.fn() }
      expect(
        applySchoolLifecycleContextOutcome({
          action,
          targetId: 'school-2',
          outcome: { resourceId: 'school-2' },
          session,
        }),
      ).toBe(false)
      expect(session.invalidateSchoolContext).not.toHaveBeenCalled()
    },
  )
})
