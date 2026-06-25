import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SchoolFilters from '@/components/admin-system/schools/SchoolFilters.vue'
import SchoolForm from '@/components/admin-system/schools/SchoolForm.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('schools module', () => {
  it('shows status controls, no sort UI, and contract fields', () => {
    const filters = mount(SchoolFilters, {
      global: { plugins: administrationPlugins() },
    })
    expect(filters.text()).toContain('Status')
    expect(filters.text()).not.toContain('Sort')
    const form = mount(SchoolForm, {
      props: {
        modelValue: { name: '', code: '', contactEmail: '', contactPhone: '', addressSummary: '' },
      },
      global: { plugins: administrationPlugins() },
    })
    expect(form.text()).toContain('Name')
    expect(form.text()).toContain('Code')
  })
})
