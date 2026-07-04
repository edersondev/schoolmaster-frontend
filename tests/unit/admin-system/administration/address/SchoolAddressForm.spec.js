import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SchoolForm from '@/components/admin-system/schools/SchoolForm.vue'
import { createSchoolForm } from '@/contracts/admin-system/schools'
import { administrationPlugins } from '../administration.fixtures'

describe('school address form', () => {
  it('renders structured address fields and field-level validation messages', () => {
    const wrapper = mount(SchoolForm, {
      props: {
        modelValue: createSchoolForm(),
        errors: {
          'address.street': ['Street is required.'],
          'address.number': ['Use numbers only.'],
          'address.zip_code': ['Use numbers only.'],
        },
      },
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.text()).toContain('Street')
    expect(wrapper.text()).toContain('Number')
    expect(wrapper.text()).toContain('ZIP code')
    const errorProps = wrapper
      .findAllComponents({ name: 'ElFormItem' })
      .map((component) => component.props('error'))

    expect(errorProps).toContain('Street is required.')
    expect(errorProps).toContain('Use numbers only.')
    expect(wrapper.text()).not.toContain('addressSummary')
  })

  it('supports explicit remove-address intent', async () => {
    const model = createSchoolForm()
    const wrapper = mount(SchoolForm, {
      props: {
        modelValue: model,
        allowRemoveAddress: true,
        showStatus: true,
        readonlyCnpj: true,
      },
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.text()).toContain('Remove current address')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.get('input[readonly]').exists()).toBe(true)

    expect(model.removeAddress).toBe(false)
  })
})
