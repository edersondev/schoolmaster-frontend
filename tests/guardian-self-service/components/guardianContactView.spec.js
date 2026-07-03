import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GuardianContactPanel from '@/components/guardian/GuardianContactPanel.vue'
import GuardianStudentPrimaryContactPanel from '@/components/guardian/GuardianStudentPrimaryContactPanel.vue'
import GuardianContactView from '@/pages/guardian/GuardianContactView.vue'
import { createGuardianI18n } from '../test-utils'

describe('guardian contact view', () => {
  it('renders guardian contact, relationship label, and missing values without edit controls', () => {
    const wrapper = mount(GuardianContactPanel, {
      props: {
        contact: { name: 'Guardian One', email: null, phone: '555' },
        relationshipLabel: 'Mother',
      },
      global: { plugins: [createGuardianI18n()] },
    })
    expect(wrapper.text()).toContain('Guardian One')
    expect(wrapper.text()).toContain('Mother')
    expect(wrapper.text()).toContain('Not provided')
    expect(wrapper.text()).not.toMatch(/edit|other guardian|non-primary|school-only/i)
  })

  it('renders student primary contact only', () => {
    const wrapper = mount(GuardianStudentPrimaryContactPanel, {
      props: { contact: { name: 'Office', phone: '555', nonPrimaryContacts: 'hidden' } },
      global: { plugins: [createGuardianI18n()] },
    })
    expect(wrapper.text()).toContain('Office')
    expect(wrapper.text()).not.toContain('hidden')
  })

  it('exposes dedicated route component', () => {
    expect(GuardianContactView).toBeTruthy()
  })
})
