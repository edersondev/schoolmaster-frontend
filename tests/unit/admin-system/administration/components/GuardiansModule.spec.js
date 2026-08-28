import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GuardianFilters from '@/components/admin-system/guardians/GuardianFilters.vue'
import GuardianForm from '@/components/admin-system/guardians/GuardianForm.vue'
import GuardianDetailSections from '@/components/admin-system/guardians/GuardianDetailSections.vue'
import GuardianTable from '@/components/admin-system/guardians/GuardianTable.vue'
import PhoneField from '@/components/ui/PhoneField.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('guardian components', () => {
  it('reuses the shared masked phone field for create and edit forms', async () => {
    const form = {
      fullName: '',
      relationshipType: '',
      contactEmail: '',
      contactPhone: '',
      studentProfileIds: [],
    }
    const wrapper = mount(GuardianForm, {
      props: { modelValue: form },
      global: { plugins: administrationPlugins() },
    })

    const phoneField = wrapper.findComponent(PhoneField)
    expect(phoneField.exists()).toBe(true)
    expect(phoneField.get('input').attributes('placeholder')).toBe('(00) 00000-0000')

    await phoneField.get('input').trigger('maska', {
      detail: {
        masked: '(11) 98765-4321',
        unmasked: '11987654321',
        completed: true,
      },
    })

    expect(form.contactPhone).toBe('11987654321')
  })

  it('uses the same phone mask in Guardian list and detail output', () => {
    const guardian = {
      id: 'guardian-1',
      fullName: 'Pat Guardian',
      relationshipType: 'parent',
      contactEmail: 'pat@example.test',
      contactPhone: '11987654321',
      status: 'active',
    }
    const table = mount(GuardianTable, {
      props: { rows: [guardian] },
      global: {
        plugins: administrationPlugins(),
        stubs: {
          AdminDataTable: {
            props: ['rows'],
            template: '<div><slot name="contactPhone" :row="rows[0]" /></div>',
          },
        },
      },
    })
    const detail = mount(GuardianDetailSections, {
      props: { record: guardian },
      global: { plugins: administrationPlugins() },
    })

    expect(table.text()).toContain('(11) 98765-4321')
    expect(detail.text()).toContain('(11) 98765-4321')
  })

  it('renders and emits only the approved Guardian list filters', async () => {
    const wrapper = mount(GuardianFilters, {
      props: {
        fullName: 'Maria',
        contactEmail: 'guardian@example',
        status: 'active',
      },
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.find('[data-test="guardian-filter-full-name"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="guardian-filter-contact-email"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="guardian-filter-status"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="school-filter-inep"]').exists()).toBe(false)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      {
        fullName: 'Maria',
        contactEmail: 'guardian@example',
        status: 'active',
      },
    ])

    await wrapper.find('[data-test="guardian-filter-reset"]').trigger('click')
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })

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
