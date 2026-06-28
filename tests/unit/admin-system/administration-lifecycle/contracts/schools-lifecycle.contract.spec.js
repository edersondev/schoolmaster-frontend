import { describe, expect, it } from 'vitest'
import { mapSchoolUpdateRequest } from '@/contracts/admin-system/schools'

describe('school lifecycle contract', () => {
  it('omits status and bulk capability from update mapping', () => {
    expect(mapSchoolUpdateRequest({ name: 'North', status: 'inactive' })).toEqual({ name: 'North' })
  })
})
