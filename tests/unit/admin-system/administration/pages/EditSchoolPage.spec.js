import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import EditSchoolPage from '@/pages/admin-system/schools/EditSchoolPage.vue'
import { administrationPlugins, recordId } from '../administration.fixtures'

const getSchool = vi.fn()
const updateSchool = vi.fn()

vi.mock('@/services/admin-system/schools', () => ({
  getSchool: (...args) => getSchool(...args),
  updateSchool: (...args) => updateSchool(...args),
}))

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/schools', name: 'schoolsList', component: { template: '<div>Schools</div>' } },
      {
        path: '/admin/schools/:schoolId/edit',
        name: 'schoolEdit',
        component: EditSchoolPage,
      },
    ],
  })

  router.push(`/admin/schools/${recordId}/edit?status=active`)
  await router.isReady()

  const wrapper = mount(EditSchoolPage, {
    global: {
      plugins: [...administrationPlugins(), router],
    },
  })

  await flushPromises()

  return { wrapper, router }
}

describe('EditSchoolPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads the school, updates approved fields, and returns to the list', async () => {
    getSchool.mockResolvedValue({
      id: recordId,
      name: 'Northfield Academy',
      cnpj: '56563930000108',
      status: 'active',
      contactEmail: 'office@northfield.test',
      contactPhone: '11999999999',
      address: {
        street: 'Main Street',
        number: '123',
        complement: '',
        neighborhood: 'Central',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '12345678',
        country: 'BR',
      },
    })
    updateSchool.mockResolvedValue({ id: recordId })

    const { wrapper, router } = await mountPage()

    expect(getSchool).toHaveBeenCalledWith(
      recordId,
      expect.objectContaining({ schoolId: undefined, signal: expect.any(AbortSignal) }),
    )
    expect(wrapper.text()).toContain('Edit school')
    expect(wrapper.text()).toContain('CNPJ')
    expect(wrapper.text()).toContain('Address')
    expect(wrapper.get('input[placeholder="00.000.000/0000-00"]').attributes('readonly')).toBeDefined()

    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(updateSchool).toHaveBeenCalledWith(recordId, expect.any(Object))
    expect(router.currentRoute.value.name).toBe('schoolsList')
    expect(router.currentRoute.value.query).toEqual({ status: 'active' })
  })
})
