import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SchoolAddressFields from '@/modules/schools/components/SchoolAddressFields.vue'
import { administrationPlugins } from '../admin-system/administration/administration.fixtures'

function createModel() {
  return {
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  }
}

describe('SchoolAddressFields', () => {
  it('masks ZIP code as #####-### while storing only digits', async () => {
    const model = createModel()
    const wrapper = mount(SchoolAddressFields, {
      props: { modelValue: model },
      global: { plugins: administrationPlugins() },
    })

    const input = wrapper.get('input[placeholder="00000-000"]')
    expect(input.attributes('maxlength')).toBe('9')

    await input.trigger('maska', {
      detail: {
        masked: '12220-060',
        unmasked: '12220060',
        completed: true,
      },
    })

    expect(model.address.zipCode).toBe('12220060')
  })

  it('stores only digits in the number field', async () => {
    const model = createModel()
    const wrapper = mount(SchoolAddressFields, {
      props: { modelValue: model },
      global: { plugins: administrationPlugins() },
    })

    const inputs = wrapper.findAll('input')
    await inputs[2].setValue('12A-3')

    expect(model.address.number).toBe('123')
  })
})
