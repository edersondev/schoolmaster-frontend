import { describe, expect, it, vi } from 'vitest'
import {
  compactSchoolPayload,
  createSchoolModuleService,
  toSchoolRequestBody,
} from '@/modules/schools/services/schoolService'

const fullPayload = {
  inep_code: '12.345-678',
  status: '1',
  name: 'North School',
  trade_name: 'North',
  legal_name: 'North Legal',
  document: '56.563.930/0001-08',
  email: 'north@example.com',
  phone: '(11) 99999-0000',
  website: 'https://north.example.com',
  description: 'School profile',
  address: {
    street: 'Main Street',
    number: '123A',
    complement: '',
    neighborhood: 'Central',
    city: 'Sao Paulo',
    state: 'SP',
    zipCode: '12345-678',
    country: 'Brazil',
  },
  administrative_type_id: '1',
  legal_nature_id: '2',
  management_type_id: '3',
  pedagogical_approach_id: '4',
  education_level_ids: ['5', 6],
  modality_ids: ['7'],
}

describe('school module create service', () => {
  it('maps create payload to the school profile API contract', () => {
    expect(compactSchoolPayload(fullPayload)).toEqual({
      inep_code: '12345678',
      status: 1,
      name: 'North School',
      trade_name: 'North',
      legal_name: 'North Legal',
      document: '56563930000108',
      email: 'north@example.com',
      phone: '11999990000',
      website: 'https://north.example.com',
      description: 'School profile',
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
      legal_nature_id: 2,
      management_type_id: 3,
      pedagogical_approach_id: 4,
      education_level_ids: [5, 6],
      modality_ids: [7],
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      primary_color: '#1D4ED8',
      secondary_color: '#F59E0B',
    })
  })

  it('posts create requests with bearer authorization and unwraps the API envelope', async () => {
    const client = {
      post: vi.fn().mockResolvedValue({ data: { data: { id: 'school-id', name: 'North' } } }),
    }
    const service = createSchoolModuleService(client, () => 'test-token')

    await expect(service.createSchool(fullPayload)).resolves.toEqual({ id: 'school-id', name: 'North' })

    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/schools',
      expect.objectContaining({
        document: '56563930000108',
        inep_code: '12345678',
      }),
      { headers: { Authorization: 'Bearer test-token' } },
    )
  })

  it('uses multipart form data when a logo file is present', () => {
    const logo = new Blob(['logo'], { type: 'image/png' })
    const { data, headers } = toSchoolRequestBody({ ...fullPayload, logo_file: logo })

    expect(headers).toEqual({})
    expect(data).toBeInstanceOf(FormData)
    expect(data.get('document')).toBe('56563930000108')
    expect(data.get('address[number]')).toBe('123')
    expect(data.getAll('education_level_ids[]')).toEqual(['5', '6'])
    expect(data.getAll('modality_ids[]')).toEqual(['7'])
    expect(data.get('logo_file')).toMatchObject({ size: logo.size, type: 'image/png' })
  })
})
