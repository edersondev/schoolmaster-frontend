import { describe, expect, it } from 'vitest'
import {
  createSchoolForm,
  mapSchool,
  mapSchoolCreateRequest,
  mapSchoolUpdateRequest,
} from '@/contracts/admin-system/schools'

describe('school address contract', () => {
  it('maps structured address response and never uses legacy summary', () => {
    const school = mapSchool({
      id: 'school-1',
      address_summary: 'ignored legacy summary',
      address: {
        street: 'Main Street',
        number: '123',
        neighborhood: 'Central',
        city: 'Sao Paulo',
        state: 'SP',
        zip_code: '12345678',
      },
    })

    expect(school.addressSummary).toBeUndefined()
    expect(school.address).toMatchObject({ street: 'Main Street', zipCode: '12345678' })
    expect(school.addressLabel).toBe('Main Street 123, Central, Sao Paulo, SP, 12345678')
  })

  it('maps create, no-op update, and explicit null removal payloads', () => {
    const form = {
      ...createSchoolForm(),
      name: 'Northfield',
      code: 'NORTH',
      address: {
        street: 'Main Street',
        number: '123',
        complement: '',
        neighborhood: 'Central',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '12345678',
        country: '',
      },
    }

    expect(mapSchoolCreateRequest(form)).toEqual({
      name: 'Northfield',
      code: 'NORTH',
      address: {
        street: 'Main Street',
        number: '123',
        neighborhood: 'Central',
        city: 'Sao Paulo',
        state: 'SP',
        zip_code: '12345678',
      },
    })
    expect(mapSchoolUpdateRequest({ name: 'Northfield' })).toEqual({ name: 'Northfield' })
    expect(mapSchoolUpdateRequest({ removeAddress: true })).toEqual({ address: null })
  })
})
