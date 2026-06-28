import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AdminShellHeader from '@/components/admin-system/shell/AdminShellHeader.vue'
import { adminGlobalPlugins } from './shell.fixtures'

function mountHeader() {
  return mount(AdminShellHeader, {
    attachTo: document.body,
    props: {
      pageContext: {
        title: 'Dashboard',
        breadcrumb: [{ label: 'Dashboard' }],
      },
      isMobile: false,
      isSidebarCollapsed: false,
      notificationPanelOpen: false,
    },
    global: {
      plugins: adminGlobalPlugins(),
    },
  })
}

describe('AdminShellHeader', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('emits an account command when the logout action is selected', async () => {
    const wrapper = mountHeader()

    await wrapper.find('.admin-header__account').trigger('click')
    await flushPromises()

    const logoutAction = document.body.querySelector('.el-dropdown-menu__item')
    expect(logoutAction?.textContent).toContain('Log out')

    logoutAction?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()

    expect(wrapper.emitted('account-command')).toEqual([['logout']])

    wrapper.unmount()
  })
})
