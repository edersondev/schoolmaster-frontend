import { describe, expect, it } from 'vitest'
import {
  createSchoolForm,
  mapSchool,
  mapSchoolCreateRequest,
  mapSchoolUpdateRequest,
  validateSchoolForm,
} from '@/contracts/admin-system/schools'

describe('school contracts', () => {
  it('maps records and documented create payload only', () => {
    const school = mapSchool({
      id: '1',
      contact_email: 'a@b.test',
      address: {
        id: 'addr-1',
        street: 'Main Street',
        number: '123',
        neighborhood: 'Central',
        city: 'Sao Paulo',
        state: 'SP',
        zip_code: '12345678',
      },
    })
    expect(school.contactEmail).toBe('a@b.test')
    expect(school.address.zipCode).toBe('12345678')
    expect(school.addressLabel).toBe('Main Street 123, Central, Sao Paulo, SP, 12345678')
    expect(
      mapSchoolCreateRequest({
        ...createSchoolForm(),
        name: 'N',
        code: 'N',
        contactPhone: '(11) 98765-4321',
        address: {
          street: 'Main Street',
          number: '123A',
          complement: '',
          neighborhood: 'Central',
          city: 'Sao Paulo',
          state: 'SP',
          zipCode: '12345-678',
          country: 'BR',
        },
      }),
    ).toEqual({
      name: 'N',
      code: 'N',
      contact_phone: '11987654321',
      address: {
        street: 'Main Street',
        number: '123',
        neighborhood: 'Central',
        city: 'Sao Paulo',
        state: 'SP',
        zip_code: '12345678',
        country: 'BR',
      },
    })
  })

  it('maps omitted address as no-op and explicit removal as null', () => {
    expect(mapSchoolCreateRequest({ ...createSchoolForm(), name: 'N', code: 'N' })).toEqual({
      name: 'N',
      code: 'N',
    })
    expect(mapSchoolUpdateRequest({ name: 'N' })).toEqual({ name: 'N' })
    expect(mapSchoolUpdateRequest({ removeAddress: true })).toEqual({ address: null })
  })

  it('validates required fields and optional email format before submit', () => {
    expect(validateSchoolForm(createSchoolForm())).toEqual({
      name: ['School name is required.'],
      code: ['School code is required.'],
      'address.zip_code': ['ZIP code is required.'],
      'address.street': ['Street is required.'],
      'address.number': ['Number is required.'],
      'address.neighborhood': ['Neighborhood is required.'],
      'address.city': ['City is required.'],
      'address.state': ['State is required.'],
      'address.country': ['Country is required.'],
    })
    expect(
      validateSchoolForm({
        ...createSchoolForm(),
        name: 'Northfield Academy',
        code: 'NORTH',
        contactEmail: 'invalid-email',
        address: {
          ...createSchoolForm().address,
          number: '12A',
          zipCode: '12345-678',
        },
      }),
    ).toEqual({
      contact_email: ['Enter a valid email address.'],
      'address.zip_code': ['Use numbers only.'],
      'address.street': ['Street is required.'],
      'address.number': ['Use numbers only.'],
      'address.neighborhood': ['Neighborhood is required.'],
      'address.city': ['City is required.'],
      'address.state': ['State is required.'],
      'address.country': ['Country is required.'],
    })
  })
})
