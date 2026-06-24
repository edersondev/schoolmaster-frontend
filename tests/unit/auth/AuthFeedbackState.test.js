import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthFeedbackState from '@/components/auth/AuthFeedbackState.vue'
import { authGlobalPlugins } from './auth.fixtures'

describe('AuthFeedbackState', () => {
  it.each([
    ['forbidden', 'You do not have permission'],
    ['unauthorized', 'Sign in is required'],
    ['inactive-user', 'This account cannot access'],
    ['inactive-school', 'This school is not available'],
    ['tenant-mismatch', 'The requested school context'],
  ])('renders %s safely', (state, text) => {
    const wrapper = mount(AuthFeedbackState, {
      props: { feedback: { state, messageKey: `feedback.${state}` } },
      global: { plugins: authGlobalPlugins() },
    })
    expect(wrapper.text()).toContain(text)
  })
})
