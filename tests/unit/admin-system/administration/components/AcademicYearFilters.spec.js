import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AcademicYearFilters from '@/components/admin-system/academic-years/AcademicYearFilters.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('AcademicYearFilters', () => {
  it('shows only academic-year criteria and every lifecycle status', () => {
    const wrapper = mount(AcademicYearFilters, {
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.get('[data-test="academic-year-filter-name"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="academic-year-filter-date-range"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="academic-year-filter-status"]').exists()).toBe(true)
    expect(
      wrapper.findAllComponents({ name: 'ElOption' }).map((option) => option.props('value')),
    ).toEqual(['', 'planned', 'active', 'closed', 'inactive'])
    expect(wrapper.find('[data-test="school-filter-inep"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="school-filter-document"]').exists()).toBe(false)
  })

  it('keeps draft values local until explicit submit', async () => {
    const wrapper = mount(AcademicYearFilters, {
      global: { plugins: administrationPlugins() },
    })

    await wrapper
      .get('[data-test="academic-year-filter-name"]')
      .findComponent({ name: 'ElInput' })
      .vm.$emit('update:modelValue', ' Primary ')
    await wrapper
      .get('[data-test="academic-year-filter-date-range"]')
      .findComponent({ name: 'ElDatePicker' })
      .vm.$emit('update:modelValue', ['2026-01-01', '2026-12-31'])
    await wrapper
      .get('[data-test="academic-year-filter-status"]')
      .findComponent({ name: 'ElSelect' })
      .vm.$emit('update:modelValue', 'active')

    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          name: 'Primary',
          dateFrom: '2026-01-01',
          dateTo: '2026-12-31',
          status: 'active',
        },
      ],
    ])
  })

  it('emits reset from the reset action', async () => {
    const wrapper = mount(AcademicYearFilters, {
      global: { plugins: administrationPlugins() },
    })

    await wrapper.get('[data-test="academic-year-filter-reset"]').trigger('click')

    expect(wrapper.emitted('reset')).toHaveLength(1)
  })
})
