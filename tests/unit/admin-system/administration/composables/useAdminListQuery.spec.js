import { describe, expect, it } from 'vitest'
import {
  parseAdminListQuery,
  serializeAdminListQuery,
  updateAdminListQuery,
} from '@/composables/admin-system/useAdminListQuery'

describe('useAdminListQuery helpers', () => {
  it('normalizes, allowlists school sort, and resets page', () => {
    expect(
      parseAdminListQuery('schools', {
        page: '-2',
        per_page: '50',
        status: '1',
        sort: '-name',
        unsafe: 'x',
      }),
    ).toEqual({ page: 1, perPage: 50, status: '1', sort: '-name' })
    expect(serializeAdminListQuery('permissions', { page: 2, perPage: 25 })).toEqual({
      page: '2',
      per_page: '25',
    })
    expect(updateAdminListQuery('users', { page: 4, perPage: 25 }, { status: 'active' }).page).toBe(
      1,
    )
  })

  it('allows only Guardian full-name, contact-email, and status filters', () => {
    expect(
      parseAdminListQuery('guardians', {
        page: '2',
        full_name: '  Maria  ',
        contact_email: ' guardian@example ',
        status: 'active',
        relationship_type: 'parent',
        search: 'ignored',
      }),
    ).toEqual({
      page: 2,
      perPage: 25,
      fullName: 'Maria',
      contactEmail: 'guardian@example',
      status: 'active',
    })

    expect(
      serializeAdminListQuery('guardians', {
        page: 2,
        perPage: 50,
        fullName: 'Maria',
        contactEmail: 'guardian@example',
        status: 'inactive',
      }),
    ).toEqual({
      page: '2',
      per_page: '50',
      full_name: 'Maria',
      contact_email: 'guardian@example',
      status: 'inactive',
    })

    expect(
      parseAdminListQuery('guardians', {
        full_name: 'a'.repeat(256),
        relationship_type: 'parent',
      }),
    ).toEqual({ page: 1, perPage: 25 })
  })
})
