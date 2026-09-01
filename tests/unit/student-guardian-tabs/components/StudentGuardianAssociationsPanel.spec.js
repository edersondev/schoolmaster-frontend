import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import StudentGuardianAssociationsPanel from '@/components/admin-system/students/StudentGuardianAssociationsPanel.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      studentGuardianTabs: {
        guardians: {
          empty: 'No guardians added.',
          relationship: 'Relationship',
          email: 'Email',
          phone: 'Phone',
        },
      },
    },
  },
})

const stubs = {
  AdminStatusTag: {
    props: ['status'],
    template: '<span class="status-tag">{{ status }}</span>',
  },
}

describe('StudentGuardianAssociationsPanel', () => {
  it('renders empty state when there are no associations', () => {
    const wrapper = mount(StudentGuardianAssociationsPanel, {
      props: { associations: [] },
      global: { plugins: [i18n], stubs },
    })

    expect(wrapper.text()).toContain('No guardians added.')
  })

  it('renders association fields with formatted phone and status', () => {
    const wrapper = mount(StudentGuardianAssociationsPanel, {
      props: {
        associations: [
          {
            id: 'guardian-1',
            fullName: 'Maria Souza',
            relationshipType: 'mother',
            contactEmail: 'maria@example.com',
            contactPhone: '11999999999',
            status: 'active',
          },
        ],
      },
      global: { plugins: [i18n], stubs },
    })

    expect(wrapper.text()).toContain('Maria Souza')
    expect(wrapper.text()).toContain('mother')
    expect(wrapper.text()).toContain('maria@example.com')
    expect(wrapper.text()).toContain('(11) 99999-9999')
    expect(wrapper.find('.status-tag').text()).toBe('active')
  })
})
