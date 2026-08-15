import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import AcademicYearsListPage from '@/pages/admin-system/academic-years/AcademicYearsListPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { administrationPlugins, schoolId } from '../administration.fixtures'

const mocks = vi.hoisted(() => ({
  listAcademicYears: vi.fn(),
  lifecycle: vi.fn(),
  bulkLifecycle: vi.fn(),
}))

vi.mock('@/services/admin-system/academic-years', () => ({
  listAcademicYears: (...args) => mocks.listAcademicYears(...args),
  activateAcademicYear: (...args) => mocks.lifecycle(...args),
  deactivateAcademicYear: (...args) => mocks.lifecycle(...args),
  deleteAcademicYear: (...args) => mocks.lifecycle(...args),
  restoreAcademicYear: (...args) => mocks.lifecycle(...args),
  bulkLifecycleAcademicYears: (...args) => mocks.bulkLifecycle(...args),
}))

async function mountAcademicYearsList(path) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/admin/academic-years',
        name: 'academicYearsList',
        component: AcademicYearsListPage,
      },
      {
        path: '/admin/academic-years/create',
        name: 'academicYearCreate',
        component: { template: '<div />' },
      },
      {
        path: '/admin/academic-years/:academicYearId',
        name: 'academicYearDetail',
        component: { template: '<div />' },
      },
      {
        path: '/admin/academic-years/:academicYearId/edit',
        name: 'academicYearEdit',
        component: { template: '<div />' },
      },
    ],
  })
  const plugins = administrationPlugins()
  const sessionStore = useAuthSessionStore()
  sessionStore.status = 'authenticated'
  sessionStore.activeSchool = { id: schoolId, name: 'Northfield Academy', status: 'active' }
  sessionStore.permissions = [{ code: 'academic_years.view', status: 'active' }]
  mocks.listAcademicYears.mockResolvedValue({
    items: [
      {
        id: '30000000-0000-4000-8000-000000000001',
        name: 'Primary 2026',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'active',
      },
    ],
    meta: { page: 1, perPage: 25, total: 1 },
  })

  router.push(path)
  await router.isReady()

  const wrapper = mount(AcademicYearsListPage, {
    global: { plugins: [...plugins, router] },
  })
  await flushPromises()
  return { router, wrapper }
}

describe('AcademicYearsListPage filters', () => {
  it('restores valid filters from the URL and retains them in filter props', async () => {
    const { wrapper } = await mountAcademicYearsList(
      '/admin/academic-years?page=3&per_page=50&name=Primary&date_from=2026-01-01&date_to=2026-12-31&status=closed',
    )

    expect(mocks.listAcademicYears).toHaveBeenCalledWith(
      {
        page: 3,
        perPage: 50,
        name: 'Primary',
        dateFrom: '2026-01-01',
        dateTo: '2026-12-31',
        status: 'closed',
      },
      { schoolId },
    )
    expect(wrapper.findComponent({ name: 'AcademicYearFilters' }).props()).toMatchObject({
      name: 'Primary',
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
      status: 'closed',
    })
  })

  it('submits combined filters on page one and retains them when paginating', async () => {
    const { router, wrapper } = await mountAcademicYearsList('/admin/academic-years?page=4')
    const filters = wrapper.findComponent({ name: 'AcademicYearFilters' })

    mocks.listAcademicYears.mockClear()
    await filters.vm.$emit('submit', {
      name: 'Primary',
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
      status: 'active',
    })
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({
      page: '1',
      per_page: '25',
      name: 'Primary',
      date_from: '2026-01-01',
      date_to: '2026-12-31',
      status: 'active',
    })

    await wrapper.findComponent({ name: 'AdminPagination' }).vm.$emit('update:page', 2)
    await flushPromises()

    expect(router.currentRoute.value.query).toMatchObject({
      page: '2',
      name: 'Primary',
      date_from: '2026-01-01',
      date_to: '2026-12-31',
      status: 'active',
    })
  })

  it('clears every academic-year filter and resets page', async () => {
    const { router, wrapper } = await mountAcademicYearsList(
      '/admin/academic-years?page=2&name=Primary&date_from=2026-01-01&date_to=2026-12-31&status=active',
    )

    await wrapper.findComponent({ name: 'AcademicYearFilters' }).vm.$emit('reset')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ page: '1', per_page: '25' })
    expect(wrapper.findComponent({ name: 'AcademicYearFilters' }).props()).toMatchObject({
      name: '',
      dateFrom: '',
      dateTo: '',
      status: '',
    })
  })
})
