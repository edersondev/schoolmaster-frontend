import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SchoolFilters from '@/components/admin-system/schools/SchoolFilters.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('SchoolFilters institutional controls', () => {
  it('wraps the filter form in a search collapse header with an icon', () => {
    const wrapper = mount(SchoolFilters, {
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.findComponent({ name: 'ElCollapse' }).props('modelValue')).toEqual([])
    expect(wrapper.findComponent({ name: 'ElCollapseItem' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ElIcon' }).exists()).toBe(true)
    expect(wrapper.text()).toContain('Search')
  })

  it('renders lookup-backed controls and submits draft filters on demand', async () => {
    const wrapper = mount(SchoolFilters, {
      props: {
        lookupStatus: 'ready',
        lookupOptions: {
          administrativeTypes: [{ id: 1, label: 'Public' }],
          legalNatures: [{ id: 2, label: 'Association' }],
          managementTypes: [{ id: 3, label: 'Private management' }],
          pedagogicalApproaches: [{ id: 4, label: 'Constructivist' }],
        },
      },
      global: { plugins: administrationPlugins() },
    })

    expect(
      wrapper.findAllComponents({ name: 'ElOption' }).map((option) => option.props('label')),
    ).toEqual(expect.arrayContaining(['Public', 'Constructivist']))

    await wrapper.findComponent({ name: 'ElSelect' }).vm.$emit('update:modelValue', '1')

    const selects = wrapper.findAllComponents({ name: 'ElSelect' })
    await selects[1].vm.$emit('update:modelValue', '1')
    await selects[2].vm.$emit('update:modelValue', '2')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [
        expect.objectContaining({
          status: '1',
          administrativeTypeId: '1',
          legalNatureId: '2',
        }),
      ],
    ])
  })

  it('constrains identity and location filter inputs before submit', async () => {
    const wrapper = mount(SchoolFilters, {
      props: {
        inepCode: '12abc3456789',
        document: '56.563.930/0001-08',
        state: 'SP-123RJ',
      },
      global: { plugins: administrationPlugins() },
    })
    const inputs = wrapper.findAllComponents({ name: 'ElInput' })
    const inepInput = wrapper.get('[data-test="school-filter-inep"]')
    const nameInput = wrapper.get('[data-test="school-filter-name"]')
    const emailInput = wrapper.get('[data-test="school-filter-email"]')
    const cityInput = wrapper.get('[data-test="school-filter-city"]')
    const stateInput = wrapper.get('[data-test="school-filter-state"]')

    expect(inepInput.attributes('inputmode')).toBe('numeric')
    expect(inepInput.attributes('maxlength')).toBe('8')
    expect(nameInput.attributes('maxlength')).toBe('255')
    expect(emailInput.attributes('type')).toBe('email')
    expect(emailInput.attributes('maxlength')).toBe('100')
    expect(cityInput.attributes('maxlength')).toBe('255')
    expect(stateInput.attributes('maxlength')).toBe('4')

    await inputs[0].vm.$emit('update:modelValue', 'ab123456789')
    await inputs[5].vm.$emit('update:modelValue', 'R1J2SP')
    await wrapper
      .findComponent({ name: 'CnpjField' })
      .vm.$emit('update:modelValue', '56.563.930/0001-08')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [
        expect.objectContaining({
          inepCode: '12345678',
          document: '56563930000108',
          state: 'RJSP',
        }),
      ],
    ])
  })

  it('keeps reset before search in the right-aligned action group', () => {
    const wrapper = mount(SchoolFilters, {
      global: { plugins: administrationPlugins() },
    })
    const actionGroup = wrapper.get('[data-test="school-filter-reset"]').element.parentElement

    expect(actionGroup.className).toContain('ml-auto')
    expect(actionGroup.className).toContain('justify-end')
    expect(
      [...actionGroup.querySelectorAll('button')].map((button) => button.textContent.trim()),
    ).toEqual(['Reset filters', 'Search'])
  })

  it('keeps institutional controls disabled when lookup options are unavailable', () => {
    const wrapper = mount(SchoolFilters, {
      props: { lookupStatus: 'unavailable' },
      global: { plugins: administrationPlugins() },
    })

    const institutionalSelect = wrapper.findAllComponents({ name: 'ElSelect' })[1]
    expect(institutionalSelect.props('disabled')).toBe(true)
  })
})
