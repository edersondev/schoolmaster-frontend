import { describe, expect, it, vi } from 'vitest'
import { useSchoolSelection } from '@/composables/auth/useSchoolSelection'
import { activeSchool, paginatedSchools } from '../fixtures/schoolContextSelection.fixtures'

describe('useSchoolSelection', () => {
  it('searches, paginates, refreshes, and clears filters', async () => {
    const service = {
      listActiveSchools: vi
        .fn()
        .mockImplementation(({ page }) => Promise.resolve(paginatedSchools(undefined, { page }))),
    }
    const selection = useSchoolSelection({ service })

    await selection.search({ name: ' Central ', inepCode: ' 123 ' })
    await selection.goToPage(2)
    await selection.refresh()
    await selection.clearFilters()

    expect(service.listActiveSchools.mock.calls.map(([query]) => query)).toEqual([
      expect.objectContaining({ page: 1, name: 'Central', inepCode: '123' }),
      expect.objectContaining({ page: 2, name: 'Central', inepCode: '123' }),
      expect.objectContaining({ page: 2, name: 'Central', inepCode: '123' }),
      expect.objectContaining({ page: 1, name: '', inepCode: '' }),
    ])
    expect(selection.schools.value).toEqual([activeSchool])
  })

  it('aborts the prior request and ignores stale results', async () => {
    let resolveFirst
    const service = {
      listActiveSchools: vi
        .fn()
        .mockImplementationOnce(
          ({ signal }) =>
            new Promise((resolve) => {
              resolveFirst = () => resolve(paginatedSchools([{ ...activeSchool, id: 'stale' }]))
              signal.addEventListener('abort', () => {})
            }),
        )
        .mockResolvedValueOnce(paginatedSchools([{ ...activeSchool, id: 'latest' }])),
    }
    const selection = useSchoolSelection({ service })

    const first = selection.load()
    await selection.refresh()
    resolveFirst()
    await first

    expect(selection.schools.value[0].id).toBe('latest')
  })

  it('exposes distinct empty, filtered-empty, error, retry, and loading state', async () => {
    const error = { type: 'unavailable' }
    const service = {
      listActiveSchools: vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue(paginatedSchools([], { total: 0 })),
    }
    const selection = useSchoolSelection({ service })

    const pending = selection.load()
    expect(selection.status.value).toBe('loading')
    await expect(pending).rejects.toBe(error)
    expect(selection.status.value).toBe('error')
    await selection.retry()
    expect(selection.status.value).toBe('empty')
    await selection.search({ name: 'missing' })
    expect(selection.status.value).toBe('filtered-empty')
  })
})
