import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UserRecoveryAlert from '@/components/admin-system/users/UserRecoveryAlert.vue'
import { administrationPlugins } from '../../administration/administration.fixtures'
import { recoveryUserId } from '../fixtures/recoveryFeedback'

describe('UserRecoveryAlert', () => {
  it('announces fixed safe guidance politely without moving focus', async () => {
    const input = document.createElement('input')
    document.body.append(input)
    input.focus()

    const wrapper = mount(UserRecoveryAlert, {
      attachTo: document.body,
      props: { visible: true, pending: false },
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
    expect(wrapper.attributes('aria-atomic')).toBe('true')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('An existing user can be restored.')
    expect(wrapper.text()).toContain('Restore existing user')
    expect(wrapper.html()).not.toContain(recoveryUserId)
    expect(document.activeElement).toBe(input)

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('restore')).toHaveLength(1)

    wrapper.unmount()
    input.remove()
  })

  it('disables its ordinary action while restoration is pending', async () => {
    const wrapper = mount(UserRecoveryAlert, {
      props: { visible: true, pending: true },
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('restore')).toBeUndefined()
  })
})
