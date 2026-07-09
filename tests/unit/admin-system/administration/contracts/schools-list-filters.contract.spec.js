import { describe, expect, it } from 'vitest'
import { mapPaginatedEnvelope } from '@/contracts/admin-system/administration'
import { mapListParams } from '@/services/admin-system/administration-service'

describe('school list filter contract mapping', () => {
  it('submits only documented school list filter parameter names', () => {
    const params = mapListParams({
      page: 1,
      perPage: 25,
      status: '0',
      inepCode: '35000001',
      document: '56563930000108',
      cnpj: 'must-not-submit',
      administrativeTypeId: '1',
      legalNatureId: '2',
      managementTypeId: '3',
      pedagogicalApproachId: '4',
    })

    expect(params).toEqual({
      page: 1,
      per_page: 25,
      status: '0',
      inep_code: '35000001',
      document: '56563930000108',
      administrative_type_id: '1',
      legal_nature_id: '2',
      management_type_id: '3',
      pedagogical_approach_id: '4',
    })
    expect(params).not.toHaveProperty('cnpj')
  })

  it('preserves existing paginated list response handling', () => {
    expect(
      mapPaginatedEnvelope({
        data: [{ id: 'school-1', name: 'North' }],
        meta: { page: 2, per_page: 50, total: 100 },
      }),
    ).toEqual({
      items: [{ id: 'school-1', name: 'North' }],
      meta: { page: 2, perPage: 50, total: 100 },
    })
  })
})
