import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { useAdminBulkLifecycle } from '@/composables/admin-system/useAdminBulkLifecycle'

const source = (path) => readFileSync(`${process.cwd()}/${path}`, 'utf8')

describe('access bulk lifecycle pages', () => {
  it('wires user and role pages to bulk selection, confirmation, refresh, and reset hooks', () => {
    const users = source('src/pages/admin-system/users/UsersListPage.vue')
    const roles = source('src/pages/admin-system/roles/RolesListPage.vue')

    expect(users).toContain('bulkLifecycleUsers')
    expect(users).toContain('<AdminBulkActionBar')
    expect(users).toContain('bulk-enabled')
    expect(users).toContain('list.query.value.page')
    expect(users).toContain('bulk.clearSelection')
    expect(roles).toContain('bulkLifecycleRoles')
    expect(roles).toContain('<AdminBulkActionBar')
    expect(roles).toContain('bulk-enabled')
    expect(roles).toContain('list.query.value.perPage')
    expect(roles).toContain('bulk.clearSelection')
  })

  it('retains selected summaries and batch feedback after failed submissions', async () => {
    const submitter = vi.fn(() =>
      Promise.reject({
        response: { status: 409, data: { error: { code: 'batch_conflict' } } },
      }),
    )
    const bulk = useAdminBulkLifecycle({ submitter, operationId: 'bulkLifecycleUsers' })
    bulk.toggle({ id: 'u1', fullName: 'Ada Lovelace', status: 'active' }, true)
    bulk.form.reason = 'Reviewed'

    await expect(bulk.submit('deactivate')).rejects.toMatchObject({
      conflictKind: 'batch',
      operationId: 'bulkLifecycleUsers',
    })
    expect(bulk.selectedIds.value).toEqual(['u1'])
    expect(bulk.selectedSummaries.value[0].label).toBe('Ada Lovelace')
  })
})
