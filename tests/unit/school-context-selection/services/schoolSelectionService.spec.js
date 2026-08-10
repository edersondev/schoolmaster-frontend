import { describe, expect, it, vi } from 'vitest'
import { createSchoolSelectionService } from '@/services/auth/schoolSelectionService'
import { activeSchool, paginatedSchools } from '../fixtures/schoolContextSelection.fixtures'

describe('schoolSelectionService', () => {
  it('requests only active schools with explicit pagination and separate filters', async () => {
    const schools = { listSchools: vi.fn().mockResolvedValue(paginatedSchools()) }
    const service = createSchoolSelectionService(schools)
    const controller = new AbortController()

    await expect(
      service.listActiveSchools({
        page: 2,
        name: 'Central',
        inepCode: '12345678',
        signal: controller.signal,
      }),
    ).resolves.toEqual(paginatedSchools())

    expect(schools.listSchools).toHaveBeenCalledWith(
      { status: 1, page: 2, perPage: 25, name: 'Central', inepCode: '12345678' },
      { signal: controller.signal },
    )
  })

  it('does not expose inactive records returned by an unsafe upstream response', async () => {
    const schools = {
      listSchools: vi.fn().mockResolvedValue(
        paginatedSchools([
          { ...activeSchool, status: 'active' },
          { id: 'bad', status: 'inactive' },
        ]),
      ),
    }

    await expect(createSchoolSelectionService(schools).listActiveSchools()).resolves.toMatchObject({
      items: [{ ...activeSchool, status: 'active' }],
    })
  })

  it('passes normalized safe errors through unchanged', async () => {
    const error = { type: 'unavailable', messageKey: 'common.unavailable' }
    const service = createSchoolSelectionService({
      listSchools: vi.fn().mockRejectedValue(error),
    })

    await expect(service.listActiveSchools()).rejects.toBe(error)
  })
})
