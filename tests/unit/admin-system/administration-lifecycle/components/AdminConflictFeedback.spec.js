import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminConflictFeedback from '@/components/ui/admin/AdminConflictFeedback.vue'
import { administrationPlugins } from '../../administration/administration.fixtures'

describe('AdminConflictFeedback', () => {
  it('renders conflict feedback without sensitive payloads', () => {
    const wrapper = mount(AdminConflictFeedback, {
      props: { feedback: { type: 'conflict', conflictKind: 'dependency', reason: 'private' } },
      global: { plugins: administrationPlugins() },
    })
    expect(wrapper.text()).toContain('Resolve dependent records')
    expect(wrapper.text()).not.toContain('private')
  })
})
