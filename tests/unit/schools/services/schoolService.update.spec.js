import { describe, expect, it, vi } from 'vitest'
import {
  compactSchoolPayload,
  createSchoolModuleService,
  toSchoolRequestBody,
} from '@/modules/schools/services/schoolService'

describe('school module update service', () => {
  it('omits document from update payloads because backend treats it as immutable', () => {
    expect(
      compactSchoolPayload(
        {
          inep_code: '12345678',
          status: 0,
          name: 'Updated School',
          document: '56.563.930/0001-08',
          email: 'updated@example.com',
          administrative_type_id: 1,
          legal_nature_id: 1,
          management_type_id: 1,
          pedagogical_approach_id: 1,
          education_level_ids: [1],
          modality_ids: [1],
        },
        { omitDocument: true },
      ),
    ).toEqual({
      inep_code: '12345678',
      status: 0,
      name: 'Updated School',
      email: 'updated@example.com',
      administrative_type_id: 1,
      legal_nature_id: 1,
      management_type_id: 1,
      pedagogical_approach_id: 1,
      education_level_ids: [1],
      modality_ids: [1],
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      primary_color: '#1D4ED8',
      secondary_color: '#F59E0B',
    })
  })

  it('patches update requests with mapped payload and authorization header', async () => {
    const client = {
      patch: vi.fn().mockResolvedValue({ data: { data: { id: 'school-id', status: 0 } } }),
      post: vi.fn(),
    }
    const service = createSchoolModuleService(client, () => 'test-token')

    await expect(
      service.updateSchool('school-id', {
        name: 'Updated School',
        document: '56.563.930/0001-08',
        status: '0',
      }),
    ).resolves.toEqual({ id: 'school-id', status: 0 })

    expect(client.patch).toHaveBeenCalledWith(
      '/api/v1/schools/school-id',
      expect.not.objectContaining({ document: expect.anything() }),
      { headers: { Authorization: 'Bearer test-token' } },
    )
    expect(client.post).not.toHaveBeenCalled()
  })

  it('posts multipart update requests with Laravel method spoofing for logo files', async () => {
    const logo = new File(['logo'], 'logo.png', { type: 'image/png' })
    const client = {
      patch: vi.fn(),
      post: vi.fn().mockResolvedValue({ data: { data: { id: 'school-id', logo_path: 'logos/logo.png' } } }),
    }
    const service = createSchoolModuleService(client, () => 'test-token')

    await expect(
      service.updateSchool('school-id', {
        name: 'Updated School',
        logo_file: logo,
      }),
    ).resolves.toEqual({ id: 'school-id', logo_path: 'logos/logo.png' })

    expect(client.patch).not.toHaveBeenCalled()
    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/schools/school-id',
      expect.any(FormData),
      {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PATCH',
        },
      },
    )
    const form = client.post.mock.calls[0][1]
    expect(form.get('_method')).toBeNull()
    expect(form.get('logo_file')).toMatchObject({ name: 'logo.png', size: logo.size, type: 'image/png' })
  })

  it('omits document from multipart update requests with logo file', () => {
    const logo = new File(['logo'], 'logo.png', { type: 'image/png' })
    const { data, headers } = toSchoolRequestBody(
      {
        name: 'Updated School',
        document: '56.563.930/0001-08',
        logo_file: logo,
      },
      { omitDocument: true },
    )

    expect(headers).toEqual({ 'Content-Type': 'multipart/form-data' })
    expect(data.get('name')).toBe('Updated School')
    expect(data.get('logo_file')).toMatchObject({ name: 'logo.png', size: logo.size, type: 'image/png' })
    expect(Array.from(data.keys())).not.toContain('document')
    expect(Array.from(data.keys())).not.toContain('status')
  })
})
