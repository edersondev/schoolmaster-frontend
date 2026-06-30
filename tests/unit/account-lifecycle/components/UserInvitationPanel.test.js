import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UserInvitationPanel from '@/components/admin-system/users/UserInvitationPanel.vue'
import { lifecyclePlugins, schoolId, userRecord } from '../fixtures'

describe('UserInvitationPanel', () => {
  it('renders blocked resend and permission-source state', () => {
    const wrapper = mount(UserInvitationPanel, {
      props: { user: userRecord, schoolId, permissions: ['*'] },
      global: { plugins: lifecyclePlugins() },
    })

    expect(wrapper.text()).toContain('Admin resend is blocked')
    expect(wrapper.text()).toContain('permission codes or capability flags')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})

