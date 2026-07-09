import { describe, expect, it } from 'vitest'
import {
  parseAdminListQuery,
  serializeAdminListQuery,
  updateAdminListQuery,
} from '@/composables/admin-system/useAdminListQuery'

describe('school list filter query helpers', () => {
  it('parses and serializes documented school filter query parameters', () => {
    const parsed = parseAdminListQuery('schools', {
      page: '4',
      per_page: '50',
      status: '1',
      inep_code: ' 35000001 ',
      document: '56.563.930/0001-08',
      name: 'São',
      email: 'office',
      city: 'Sao Paulo',
      state: 'SP',
      administrative_type_id: '1',
      legal_nature_id: '2',
      management_type_id: '3',
      pedagogical_approach_id: '4',
      cnpj: 'must-be-ignored',
    })

    expect(parsed).toEqual({
      page: 4,
      perPage: 50,
      status: '1',
      inepCode: '35000001',
      document: '56.563.930/0001-08',
      name: 'São',
      email: 'office',
      city: 'Sao Paulo',
      state: 'SP',
      administrativeTypeId: '1',
      legalNatureId: '2',
      managementTypeId: '3',
      pedagogicalApproachId: '4',
    })
    expect(serializeAdminListQuery('schools', parsed)).toEqual({
      page: '4',
      per_page: '50',
      status: '1',
      inep_code: '35000001',
      document: '56.563.930/0001-08',
      name: 'São',
      email: 'office',
      city: 'Sao Paulo',
      state: 'SP',
      administrative_type_id: '1',
      legal_nature_id: '2',
      management_type_id: '3',
      pedagogical_approach_id: '4',
    })
  })

  it('resets page on filter changes, preserves sort, and clears individual filters', () => {
    const changed = updateAdminListQuery(
      'schools',
      { page: 5, perPage: 25, sort: '-name', city: 'Campinas' },
      { name: 'North' },
    )
    expect(changed).toMatchObject({ page: 1, sort: '-name', city: 'Campinas', name: 'North' })

    expect(
      updateAdminListQuery('schools', changed, { city: '' }),
    ).not.toHaveProperty('city')
  })

  it('rejects invalid status, multi-value, and non-positive lookup filters', () => {
    expect(
      parseAdminListQuery('schools', {
        status: 'active',
        name: ['North', 'South'],
        administrative_type_id: '0',
      }),
    ).toEqual({ page: 1, perPage: 25 })
  })
})
