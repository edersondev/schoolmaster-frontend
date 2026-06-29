import { describe, expect, it, vi } from 'vitest'
import { useAdminBulkLifecycle } from '@/composables/admin-system/useAdminBulkLifecycle'

describe('useAdminBulkLifecycle', () => {
  it('keeps unique selected ids and submits all-or-nothing input', async () => {
    const submitter = vi.fn(() => ({ status: 'inactive' }))
    const bulk = useAdminBulkLifecycle({ submitter })
    bulk.toggle({ id: '1', name: 'A', status: 'active' }, true)
    bulk.toggle({ id: '1', name: 'A', status: 'active' }, true)
    bulk.form.reason = 'Audit'
    await bulk.submit('deactivate')
    expect(submitter).toHaveBeenCalledWith({
      action: 'deactivate',
      ids: ['1'],
      effectiveAt: expect.any(String),
      reason: 'Audit',
    })
    expect(bulk.selectedCount.value).toBe(0)
  })
})
