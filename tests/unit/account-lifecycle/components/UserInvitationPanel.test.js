import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserInvitationPanel from '@/components/admin-system/users/UserInvitationPanel.vue'
import { lifecyclePlugins, schoolId, userRecord } from '../fixtures'

describe('UserInvitationPanel', () => {
  it('renders explicit invitation for an eligible persisted user without resend', async () => {
    const service = {
      createAccountInvitation: vi.fn().mockResolvedValue({
        status: 'pending',
        expiresAt: '2026-08-18T00:00:00Z',
        deliveryChannel: 'email',
        deliveryRequestedAt: '2026-08-11T00:00:00Z',
        secret: 'must-not-render',
      }),
    }
    const wrapper = mount(UserInvitationPanel, {
      props: {
        user: { ...userRecord, status: 'invited' },
        actorId: 'admin-1',
        schoolId,
        permissions: [{ code: 'account_lifecycle.manage', scope: 'school', status: 'active' }],
        service,
      },
      global: { plugins: lifecyclePlugins() },
    })

    expect(wrapper.text().toLowerCase()).not.toContain('resend')
    await wrapper.find('button').trigger('click')
    expect(service.createAccountInvitation).toHaveBeenCalledTimes(1)
    expect(service.createAccountInvitation.mock.calls[0][0]).not.toHaveProperty('delivery_metadata')
    expect(wrapper.text()).toContain('pending')
    expect(wrapper.text()).toContain('email')
    expect(wrapper.text()).not.toContain('must-not-render')
  })

  it('unmounts for denied authority and sends zero requests', () => {
    const service = { createAccountInvitation: vi.fn() }
    const wrapper = mount(UserInvitationPanel, {
      props: {
        user: { ...userRecord, status: 'invited' },
        actorId: 'admin-1',
        schoolId,
        permissions: [],
        service,
      },
      global: { plugins: lifecyclePlugins() },
    })

    expect(wrapper.find('section').exists()).toBe(false)
    expect(service.createAccountInvitation).not.toHaveBeenCalled()
  })
})
