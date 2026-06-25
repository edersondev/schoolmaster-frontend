import { describe, expect, it } from 'vitest'
import {
  parseAdminListQuery,
  serializeAdminListQuery,
} from '@/composables/admin-system/useAdminListQuery'
import { schoolRoutes } from '@/router/modules/schools.routes'

describe('school page flows', () => {
  it('restores validated query and protects list/create routes', () => {
    const query = parseAdminListQuery('schools', { page: '2', per_page: '50', status: 'active' })
    expect(serializeAdminListQuery('schools', query)).toEqual({
      page: '2',
      per_page: '50',
      status: 'active',
    })
    expect(schoolRoutes[0].meta.permissions).toEqual(['schools.view'])
    expect(schoolRoutes[1].meta.permissions).toEqual(['schools.view', 'schools.manage'])
  })
})
