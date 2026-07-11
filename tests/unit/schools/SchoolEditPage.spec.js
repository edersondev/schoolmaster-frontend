import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import SchoolEditPage from '@/modules/schools/routes/SchoolEditPage.vue'
import { administrationPlugins } from '../admin-system/administration/administration.fixtures'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  lifecycle: vi.fn(),
  getSchool: vi.fn(),
  lookups: {
    listAdministrativeTypes: vi.fn(),
    listLegalNatures: vi.fn(),
    listManagementTypes: vi.fn(),
    listPedagogicalApproaches: vi.fn(),
    listEducationLevels: vi.fn(),
    listModalities: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { schoolId: 'school-id' } }),
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@/composables/admin-system/useUnsavedChangesGuard', () => ({
  useUnsavedChangesGuard: vi.fn(),
}))

vi.mock('@/modules/schools/services/schoolService', () => ({
  schoolModuleService: {
    getSchool: (...args) => mocks.getSchool(...args),
    listAdministrativeTypes: (...args) => mocks.lookups.listAdministrativeTypes(...args),
    listLegalNatures: (...args) => mocks.lookups.listLegalNatures(...args),
    listManagementTypes: (...args) => mocks.lookups.listManagementTypes(...args),
    listPedagogicalApproaches: (...args) => mocks.lookups.listPedagogicalApproaches(...args),
    listEducationLevels: (...args) => mocks.lookups.listEducationLevels(...args),
    listModalities: (...args) => mocks.lookups.listModalities(...args),
  },
}))

vi.mock('@/services/admin-system/schools', () => ({
  activateSchool: (...args) => mocks.lifecycle(...args),
  deactivateSchool: (...args) => mocks.lifecycle(...args),
}))

describe('SchoolEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getSchool.mockRejectedValue(new Error('offline'))
    Object.values(mocks.lookups).forEach((loader) => loader.mockResolvedValue([]))
  })

  it('keeps failed school loads in a blocking feedback state', async () => {
    const wrapper = shallowMount(SchoolEditPage, {
      global: {
        plugins: administrationPlugins(),
        stubs: {
          AdminFeedbackState: {
            props: ['state', 'feedback'],
            template: '<div data-test="feedback">{{ state }}</div>',
          },
          AdminFormPage: {
            template: '<form data-test="form"><slot /></form>',
          },
          SchoolProfileForm: {
            template: '<div data-test="school-profile-form" />',
          },
        },
      },
    })

    await flushAsync()

    expect(wrapper.find('[data-test="feedback"]').text()).toBe('unknown')
    expect(wrapper.find('[data-test="form"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="school-profile-form"]').exists()).toBe(false)
  })

  it('opens lifecycle dialog when the module status field changes', async () => {
    mocks.getSchool.mockResolvedValue({
      id: 'school-id',
      inep_code: '12345678',
      status: 1,
      name: 'North School',
      document: '56563930000108',
      email: 'north@example.com',
      address: {
        street: 'Main Street',
        number: '123',
        neighborhood: 'Central',
        city: 'Sao Paulo',
        state: 'SP',
        zip_code: '12345678',
        country: 'Brazil',
      },
    })
    mocks.lifecycle.mockResolvedValue({ id: 'school-id', status: 0 })

    const wrapper = shallowMount(SchoolEditPage, {
      global: {
        plugins: administrationPlugins(),
        stubs: {
          AdminFormPage: {
            template: '<form data-test="form"><slot /></form>',
          },
          AdminLifecycleDialog: {
            name: 'AdminLifecycleDialog',
            props: ['open', 'action', 'resourceLabel', 'values'],
            emits: ['submit'],
            template: '<div data-test="lifecycle-dialog" />',
          },
          SchoolProfileForm: {
            emits: ['status-change'],
            template: '<button data-test="status-change" @click="$emit(\'status-change\', 0)" />',
          },
        },
      },
    })

    await flushAsync()
    await wrapper.get('[data-test="status-change"]').trigger('click')
    await flushPromises()

    const dialog = wrapper.findComponent({ name: 'AdminLifecycleDialog' })
    expect(dialog.props('open')).toBe(true)
    expect(dialog.props('action')).toBe('deactivate')
    expect(dialog.props('resourceLabel')).toBe('North School')

    dialog.props('values').reason = 'Audit'
    dialog.vm.$emit('submit')
    await flushPromises()

    expect(mocks.lifecycle).toHaveBeenCalledWith(
      'school-id',
      expect.objectContaining({
        effectiveAt: expect.any(String),
        reason: 'Audit',
      }),
    )
  })
})

async function flushAsync() {
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}
