import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SchoolProfileForm from '@/modules/schools/components/SchoolProfileForm.vue'
import {
  mapSchoolRecordToForm,
  useSchoolForm,
} from '@/modules/schools/composables/useSchoolForm'
import { administrationPlugins } from '../admin-system/administration/administration.fixtures'

const lookups = {
  administrativeTypes: [{ id: 1, label: 'Public' }],
  legalNatures: [{ id: 1, label: 'For Profit' }],
  managementTypes: [{ id: 1, label: 'Traditional' }],
  pedagogicalApproaches: [{ id: 1, label: 'Constructivist' }],
  educationLevels: [{ id: 1, label: 'Elementary School' }],
  modalities: [{ id: 1, label: 'On-site' }],
}

const validRecord = {
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
  administrative_type_id: 1,
  legal_nature_id: 1,
  management_type_id: 1,
  pedagogical_approach_id: 1,
  education_level_ids: [1],
  modality_ids: [1],
  primary_color: '#1D4ED8',
  secondary_color: '#F59E0B',
}

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

describe('SchoolEditForm', () => {
  it('renders document as read-only in edit mode', () => {
    const form = useSchoolForm({ mode: 'edit' })
    form.reset(mapSchoolRecordToForm(validRecord))

    const wrapper = mount(SchoolProfileForm, {
      props: {
        modelValue: form.values,
        activeTab: 'basic',
        errors: {},
        tabErrors: {},
        lookups,
        lookupStatus: 'ready',
        readonlyDocument: true,
        'onUpdate:modelValue': (value) => Object.assign(form.values, value),
      },
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.get('input[placeholder="00.000.000/0000-00"]').attributes('readonly')).toBeDefined()
  })

  it('blocks incomplete address edits before calling backend', async () => {
    const service = { updateSchool: vi.fn() }
    const form = useSchoolForm({ mode: 'edit', service })
    form.reset(mapSchoolRecordToForm(validRecord))
    form.values.address.number = ''

    await expect(form.submit('school-id')).rejects.toMatchObject({ type: 'validation' })

    expect(form.activeTab.value).toBe('address')
    expect(service.updateSchool).not.toHaveBeenCalled()
  })

  it('ignores stale load responses and keeps the newest school in the form', async () => {
    const first = deferred()
    const second = deferred()
    const service = {
      getSchool: vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise),
    }
    const form = useSchoolForm({ mode: 'edit', service })

    const firstLoad = form.loadSchool('old-id')
    const secondLoad = form.loadSchool('new-id')
    second.resolve({ ...validRecord, name: 'Newest School' })
    await secondLoad
    first.resolve({ ...validRecord, name: 'Stale School' })
    await firstLoad

    expect(form.values.name).toBe('Newest School')
  })
})
