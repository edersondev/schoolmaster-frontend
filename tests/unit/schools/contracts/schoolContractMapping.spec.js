import { describe, expect, it, vi } from 'vitest'
import {
  compactSchoolPayload,
  createSchoolModuleService,
} from '@/modules/schools/services/schoolService'
import { mapSchoolTabErrors, tabForSchoolField } from '@/modules/schools/utils/schoolTabErrors'

describe('school contract mapping', () => {
  it('uses documented school lookup endpoints and unwraps option lists', async () => {
    const client = {
      get: vi.fn().mockResolvedValue({
        data: { data: [{ id: 1, label: 'Municipal', status: 1, sort_order: 1 }] },
      }),
    }
    const service = createSchoolModuleService(client, () => 'test-token')

    await expect(service.listAdministrativeTypes()).resolves.toEqual([
      { id: 1, label: 'Municipal', status: 1, sort_order: 1 },
    ])
    await service.listLegalNatures()
    await service.listManagementTypes()
    await service.listPedagogicalApproaches()
    await service.listEducationLevels()
    await service.listModalities()

    expect(client.get.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/school-lookups/administrative-types',
      '/api/v1/school-lookups/legal-natures',
      '/api/v1/school-lookups/management-types',
      '/api/v1/school-lookups/pedagogical-approaches',
      '/api/v1/school-lookups/education-levels',
      '/api/v1/school-lookups/modalities',
    ])
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/school-lookups/modalities',
      { headers: { Authorization: 'Bearer test-token' } },
    )
  })

  it('maps validation fields to the tabs that own them', () => {
    expect(tabForSchoolField('name')).toBe('basic')
    expect(tabForSchoolField('address.zip_code')).toBe('address')
    expect(tabForSchoolField('education_level_ids')).toBe('institutional')
    expect(tabForSchoolField('logo_file')).toBe('branding')

    expect(
      mapSchoolTabErrors({
        document: ['Required'],
        'address.number': ['Digits only'],
        modality_ids: ['Required'],
        primary_color: ['Invalid'],
      }),
    ).toEqual({
      basic: true,
      address: true,
      institutional: true,
      branding: true,
    })
  })

  it('submits only documented identity and status fields', () => {
    const payload = compactSchoolPayload({
      name: 'North School',
      document: '56.563.930/0001-08',
      cnpj: '11.444.777/0001-61',
      status: '1',
    })

    expect(payload).toMatchObject({
      name: 'North School',
      document: '56563930000108',
      status: 1,
    })
    expect(payload).not.toHaveProperty('cnpj')
    expect(typeof payload.status).toBe('number')
  })
})
