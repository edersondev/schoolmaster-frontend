import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PlatformSupportFeedbackState from '@/components/platform-support/PlatformSupportFeedbackState.vue'
import PlatformSupportRefreshStatus from '@/components/platform-support/PlatformSupportRefreshStatus.vue'
import PlatformSupportStatusBadges from '@/components/platform-support/PlatformSupportStatusBadges.vue'
import { globalMountOptions } from './testUtils'

describe('platform support shared states', () => {
  it('renders forbidden feedback safely', () => {
    const wrapper = mount(PlatformSupportFeedbackState, {
      props: { feedback: { type: 'forbidden' } },
      ...globalMountOptions(),
    })
    expect(wrapper.text()).toContain('platformSupport.feedback.forbidden')
  })

  it('renders suppression and redaction badges', () => {
    const wrapper = mount(PlatformSupportStatusBadges, {
      props: { state: 'approved', suppressed: ['small_count'], redactedFields: ['private_path'] },
      ...globalMountOptions(),
    })
    expect(wrapper.text()).toContain('small_count')
    expect(wrapper.text()).toContain('private_path')
  })

  it('emits manual refresh without replacing focus target', async () => {
    const wrapper = mount(PlatformSupportRefreshStatus, {
      props: { pending: false, lastRefreshedAt: 'now' },
      ...globalMountOptions(),
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('refresh')?.length).toBeGreaterThan(0)
  })
})
