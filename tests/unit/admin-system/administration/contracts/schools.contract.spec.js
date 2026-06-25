import { describe, expect, it } from 'vitest'
import {
  createSchoolForm,
  mapSchool,
  mapSchoolCreateRequest,
} from '@/contracts/admin-system/schools'

describe('school contracts', () => {
  it('maps records and documented create payload only', () => {
    expect(mapSchool({ id: '1', contact_email: 'a@b.test' }).contactEmail).toBe('a@b.test')
    expect(mapSchoolCreateRequest({ ...createSchoolForm(), name: 'N', code: 'N' })).toEqual({
      name: 'N',
      code: 'N',
    })
  })
})
