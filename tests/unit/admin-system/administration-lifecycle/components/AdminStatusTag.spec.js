import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'
import { administrationPlugins } from '../../administration/administration.fixtures'

describe('AdminStatusTag', () => {
  it('renders accessible lifecycle status labels', () => {
    const wrapper = mount(AdminStatusTag, {
      props: { status: 'active', compact: true },
      global: { plugins: administrationPlugins() },
    })
    expect(wrapper.text()).toContain('Active')
    expect(wrapper.attributes('aria-label')).toBe('Active')
  })
})
