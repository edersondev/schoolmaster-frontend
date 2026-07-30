import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SchoolSelectionSearch from '@/components/auth/SchoolSelectionSearch.vue'
import { authGlobalPlugins } from '@/../tests/unit/auth/auth.fixtures'

describe('SchoolSelectionSearch', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('submits labeled name and INEP filters from the keyboard', async () => {
    const wrapper = mount(SchoolSelectionSearch, {
      attachTo: document.body,
      global: { plugins: authGlobalPlugins() },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Central')
    await inputs[1].setValue('12345678')
    await inputs[1].trigger('keyup.enter')

    expect(wrapper.text()).toContain('School name')
    expect(wrapper.text()).toContain('INEP code')
    expect(wrapper.emitted('search')?.at(-1)).toEqual([{ name: 'Central', inepCode: '12345678' }])
  })

  it('clears both filters explicitly', async () => {
    const wrapper = mount(SchoolSelectionSearch, {
      props: { initialFilters: { name: 'Central', inepCode: '12345678' } },
      global: { plugins: authGlobalPlugins() },
    })

    await wrapper.get('[data-test="clear-school-filters"]').trigger('click')

    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.findAll('input').every((input) => input.element.value === '')).toBe(true)
  })
})
