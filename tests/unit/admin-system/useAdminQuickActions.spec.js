import { describe, expect, it } from 'vitest'
import { getVisibleQuickActions } from '@/composables/admin-system/useAdminQuickActions'
import { ADMIN_PERMISSIONS, ADMIN_QUICK_ACTIONS } from '@/contracts/admin-system/navigation'

describe('useAdminQuickActions', () => {
  it('hides quick actions when permission is absent', () => {
    expect(getVisibleQuickActions(ADMIN_QUICK_ACTIONS, [])).toEqual([])
  })

  it('hides quick actions when route or workflow approval is missing', () => {
    const blockedActions = [
      { ...ADMIN_QUICK_ACTIONS[0], routeApproved: false },
      { ...ADMIN_QUICK_ACTIONS[0], key: 'blocked-workflow', workflowApproved: false },
    ]

    expect(getVisibleQuickActions(blockedActions, [ADMIN_PERMISSIONS.viewDashboard])).toEqual([])
  })

  it('shows approved quick actions when permission is present', () => {
    const actions = getVisibleQuickActions(ADMIN_QUICK_ACTIONS, [ADMIN_PERMISSIONS.viewDashboard])

    expect(actions).toHaveLength(1)
    expect(actions[0].destination).toEqual({ name: 'adminDashboard' })
  })
})
