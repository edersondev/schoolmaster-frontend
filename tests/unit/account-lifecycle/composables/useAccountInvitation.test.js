import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, shallowRef } from 'vue'
import { useAccountInvitation } from '@/composables/admin-system/useAccountInvitation'
import { lifecyclePlugins, schoolId, userRecord } from '../fixtures'

const permission = [{ code: 'account_lifecycle.manage', scope: 'school', status: 'active' }]

describe('useAccountInvitation', () => {
  it('uses the persisted invited user and deduplicates invitation creation', async () => {
    const service = {
      createAccountInvitation: vi.fn().mockResolvedValue({ status: 'pending' }),
    }
    let invitation
    mount(
      {
        setup() {
          invitation = useAccountInvitation({
            target: shallowRef({ ...userRecord, status: 'invited' }),
            schoolId: shallowRef(schoolId),
            actorId: shallowRef('admin-1'),
            permissions: shallowRef(permission),
            service,
          })
          return {}
        },
        template: '<div />',
      },
      { global: { plugins: lifecyclePlugins() } },
    )

    const first = invitation.create()
    const second = invitation.create()
    await Promise.all([first, second])

    expect(service.createAccountInvitation).toHaveBeenCalledTimes(1)
    expect(service.createAccountInvitation.mock.calls[0][0]).toMatchObject({
      email: userRecord.email,
      schoolId,
      roleIds: ['role-1'],
    })
  })

  it('invalidates old results when the actor changes', async () => {
    let resolveRequest
    const service = {
      createAccountInvitation: vi.fn(
        () =>
          new Promise((resolve) => {
            resolveRequest = resolve
          }),
      ),
    }
    const actorId = shallowRef('admin-1')
    let invitation
    mount(
      {
        setup() {
          invitation = useAccountInvitation({
            target: shallowRef({ ...userRecord, status: 'invited' }),
            schoolId: shallowRef(schoolId),
            actorId,
            permissions: shallowRef(permission),
            service,
          })
          return {}
        },
        template: '<div />',
      },
      { global: { plugins: lifecyclePlugins() } },
    )

    const request = invitation.create()
    actorId.value = 'admin-2'
    await nextTick()
    resolveRequest({ status: 'pending' })
    await request

    expect(invitation.invitation.value).toBeNull()
  })
})
