import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import RosterMembershipBatchPanel from '@/components/admin-system/class-sections/RosterMembershipBatchPanel.vue'
import AdminBatchActionDialog from '@/components/ui/admin/AdminBatchActionDialog.vue'

describe('RosterMembershipBatchPanel', () => {
  it('shows 100-request cap copy', () => {
    const wrapper = mount(RosterMembershipBatchPanel, { attachTo: document.body, global: { plugins: [ElementPlus] }, props: { modelValue: {}, selectedCount: 101 } })
    expect(wrapper.findComponent(AdminBatchActionDialog).props('maxCount')).toBe(100)
  })
})
