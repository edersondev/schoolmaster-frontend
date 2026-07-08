import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
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
    const lookupAddress = vi.fn()
    const wrapper = mount(SchoolAddressFields, {
      props: { modelValue: model, lookupAddress },
      global: { plugins: administrationPlugins() },
    })

    const input = wrapper.get('input[placeholder="00000-000"]')
    expect(input.attributes('maxlength')).toBe('9')

    await input.trigger('maska', {
      detail: {
        masked: '12220-060',
        unmasked: '12220060',
        completed: false,
      },
    })

    expect(model.address.zipCode).toBe('12220060')
    expect(lookupAddress).not.toHaveBeenCalled()
  })

  it('limits complement input to 255 characters', () => {
    const wrapper = mount(SchoolAddressFields, {
      props: { modelValue: createModel(), lookupAddress: vi.fn() },
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.get('input[autocomplete="address-line2"]').attributes('maxlength')).toBe('255')
  })

  it('looks up and fills readonly address fields when ZIP mask is complete', async () => {
    const model = createModel()
    const lookupAddress = vi.fn().mockResolvedValue({
      street: 'Praça da Sé',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brazil',
    })
    const wrapper = mount(SchoolAddressFields, {
      props: { modelValue: model, lookupAddress },
      global: { plugins: administrationPlugins() },
    })

    await wrapper.get('input[placeholder="00000-000"]').trigger('maska', {
      detail: {
        masked: '01001-000',
        unmasked: '01001000',
        completed: true,
      },
    })
    await flushPromises()

    expect(lookupAddress).toHaveBeenCalledWith('01001000')
    expect(model.address).toMatchObject({
      zipCode: '01001000',
      street: 'Praça da Sé',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brazil',
    })
  })

  it('does not repeat lookup for the same completed ZIP code', async () => {
    const model = createModel()
    const lookupAddress = vi.fn().mockResolvedValue({
      street: 'Praça da Sé',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brazil',
    })
    const wrapper = mount(SchoolAddressFields, {
      props: { modelValue: model, lookupAddress },
      global: { plugins: administrationPlugins() },
    })
    const input = wrapper.get('input[placeholder="00000-000"]')
    const event = {
      detail: {
        masked: '01001-000',
        unmasked: '01001000',
        completed: true,
      },
    }

    await input.trigger('maska', event)
    await input.trigger('maska', event)
    await flushPromises()

    expect(lookupAddress).toHaveBeenCalledTimes(1)
  })

  it('ignores stale ZIP lookup responses', async () => {
    const model = createModel()
    let resolveFirst
    let resolveSecond
    const first = new Promise((resolve) => {
      resolveFirst = resolve
    })
    const second = new Promise((resolve) => {
      resolveSecond = resolve
    })
    const lookupAddress = vi.fn()
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second)
    const wrapper = mount(SchoolAddressFields, {
      props: { modelValue: model, lookupAddress },
      global: { plugins: administrationPlugins() },
    })
    const input = wrapper.get('input[placeholder="00000-000"]')

    await input.trigger('maska', {
      detail: {
        masked: '01001-000',
        unmasked: '01001000',
        completed: true,
      },
    })
    await input.trigger('maska', {
      detail: {
        masked: '12220-060',
        unmasked: '12220060',
        completed: true,
      },
    })

    resolveSecond({
      street: 'Second Street',
      neighborhood: 'Second Neighborhood',
      city: 'Second City',
      state: 'SS',
      country: 'Brazil',
    })
    await flushPromises()

    resolveFirst({
      street: 'First Street',
      neighborhood: 'First Neighborhood',
      city: 'First City',
      state: 'FS',
      country: 'Brazil',
    })
    await flushPromises()

    expect(model.address).toMatchObject({
      zipCode: '12220060',
      street: 'Second Street',
      neighborhood: 'Second Neighborhood',
      city: 'Second City',
      state: 'SS',
    })
  })

  it('keeps lookup-owned address fields readonly while number and complement stay editable', () => {
    const model = createModel()
    const wrapper = mount(SchoolAddressFields, {
      props: { modelValue: model, lookupAddress: vi.fn() },
      global: { plugins: administrationPlugins() },
    })

    const inputs = wrapper.findAll('input')

    expect(inputs[1].attributes('readonly')).toBeDefined()
    expect(inputs[2].attributes('readonly')).toBeUndefined()
    expect(inputs[3].attributes('readonly')).toBeUndefined()
    expect(inputs[4].attributes('readonly')).toBeDefined()
    expect(inputs[5].attributes('readonly')).toBeDefined()
    expect(inputs[6].attributes('readonly')).toBeDefined()
    expect(inputs[7].attributes('readonly')).toBeDefined()
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
