import { describe, expect, it, vi } from 'vitest'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'

describe('System Administrator client audit boundary', () => {
  it('uses existing state-change submitter without separate client audit request', async () => {
    const submitter = vi.fn().mockResolvedValue({ id: 'user-1', status: 'inactive' })
    const auditTransport = vi.fn()
    const action = useAdminLifecycleAction({ submitter })
    action.launch({ id: 'user-1' }, 'deactivate')
    action.form.reason = 'Administrative maintenance reason'

    await action.submit()

    expect(submitter).toHaveBeenCalledOnce()
    expect(auditTransport).not.toHaveBeenCalled()
  })
})
