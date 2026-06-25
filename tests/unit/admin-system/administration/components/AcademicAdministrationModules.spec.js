import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AcademicPeriodForm from '@/components/admin-system/academic-periods/AcademicPeriodForm.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('academic administration components', () => {
  it('renders parent year, sequence, and date fields', () => {
    const wrapper = mount(AcademicPeriodForm, {
      props: {
        modelValue: { academicYearId: '', name: '', sequence: 1, startDate: '', endDate: '' },
        years: [{ id: 'year', name: '2026' }],
        lookupMeta: { page: 2, perPage: 1, total: 3 },
      },
      global: { plugins: administrationPlugins() },
    })
    expect(wrapper.text()).toContain('Academic year')
    expect(wrapper.text()).toContain('Sequence')
    expect(wrapper.text()).toContain('Start date')
    expect(wrapper.text()).toContain('Page 2 of 3')
  })
})
