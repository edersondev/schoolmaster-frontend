import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SupportAuditEventList from '@/components/platform-support/SupportAuditEventList.vue'
import SupportAuditFilters from '@/components/platform-support/SupportAuditFilters.vue'
import { auditEventRecord } from '../fixtures/platformSupportFixtures'
import { globalMountOptions } from './testUtils'

describe('Support Audit Review components', () => {
  it('renders minimized metadata and denied-safe target text', () => {
    const wrapper = mount(SupportAuditEventList, {
      props: { items: [{ ...auditEventRecord, targetSchoolId: null, full_payload: undefined }] },
      ...globalMountOptions(),
    })
    expect(wrapper.text()).toContain('diagnostics.viewed')
    expect(wrapper.text()).toContain('safe target omitted')
    expect(wrapper.text()).not.toContain('full_payload')
  })

  it('emits documented filters', async () => {
    const wrapper = mount(SupportAuditFilters, {
      props: { filters: { action: '', outcome: '', correlationId: '' } },
      ...globalMountOptions(),
    })
    await wrapper.find('input').setValue('diagnostics.viewed')
    expect(wrapper.emitted('update')[0][0]).toEqual({ action: 'diagnostics.viewed' })
  })
})

