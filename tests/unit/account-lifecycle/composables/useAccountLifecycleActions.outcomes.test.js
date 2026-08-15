import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, shallowRef } from 'vue'
import { useAccountLifecycleActions } from '@/composables/admin-system/useAccountLifecycleActions'
import { lifecyclePlugins, schoolId, userRecord } from '../fixtures'

const permission = [{ code: 'account_lifecycle.manage', scope: 'school', status: 'active' }]

describe('useAccountLifecycleActions outcomes', () => {
  it('deduplicates submission and refreshes target plus lock after success', async () => {
    const service = {
      getAccountLock: vi.fn().mockResolvedValue({ status: 'none' }),
      lockAccount: vi.fn().mockResolvedValue({ status: 'active' }),
    }
    const refreshTarget = vi.fn().mockResolvedValue(userRecord)
    let lifecycle
    mount(
      {
        setup() {
          lifecycle = useAccountLifecycleActions({
            target: shallowRef(userRecord),
            actorId: shallowRef('admin-1'),
            schoolId: shallowRef(schoolId),
            permissions: shallowRef(permission),
            refreshTarget,
            service,
          })
          return {}
        },
        template: '<div />',
      },
      { global: { plugins: lifecyclePlugins() } },
    )
    await nextTick()
    lifecycle.launch('lock')
    lifecycle.reason.value = 'Security review'

    const first = lifecycle.submit()
    const second = lifecycle.submit()
    await Promise.all([first, second])

    expect(service.lockAccount).toHaveBeenCalledTimes(1)
    expect(refreshTarget).toHaveBeenCalledTimes(1)
    expect(service.getAccountLock).toHaveBeenCalledTimes(2)
    expect(lifecycle.open.value).toBe(false)
  })

  it('ignores an old response after target context changes', async () => {
    const lockResolvers = []
    const service = {
      getAccountLock: vi.fn(
        () =>
          new Promise((resolve) => {
            lockResolvers.push(resolve)
          }),
      ),
    }
    const target = shallowRef(userRecord)
    let lifecycle
    mount(
      {
        setup() {
          lifecycle = useAccountLifecycleActions({
            target,
            actorId: shallowRef('admin-1'),
            schoolId: shallowRef(schoolId),
            permissions: shallowRef(permission),
            service,
          })
          return {}
        },
        template: '<div />',
      },
      { global: { plugins: lifecyclePlugins() } },
    )
    await nextTick()
    target.value = { ...userRecord, id: 'new-user' }
    await nextTick()
    lockResolvers[0]({ status: 'active' })
    await nextTick()

    expect(lifecycle.lock.value).toBeNull()
  })
})
