import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GuardianForm from '@/components/admin-system/guardians/GuardianForm.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('guardian components', () => {
  it('gates remote student lookup by permission', () => {
    const props = {
      modelValue: {
        fullName: '',
        relationshipType: '',
        contactEmail: '',
        contactPhone: '',
        studentProfileIds: [],
      },
      studentOptions: [],
    }
    const hidden = mount(GuardianForm, {
      props: { ...props, canLookupStudents: false },
      global: { plugins: administrationPlugins() },
    })
    expect(hidden.text()).not.toContain('Students')
    const shown = mount(GuardianForm, {
      props: { ...props, canLookupStudents: true },
      global: { plugins: administrationPlugins() },
    })
    expect(shown.text()).toContain('Students')
  })
})
