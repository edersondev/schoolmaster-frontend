import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import AdminDetailPage from '@/components/ui/admin/AdminDetailPage.vue'
import { administrationPlugins } from '../../administration/administration.fixtures'

describe('AdminDetailPage', () => {
  it('renders detail frame, status, action slots, and return/edit controls', () => {
    const wrapper = mount(AdminDetailPage, {
      props: {
        title: 'Avery Admin',
        status: 'ready',
        recordStatus: 'active',
        returnTo: { name: 'usersList' },
        editTo: { name: 'userEdit' },
        canEdit: true,
      },
      slots: { default: '<div>Detail content</div>', actions: '<button>Lifecycle</button>' },
      global: {
        plugins: administrationPlugins(),
        stubs: { RouterLink: RouterLinkStub },
      },
    })
    expect(wrapper.text()).toContain('Avery Admin')
    expect(wrapper.text()).toContain('Active')
    expect(wrapper.text()).toContain('Detail content')
    expect(wrapper.text()).toContain('Lifecycle')
  })
})
