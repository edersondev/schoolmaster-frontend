import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SchoolProfileForm from '@/modules/schools/components/SchoolProfileForm.vue'
import { useSchoolForm, validateSchoolFormValues } from '@/modules/schools/composables/useSchoolForm'
import { mapSchoolTabErrors } from '@/modules/schools/utils/schoolTabErrors'
import { administrationPlugins } from '../admin-system/administration/administration.fixtures'

const lookups = {
  administrativeTypes: [{ id: 1, label: 'Public' }],
  legalNatures: [{ id: 1, label: 'For Profit' }],
  managementTypes: [{ id: 1, label: 'Traditional' }],
  pedagogicalApproaches: [{ id: 1, label: 'Constructivist' }],
  educationLevels: [{ id: 1, label: 'Elementary School' }],
  modalities: [{ id: 1, label: 'On-site' }],
}

function fillValidCreate(values) {
  Object.assign(values, {
    inep_code: '12345678',
    status: 1,
    name: 'North School',
    document: '56563930000108',
    email: 'north@example.com',
    administrative_type_id: 1,
    legal_nature_id: 1,
    management_type_id: 1,
    pedagogical_approach_id: 1,
    education_level_ids: [1],
    modality_ids: [1],
  })
}

describe('SchoolCreateForm', () => {
  it('renders grouped create tabs, lookup-backed fields, logo input, and color pickers', async () => {
    const form = useSchoolForm({ mode: 'create' })
    const wrapper = mount(SchoolProfileForm, {
      props: {
        modelValue: form.values,
        activeTab: 'basic',
        errors: {},
        tabErrors: {},
        lookups,
        lookupStatus: 'ready',
        'onUpdate:modelValue': (value) => Object.assign(form.values, value),
      },
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.text()).toContain('Basic')
    expect(wrapper.text()).toContain('Address')
    expect(wrapper.text()).toContain('Institutional')
    expect(wrapper.text()).toContain('Branding')
    expect(wrapper.text()).toContain('INEP code')
    expect(wrapper.text()).toContain('CNPJ')

    await wrapper.setProps({ activeTab: 'institutional' })
    expect(wrapper.text()).toContain('Administrative type')
    expect(wrapper.text()).toContain('Education levels')

    await wrapper.setProps({ activeTab: 'branding' })
    expect(wrapper.text()).toContain('Select logo')
    expect(wrapper.findAllComponents({ name: 'ElColorPicker' })).toHaveLength(2)
  })

  it('marks inactive tabs with validation errors and preserves entered values', async () => {
    const form = useSchoolForm({ mode: 'create', service: { createSchool: vi.fn() } })
    fillValidCreate(form.values)
    form.values.address.street = ''
    form.values.name = 'Preserved School'

    await expect(form.submit()).rejects.toMatchObject({ type: 'validation' })

    expect(form.activeTab.value).toBe('address')
    expect(form.values.name).toBe('Preserved School')
    expect(mapSchoolTabErrors(form.fieldErrors.value)).toMatchObject({ address: true })
    expect(form.fieldErrors.value['address.street']).toEqual(['Street is required.'])
  })

  it('uses field-specific required messages for address and institutional tabs', async () => {
    const form = useSchoolForm({ mode: 'create', service: { createSchool: vi.fn() } })

    await expect(form.submit()).rejects.toMatchObject({ type: 'validation' })

    expect(form.fieldErrors.value['address.zip_code']).toEqual(['ZIP code is required.'])
    expect(form.fieldErrors.value['address.number']).toEqual(['Number is required.'])
    expect(form.fieldErrors.value.administrative_type_id).toEqual([
      'Administrative type is required.',
    ])
    expect(form.fieldErrors.value.legal_nature_id).toEqual(['Legal nature is required.'])
    expect(form.fieldErrors.value.management_type_id).toEqual(['Management type is required.'])
    expect(form.fieldErrors.value.pedagogical_approach_id).toEqual([
      'Pedagogical approach is required.',
    ])
  })

  it('blocks submit while institutional lookups are unavailable', async () => {
    const service = {
      createSchool: vi.fn(),
      listAdministrativeTypes: vi.fn().mockRejectedValue(new Error('offline')),
    }
    const form = useSchoolForm({ mode: 'create', service })
    await form.loadLookups()
    fillValidCreate(form.values)
    Object.assign(form.values.address, {
      street: 'Main Street',
      number: '123',
      neighborhood: 'Central',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '12345678',
    })

    await expect(form.submit()).rejects.toMatchObject({ type: 'unavailable' })
    expect(service.createSchool).not.toHaveBeenCalled()
  })

  it('keeps newest lookup response when an older lookup request resolves late', async () => {
    const first = deferred()
    const second = deferred()
    let current = first
    const service = Object.fromEntries(
      [
        'listAdministrativeTypes',
        'listLegalNatures',
        'listManagementTypes',
        'listPedagogicalApproaches',
        'listEducationLevels',
        'listModalities',
      ].map((method) => [method, vi.fn(() => current.promise)]),
    )
    const form = useSchoolForm({ mode: 'create', service })

    const firstLoad = form.loadLookups()
    current = second
    const secondLoad = form.loadLookups()
    second.resolve([{ id: 2, label: 'Newest' }])
    await secondLoad
    first.resolve([{ id: 1, label: 'Stale' }])
    await firstLoad

    expect(form.lookups.administrativeTypes).toEqual([{ id: 2, label: 'Newest' }])
  })

  it('routes invalid logo files to Branding without clearing other values', async () => {
    const form = useSchoolForm({ mode: 'create', service: { createSchool: vi.fn() } })
    fillValidCreate(form.values)
    Object.assign(form.values.address, {
      street: 'Main Street',
      number: '123',
      neighborhood: 'Central',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '12345678',
    })
    form.values.logo_file = new File(['logo'], 'logo.svg', { type: 'image/svg+xml' })

    await expect(form.submit()).rejects.toMatchObject({ type: 'validation' })

    expect(form.activeTab.value).toBe('branding')
    expect(form.values.name).toBe('North School')
    expect(form.fieldErrors.value.logo_file).toEqual(['Logo must be PNG, JPEG, or WebP.'])
  })

  it('ignores empty object logo placeholders during validation', () => {
    const form = useSchoolForm({ mode: 'create', service: { createSchool: vi.fn() } })
    form.values.logo_file = {}

    const errors = validateSchoolFormValues(form.values, { mode: 'create' })

    expect(errors.logo_file).toBeUndefined()
    expect(form.isDirty.value).toBe(false)
  })
})

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
