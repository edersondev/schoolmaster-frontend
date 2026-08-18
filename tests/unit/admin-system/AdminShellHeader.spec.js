import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AdminShellHeader from '@/components/admin-system/shell/AdminShellHeader.vue'
import { adminGlobalPlugins } from './shell.fixtures'

function mountHeader(props = {}) {
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
      accountName: 'Avery Stone',
      ...props,
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

  it('shows the current user name instead of a role label', () => {
    const wrapper = mountHeader()
    const account = wrapper.get('.admin-header__account')

    expect(account.text()).toContain('Avery Stone')
    expect(account.text()).not.toContain('System Administrator')
    expect(account.attributes('aria-label')).toBe('Account menu for Avery Stone')

    wrapper.unmount()
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

  it('shows exact current school and remains read-only unless switching is enabled', async () => {
    const wrapper = mountHeader()
    await wrapper.setProps({ currentSchool: { id: 'school-1', name: 'Central School' } })

    expect(wrapper.text()).toContain('Central School')
    expect(wrapper.text()).not.toContain('Choose school')
    expect(wrapper.emitted('choose-school')).toBeUndefined()

    await wrapper.setProps({ canSwitchSchool: true })
    await wrapper.get('.el-button--primary').trigger('click')
    expect(wrapper.emitted('choose-school')).toHaveLength(1)
  })
})
