import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SupportAccessDecisionDetail from '@/components/platform-support/SupportAccessDecisionDetail.vue'
import SupportAccessRequestForm from '@/components/platform-support/SupportAccessRequestForm.vue'
import SupportApprovalControls from '@/components/platform-support/SupportApprovalControls.vue'
import SupportOptInStatePanel from '@/components/platform-support/SupportOptInStatePanel.vue'
import { supportDecisionRecord } from '../fixtures/platformSupportFixtures'
import { globalMountOptions } from './testUtils'

describe('Support Access Decision workspace components', () => {
  it('renders request form and emits submit/update intent', async () => {
    const wrapper = mount(SupportAccessRequestForm, {
      props: { draft: { targetSchoolId: '', reasonCode: '', purpose: '', correlationId: '' }, canSubmit: true },
      ...globalMountOptions(),
    })
    await wrapper.find('input').setValue('school-1')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update')[0][0]).toEqual({ targetSchoolId: 'school-1' })
    expect(wrapper.emitted('submit')?.length).toBeGreaterThan(0)
  })

  it('renders decision, opt-in display-only state, and approval controls', () => {
    const decision = {
      ...supportDecisionRecord(),
      targetSchoolId: 'school-1',
      optInState: 'active',
      platformApprovalState: 'active',
      reasonCode: 'support',
      correlationId: 'corr-1',
      expiresAt: 'future',
    }
    expect(mount(SupportAccessDecisionDetail, { props: { decision }, ...globalMountOptions() }).text()).toContain('school-1')
    expect(mount(SupportOptInStatePanel, { props: { decision }, ...globalMountOptions() }).text()).toContain('unsupportedAction')
    expect(
      mount(SupportApprovalControls, {
        props: { canApprove: true, canRevoke: true },
        ...globalMountOptions(),
      }).findAll('button'),
    ).toHaveLength(2)
  })
})
