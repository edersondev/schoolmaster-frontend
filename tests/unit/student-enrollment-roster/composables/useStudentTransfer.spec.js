import { describe, expect, it, vi } from 'vitest'
import { useStudentTransfer } from '@/composables/admin-system/useStudentTransfer'

describe('useStudentTransfer', () => {
  it('validates required transfer inputs', async () => {
    const submitter = vi.fn().mockResolvedValue({ studentProfile: { id: 's1', status: 'transferred' } })
    const transfer = useStudentTransfer({ submitter })
    expect(await transfer.submit('s1')).toBeNull()
    transfer.form.effectiveAt = '2026-01-01'
    transfer.form.reason = 'move'
    await transfer.submit('s1')
    expect(submitter).toHaveBeenCalled()
  })
})
