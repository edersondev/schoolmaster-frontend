import { describe, expect, it } from 'vitest'
import {
  parseAdminListQuery,
  serializeAdminListQuery,
  updateAdminListQuery,
} from '@/composables/admin-system/useAdminListQuery'

describe('academic year list query helpers', () => {
  it('parses and serializes documented filters', () => {
    const parsed = parseAdminListQuery('academic-years', {
      page: '3',
      per_page: '50',
      name: '  Primary  ',
      date_from: '2026-01-01',
      date_to: '2026-12-31',
      status: 'planned',
      inep_code: 'ignored',
    })

    expect(parsed).toEqual({
      page: 3,
      perPage: 50,
      name: 'Primary',
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
      status: 'planned',
    })
    expect(serializeAdminListQuery('academic-years', parsed)).toEqual({
      page: '3',
      per_page: '50',
      name: 'Primary',
      date_from: '2026-01-01',
      date_to: '2026-12-31',
      status: 'planned',
    })
  })

  it.each(['planned', 'active', 'closed', 'inactive'])('accepts %s status', (status) => {
    expect(parseAdminListQuery('academic-years', { status })).toMatchObject({ status })
  })

  it('drops incomplete or invalid ranges and resets page when filters change', () => {
    expect(
      parseAdminListQuery('academic-years', {
        date_from: '2026-01-01',
        date_to: 'invalid',
      }),
    ).toEqual({ page: 1, perPage: 25 })

    expect(
      updateAdminListQuery(
        'academic-years',
        { page: 4, perPage: 25, status: 'active' },
        { name: 'Primary', dateFrom: '2026-01-01', dateTo: '2026-12-31' },
      ),
    ).toEqual({
      page: 1,
      perPage: 25,
      name: 'Primary',
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
      status: 'active',
    })
  })
})
