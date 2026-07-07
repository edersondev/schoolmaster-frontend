import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import SchoolEditPage from '@/modules/schools/routes/SchoolEditPage.vue'
import { administrationPlugins } from '../admin-system/administration/administration.fixtures'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { schoolId: 'school-id' } }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/composables/admin-system/useUnsavedChangesGuard', () => ({
  useUnsavedChangesGuard: vi.fn(),
}))

vi.mock('@/modules/schools/services/schoolService', () => ({
  schoolModuleService: {
    getSchool: vi.fn().mockRejectedValue(new Error('offline')),
    listAdministrativeTypes: vi.fn().mockResolvedValue([]),
    listLegalNatures: vi.fn().mockResolvedValue([]),
    listManagementTypes: vi.fn().mockResolvedValue([]),
    listPedagogicalApproaches: vi.fn().mockResolvedValue([]),
    listEducationLevels: vi.fn().mockResolvedValue([]),
    listModalities: vi.fn().mockResolvedValue([]),
  },
}))

describe('SchoolEditPage', () => {
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
})

async function flushAsync() {
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}
