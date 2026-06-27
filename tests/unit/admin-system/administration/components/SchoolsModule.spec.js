import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SchoolFilters from '@/components/admin-system/schools/SchoolFilters.vue'
import SchoolForm from '@/components/admin-system/schools/SchoolForm.vue'
import SchoolTable from '@/components/admin-system/schools/SchoolTable.vue'
import AdminDataTable from '@/components/ui/admin/AdminDataTable.vue'
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
        modelValue: {
          name: '',
          code: '',
          contactEmail: '',
          contactPhone: '',
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
        },
      },
      global: { plugins: administrationPlugins() },
    })
    expect(form.text()).toContain('Name')
    expect(form.text()).toContain('Code')
    expect(form.text()).toContain('Street')
    expect(form.text()).toContain('ZIP code')
    expect(form.find('input[placeholder="(00) 00000-0000"]').exists()).toBe(true)
  })

  it('omits the address column from the school list', () => {
    const table = mount(SchoolTable, {
      props: {
        rows: [
          {
            name: 'Northfield Academy',
            code: 'NORTH',
            status: 'active',
            contactEmail: 'office@northfield.test',
            addressLabel: 'Main Street 123',
          },
        ],
      },
      global: { plugins: administrationPlugins() },
    })

    const columns = table.getComponent(AdminDataTable).props('columns')

    expect(columns.map((column) => column.prop)).toEqual([
      'name',
      'code',
      'status',
      'contactEmail',
    ])
    expect(columns.map((column) => column.prop)).not.toContain('addressLabel')
  })
})
