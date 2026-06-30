import { describe, expect, it, vi } from 'vitest'
import { useStudentProfileLifecycle } from '@/composables/admin-system/useStudentProfileLifecycle'

describe('useStudentProfileLifecycle', () => {
  it('validates required date/reason and submits status', async () => {
    const submitter = vi.fn().mockResolvedValue({ studentProfile: { id: 's1' } })
    const lifecycle = useStudentProfileLifecycle({ submitter })
    expect(await lifecycle.submit('s1')).toBeNull()
    lifecycle.form.status = 'inactive'
    lifecycle.form.effectiveAt = '2026-01-01'
    lifecycle.form.reason = 'reason'
    await lifecycle.submit('s1')
    expect(submitter).toHaveBeenCalled()
  })
})
