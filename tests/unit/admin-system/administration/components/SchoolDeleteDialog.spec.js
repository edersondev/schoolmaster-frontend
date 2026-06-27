import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SchoolDeleteDialog from '@/components/admin-system/schools/SchoolDeleteDialog.vue'
import { createSchoolDeleteForm } from '@/contracts/admin-system/schools'
import { administrationPlugins } from '../administration.fixtures'

describe('SchoolDeleteDialog', () => {
  it('renders contract-aligned lifecycle fields and actions', async () => {
    const wrapper = mount(SchoolDeleteDialog, {
      attachTo: document.body,
      props: {
        open: true,
        values: createSchoolDeleteForm(new Date(2026, 5, 27)),
        schoolName: 'Northfield Academy',
      },
      global: { plugins: administrationPlugins(), stubs: { teleport: true } },
    })

    await flushPromises()

    expect(document.body.textContent).toContain('Delete school')
    expect(document.body.textContent).toContain('Northfield Academy')
    expect(document.body.textContent).toContain('Effective date')
    expect(document.body.textContent).toContain('Reason')
    expect(document.body.textContent).toContain('Delete')

    wrapper.unmount()
  })
})
