import { describe, expect, it } from 'vitest'
import { assertPlaceholderOnly } from '@/contracts/admin-system/dashboard'

describe('dashboard placeholder contract', () => {
  it('rejects unapproved live dashboard data fields', () => {
    expect(assertPlaceholderOnly({ slotId: 'summary', state: 'empty' })).toBe(true)
    expect(assertPlaceholderOnly({ slotId: 'summary', summaryMetric: 12 })).toBe(false)
    expect(assertPlaceholderOnly({ slotId: 'activity', recentActivity: [] })).toBe(false)
    expect(assertPlaceholderOnly({ slotId: 'notice', notificationCount: 3 })).toBe(false)
  })
})
