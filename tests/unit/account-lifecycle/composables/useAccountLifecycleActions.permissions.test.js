import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, nextTick, shallowRef } from 'vue'
import { useAccountLifecycleActions } from '@/composables/admin-system/useAccountLifecycleActions'
import { lifecyclePlugins, schoolId, userRecord } from '../fixtures'

describe('useAccountLifecycleActions permissions', () => {
  it('allows only active exact-scope permission and sends no request for denied contexts', async () => {
    const service = { getAccountLock: vi.fn().mockResolvedValue({ status: 'none' }) }
    const permissions = shallowRef([
      { code: 'account_lifecycle.manage', scope: 'platform', status: 'active' },
    ])
    const actorId = shallowRef('admin-1')
    const target = shallowRef(userRecord)
    const activeSchoolId = shallowRef(schoolId)
    let lifecycle

    mount(
      {
        setup() {
          lifecycle = useAccountLifecycleActions({
            target,
            actorId,
            schoolId: activeSchoolId,
            permissions: computed(() => permissions.value),
            service,
          })
          return {}
        },
        template: '<div />',
      },
      { global: { plugins: lifecyclePlugins() } },
    )

    expect(lifecycle.eligibility.value).toMatchObject({ blocked: true, canLock: false })
    expect(service.getAccountLock).not.toHaveBeenCalled()

    permissions.value = [{ code: 'account_lifecycle.manage', scope: 'school', status: 'active' }]
    await nextTick()
    expect(lifecycle.eligibility.value).toMatchObject({ blocked: false, canLock: true })
    expect(service.getAccountLock).toHaveBeenCalledTimes(1)

    service.getAccountLock.mockClear()
    target.value = { ...userRecord, id: 'admin-1' }
    await nextTick()
    expect(lifecycle.eligibility.value.selfTarget).toBe(true)
    expect(service.getAccountLock).not.toHaveBeenCalled()

    target.value = userRecord
    activeSchoolId.value = 'other-school'
    await nextTick()
    expect(lifecycle.eligibility.value.blocked).toBe(true)
    expect(service.getAccountLock).not.toHaveBeenCalled()
  })
})
