import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AddressField from '@/components/ui/AddressField.vue'
import { createAddressForm } from '@/contracts/admin-system/schools'
import { administrationPlugins } from '../administration.fixtures'

describe('AddressField', () => {
  it('renders address fields with ZIP code before street and field-level errors', () => {
    const wrapper = mount(AddressField, {
      props: {
        modelValue: createAddressForm(),
        errors: {
          'address.zip_code': ['Use numbers only.'],
          'address.street': ['Street is required.'],
        },
      },
      global: { plugins: administrationPlugins() },
    })

    const fieldLabels = wrapper
      .findAllComponents({ name: 'ElFormItem' })
      .map((component) => component.props('label'))
    const fieldErrors = wrapper
      .findAllComponents({ name: 'ElFormItem' })
      .map((component) => component.props('error'))
    const requiredLabels = wrapper
      .findAllComponents({ name: 'ElFormItem' })
      .filter((component) => component.props('required') === true)
      .map((component) => component.props('label'))

    expect(fieldLabels.slice(0, 2)).toEqual(['ZIP code', 'Street'])
    expect(requiredLabels).toEqual([
      'ZIP code',
      'Street',
      'Number',
      'Neighborhood',
      'City',
      'State',
      'Country',
    ])
    expect(fieldErrors).toContain('Use numbers only.')
    expect(fieldErrors).toContain('Street is required.')
  })

  it('supports explicit remove-address intent', () => {
    const wrapper = mount(AddressField, {
      props: {
        modelValue: createAddressForm(),
        removeAddress: true,
        allowRemoveAddress: true,
      },
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.text()).toContain('Remove current address')
    expect(wrapper.findAllComponents({ name: 'ElFormItem' })).toHaveLength(0)
  })

  it('masks ZIP code as #####-### while storing only digits', async () => {
    const model = createAddressForm()
    const wrapper = mount(AddressField, {
      props: {
        modelValue: model,
      },
      global: { plugins: administrationPlugins() },
    })

    const input = wrapper.get('input[placeholder="00000-000"]')

    await input.trigger('maska', {
      detail: {
        masked: '12345-678',
        unmasked: '12345678',
        completed: true,
      },
    })

    expect(model.zipCode).toBe('12345678')
  })

  it('stores only digits in the number field', async () => {
    const model = createAddressForm()
    const wrapper = mount(AddressField, {
      props: {
        modelValue: model,
      },
      global: { plugins: administrationPlugins() },
    })

    const inputs = wrapper.findAll('input')
    await inputs[2].setValue('12A-3')

    expect(model.number).toBe('123')
  })
})
