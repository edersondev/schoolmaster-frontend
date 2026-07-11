import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import SchoolsListPage from '@/pages/admin-system/schools/SchoolsListPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { administrationPlugins, paginatedEnvelope } from '../administration.fixtures'

const mocks = vi.hoisted(() => ({
  listSchools: vi.fn(),
  lifecycle: vi.fn(),
  listSchoolFilterLookups: vi.fn(),
}))

vi.mock('@/services/admin-system/schools', () => ({
  listSchools: (...args) => mocks.listSchools(...args),
  activateSchool: (...args) => mocks.lifecycle(...args),
  deactivateSchool: (...args) => mocks.lifecycle(...args),
  deleteSchool: (...args) => mocks.lifecycle(...args),
  restoreSchool: (...args) => mocks.lifecycle(...args),
}))

vi.mock('@/modules/schools/services/schoolService', () => ({
  schoolModuleService: {
    listSchoolFilterLookups: (...args) => mocks.listSchoolFilterLookups(...args),
  },
}))

async function mountSchoolsList(path) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/schools', name: 'schoolsList', component: SchoolsListPage },
      { path: '/admin/schools/create', name: 'schoolCreate', component: { template: '<div />' } },
      {
        path: '/admin/schools/:schoolId',
        name: 'schoolDetail',
        component: { template: '<div />' },
      },
      {
        path: '/admin/schools/:schoolId/edit',
        name: 'schoolEdit',
        component: { template: '<div />' },
      },
    ],
  })

  router.push(path)
  await router.isReady()

  const wrapper = mount(SchoolsListPage, {
    global: { plugins: [...administrationPlugins(), router] },
  })
  const sessionStore = useAuthSessionStore()
  sessionStore.permissions = [{ code: 'schools.view', status: 'active' }]
  await flushPromises()
  return { router, wrapper }
}

describe('SchoolsListPage filters', () => {
  it('shows loading feedback while school filter lookups are still loading', async () => {
    mocks.listSchools.mockResolvedValue(paginatedEnvelope)
    mocks.listSchoolFilterLookups.mockReturnValue(new Promise(() => {}))

    const { wrapper } = await mountSchoolsList('/admin/schools')

    expect(mocks.listSchools).not.toHaveBeenCalled()
    expect(wrapper.findComponent({ name: 'AdminFeedbackState' }).props('state')).toBe('loading')
    expect(wrapper.text()).not.toContain('Administration request failed.')
  })

  it('initializes from shared URLs and omits unavailable hidden lookup filters from requests', async () => {
    mocks.listSchools.mockResolvedValue(paginatedEnvelope)
    mocks.listSchoolFilterLookups.mockResolvedValue({
      administrativeTypes: [{ id: 1, label: 'Public' }],
      legalNatures: [],
      managementTypes: [],
      pedagogicalApproaches: [],
    })

    const { wrapper } = await mountSchoolsList(
      '/admin/schools?page=3&sort=-name&status=1&name=North&administrative_type_id=999',
    )

    expect(mocks.listSchools).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3, sort: '-name', status: '1', name: 'North' }),
      expect.any(Object),
    )
    expect(mocks.listSchools.mock.calls[0][0]).not.toHaveProperty('administrativeTypeId')
    expect(wrapper.get('[data-test="school-filter-warning"]').text()).toContain(
      'Administrative type',
    )
  })

  it('waits for filter submit before resetting page and preserving sort', async () => {
    mocks.listSchools.mockResolvedValue(paginatedEnvelope)
    mocks.listSchoolFilterLookups.mockResolvedValue({
      administrativeTypes: [],
      legalNatures: [],
      managementTypes: [],
      pedagogicalApproaches: [],
    })

    const { router, wrapper } = await mountSchoolsList('/admin/schools?page=4&sort=-name')

    mocks.listSchools.mockClear()
    await wrapper.findComponent({ name: 'SchoolFilters' }).vm.$emit('update:name', 'North')
    await flushPromises()

    expect(mocks.listSchools).not.toHaveBeenCalled()
    expect(router.currentRoute.value.query).toMatchObject({
      page: '4',
      sort: '-name',
    })

    await wrapper.findComponent({ name: 'SchoolFilters' }).vm.$emit('submit', { name: 'North' })
    await flushPromises()

    expect(router.currentRoute.value.query).toMatchObject({
      page: '1',
      per_page: '25',
      sort: '-name',
      name: 'North',
    })
  })

  it('clears aliased INEP query parameters when filters reset', async () => {
    mocks.listSchools.mockResolvedValue(paginatedEnvelope)
    mocks.listSchoolFilterLookups.mockResolvedValue({
      administrativeTypes: [],
      legalNatures: [],
      managementTypes: [],
      pedagogicalApproaches: [],
    })

    const { router, wrapper } = await mountSchoolsList('/admin/schools?page=2&inep_code=35000001')

    await wrapper.findComponent({ name: 'SchoolFilters' }).vm.$emit('reset')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({
      page: '1',
      per_page: '25',
    })
    expect(wrapper.findComponent({ name: 'SchoolFilters' }).props('inepCode')).toBe('')
  })
})
