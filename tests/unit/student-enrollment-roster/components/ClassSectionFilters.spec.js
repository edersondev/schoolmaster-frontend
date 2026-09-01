import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import ClassSectionFilters from '@/components/admin-system/class-sections/ClassSectionFilters.vue'
import { studentEnrollmentRosterI18n } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('ClassSectionFilters', () => {
  it('uses the shared administration filter structure for approved filters', async () => {
    const wrapper = mount(ClassSectionFilters, {
      global: { plugins: [studentEnrollmentRosterI18n(), ElementPlus] },
      props: {
        academicPeriodId: 'period-1',
        periods: [{ academicPeriodId: 'period-1', label: 'Term 1' }],
        status: 'active',
      },
    })

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.text()).toContain('Academic period')
    expect(wrapper.find('[data-test="class-section-filter-academic-period"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="class-section-filter-status"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="class-section-filter-reset"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="class-section-filter-submit"]').exists()).toBe(true)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      { academicPeriodId: 'period-1', status: 'active' },
    ])

    await wrapper.find('[data-test="class-section-filter-reset"]').trigger('click')
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })
})
