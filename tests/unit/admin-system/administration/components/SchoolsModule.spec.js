import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SchoolFilters from '@/components/admin-system/schools/SchoolFilters.vue'
import SchoolForm from '@/components/admin-system/schools/SchoolForm.vue'
import SchoolTable from '@/components/admin-system/schools/SchoolTable.vue'
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
          cnpj: '',
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
    expect(form.text()).toContain('CNPJ')
    expect(form.text()).toContain('Street')
    expect(form.text()).toContain('ZIP code')
    expect(form.find('input[placeholder="00.000.000/0000-00"]').exists()).toBe(true)
    expect(form.find('input[placeholder="(00) 00000-0000"]').exists()).toBe(true)
  })

  it('omits the address column from the school list markup', () => {
    const table = mount(SchoolTable, {
      props: {
        canManage: true,
        rows: [
          {
            id: 'school-1',
            name: 'Northfield Academy',
            cnpj: '56563930000108',
            status: 'active',
            contactEmail: 'office@northfield.test',
            addressLabel: 'Main Street 123',
          },
        ],
      },
      global: { plugins: administrationPlugins() },
    })

    expect(table.html()).not.toContain('Main Street 123')
  })
})
