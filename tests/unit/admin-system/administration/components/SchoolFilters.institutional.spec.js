import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SchoolFilters from '@/components/admin-system/schools/SchoolFilters.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('SchoolFilters institutional controls', () => {
  it('renders lookup-backed single-value controls and emits documented filter updates', async () => {
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

    expect(wrapper.findAllComponents({ name: 'ElOption' }).map((option) => option.props('label'))).toEqual(
      expect.arrayContaining(['Public', 'Constructivist']),
    )

    await wrapper.findComponent({ name: 'ElSelect' }).vm.$emit('update:modelValue', '1')
    expect(wrapper.emitted('update:status')).toEqual([['1']])

    const selects = wrapper.findAllComponents({ name: 'ElSelect' })
    await selects[1].vm.$emit('update:modelValue', '1')
    await selects[2].vm.$emit('update:modelValue', '2')
    expect(wrapper.emitted('update:administrativeTypeId')).toEqual([['1']])
    expect(wrapper.emitted('update:legalNatureId')).toEqual([['2']])
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
