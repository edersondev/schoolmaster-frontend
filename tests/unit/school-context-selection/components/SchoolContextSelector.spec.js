import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { mapAuthSession } from '@/contracts/auth/authSession.contract'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import SchoolContextSelector from '@/components/auth/SchoolContextSelector.vue'
import { authGlobalPlugins } from '../../auth/auth.fixtures'
import { activeSchool, paginatedSchools } from '../fixtures/schoolContextSelection.fixtures'

const systemAdministratorRole = {
  name: 'System Administrator',
  scope: 'platform',
  status: 'active',
  permissions: [],
}

function mappedSchool() {
  return {
    ...activeSchool,
    status: 'active',
    inepCode: activeSchool.inep_code,
    city: activeSchool.address.city,
    state: activeSchool.address.state,
  }
}

describe('SchoolContextSelector', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('loads active schools and emits only after exact backend confirmation', async () => {
    const service = {
      listActiveSchools: vi.fn().mockResolvedValue(paginatedSchools([mappedSchool()])),
    }
    const sessionService = {
      getCurrentUser: vi.fn().mockResolvedValue(
        mapAuthSession({
          user: { id: 'user-1', status: 'active' },
          roles: [systemAdministratorRole],
          permissions: [],
          resolved_school: activeSchool,
        }),
      ),
    }
    const plugins = authGlobalPlugins()
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.currentUser = { id: 'user-1' }
    store.roles = [systemAdministratorRole]
    const wrapper = mount(SchoolContextSelector, {
      attachTo: document.body,
      props: { service, sessionService },
      global: { plugins },
    })
    await flushPromises()

    expect(service.listActiveSchools).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    expect(sessionService.getCurrentUser).not.toHaveBeenCalled()
    await wrapper.get('[data-test="refresh-schools"]').trigger('click')
    await flushPromises()
    expect(service.listActiveSchools).toHaveBeenCalledTimes(2)
    expect(sessionService.getCurrentUser).not.toHaveBeenCalled()
    await wrapper.get('button[aria-label^="Select Central School"]').trigger('click')
    await flushPromises()

    expect(sessionService.getCurrentUser).toHaveBeenCalledWith({ schoolId: activeSchool.id })
    expect(wrapper.emitted('confirmed')?.[0]?.[0]?.id).toBe(activeSchool.id)
  })

  it('blocks every non-exact role without requesting school data', async () => {
    const service = { listActiveSchools: vi.fn() }
    const plugins = authGlobalPlugins()
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.roles = [{ ...systemAdministratorRole, name: 'System Admin' }]
    const wrapper = mount(SchoolContextSelector, {
      props: { service },
      global: { plugins },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Only an active System Administrator')
    expect(service.listActiveSchools).not.toHaveBeenCalled()
  })

  it('renders loading, empty, filtered-empty, and pagination states distinctly', async () => {
    const service = {
      listActiveSchools: vi
        .fn()
        .mockResolvedValueOnce(paginatedSchools([mappedSchool()], { total: 100 }))
        .mockResolvedValue(paginatedSchools([], { total: 0 })),
    }
    const plugins = authGlobalPlugins()
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.roles = [systemAdministratorRole]
    const wrapper = mount(SchoolContextSelector, {
      props: { service },
      global: { plugins },
    })
    await flushPromises()

    expect(wrapper.find('.el-pagination').exists()).toBe(true)
    await wrapper.get('input').setValue('Missing')
    await wrapper.get('input').trigger('keyup.enter')
    await flushPromises()
    expect(wrapper.text()).toContain('No active schools match these filters')
    await wrapper.get('[data-test="clear-school-filters"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('No authorized schools are available')
  })

  it.each([
    ['validation', 'Review the filters'],
    ['unauthorized', 'Your session ended'],
    ['forbidden', 'Only an active System Administrator'],
    ['inactive-context', 'That school is inactive'],
    ['tenant-mismatch', 'could not confirm that exact school'],
    ['conflict', 'changed while you were selecting'],
    ['unavailable', 'temporarily unavailable'],
  ])('renders contract-safe %s discovery feedback with retry', async (type, message) => {
    const service = { listActiveSchools: vi.fn().mockRejectedValue({ type }) }
    const plugins = authGlobalPlugins()
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.roles = [systemAdministratorRole]
    const wrapper = mount(SchoolContextSelector, {
      props: { service },
      global: { plugins },
    })
    await flushPromises()

    expect(wrapper.text()).toContain(message)
    expect(wrapper.text()).toContain('Try again')
  })
})
