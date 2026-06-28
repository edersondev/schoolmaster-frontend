import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UserDeleteDialog from '@/components/admin-system/users/UserDeleteDialog.vue'
import { createUserDeleteForm } from '@/contracts/admin-system/users'
import { administrationPlugins } from '../administration.fixtures'

describe('UserDeleteDialog', () => {
  it('renders contract-aligned lifecycle fields and actions', async () => {
    const wrapper = mount(UserDeleteDialog, {
      attachTo: document.body,
      props: {
        open: true,
        values: createUserDeleteForm(new Date(2026, 5, 27)),
        userName: 'Ada Lovelace',
      },
      global: { plugins: administrationPlugins(), stubs: { teleport: true } },
    })

    await flushPromises()

    expect(document.body.textContent).toContain('Delete user')
    expect(document.body.textContent).toContain('Ada Lovelace')
    expect(document.body.textContent).toContain('Effective date')
    expect(document.body.textContent).toContain('Reason')
    expect(document.body.textContent).toContain('Delete')

    wrapper.unmount()
  })
})
