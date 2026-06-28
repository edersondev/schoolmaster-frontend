import { describe, expect, it } from 'vitest'
import {
  ADMIN_FEEDBACK_STATES,
  createAdminFormState,
  createAdminListState,
  mapPaginatedEnvelope,
} from '@/contracts/admin-system/administration'
import { paginatedEnvelope } from '../administration.fixtures'

describe('administration contracts', () => {
  it('maps pagination and creates stable list/form models', () => {
    expect(mapPaginatedEnvelope(paginatedEnvelope)).toEqual({
      items: paginatedEnvelope.data,
      meta: { page: 1, perPage: 25, total: 1 },
    })
    expect(createAdminListState().status).toBe(ADMIN_FEEDBACK_STATES.idle)
    expect(createAdminFormState({ name: '' }).values).toEqual({ name: '' })
  })
})
