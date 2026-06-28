import { describe, expect, it } from 'vitest'
import {
  parseAdminListQuery,
  serializeAdminListQuery,
  updateAdminListQuery,
} from '@/composables/admin-system/useAdminListQuery'

describe('useAdminListQuery helpers', () => {
  it('normalizes, allowlists, excludes school sort, and resets page', () => {
    expect(
      parseAdminListQuery('schools', {
        page: '-2',
        per_page: '50',
        status: 'active',
        sort: '-name',
        unsafe: 'x',
      }),
    ).toEqual({ page: 1, perPage: 50, status: 'active' })
    expect(serializeAdminListQuery('permissions', { page: 2, perPage: 25 })).toEqual({
      page: '2',
      per_page: '25',
    })
    expect(updateAdminListQuery('users', { page: 4, perPage: 25 }, { status: 'active' }).page).toBe(
      1,
    )
  })
})
