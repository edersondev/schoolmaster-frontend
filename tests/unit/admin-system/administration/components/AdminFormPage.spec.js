import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('AdminFormPage', () => {
  it('renders accessible validation summary and pending actions', () => {
    const wrapper = mount(AdminFormPage, {
      props: {
        title: 'Create school',
        fieldErrors: { name: ['Name is required.'] },
        pending: true,
      },
      global: { plugins: administrationPlugins() },
    })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Name is required.')
  })
})
