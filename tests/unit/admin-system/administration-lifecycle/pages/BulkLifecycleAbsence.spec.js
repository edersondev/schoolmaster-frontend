import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { getLifecycleCapability, getLifecycleOperations } from '@/contracts/admin-system/lifecycle'
import * as permissionsService from '@/services/admin-system/permissions'
import * as schoolsService from '@/services/admin-system/schools'

const source = (path) => readFileSync(`${process.cwd()}/${path}`, 'utf8')

describe('bulk lifecycle absence', () => {
  it('keeps schools and permission definitions out of bulk lifecycle services and contracts', () => {
    expect(getLifecycleCapability('schools').bulk).toBe(false)
    expect(getLifecycleCapability('permissions').bulk).toBe(false)
    expect(getLifecycleOperations('schools').bulk).toBeUndefined()
    expect(getLifecycleOperations('permissions').bulk).toBeUndefined()
    expect(schoolsService.bulkLifecycleSchools).toBeUndefined()
    expect(permissionsService.bulkLifecyclePermissions).toBeUndefined()
  })

  it('does not render school or permission bulk controls', () => {
    expect(source('src/pages/admin-system/schools/SchoolsListPage.vue')).not.toContain(
      'AdminBulkActionBar',
    )
    expect(source('src/router/modules/access-administration.routes.js')).not.toContain(
      'permissionDetail',
    )
  })
})
