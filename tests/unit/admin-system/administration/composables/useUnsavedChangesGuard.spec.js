import { describe, expect, it, vi } from 'vitest'
import { createUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'

describe('unsaved changes guard', () => {
  it('prompts dirty exits, bypasses unchanged and submitted forms', async () => {
    const confirm = vi.fn().mockResolvedValue(true)
    const guard = createUnsavedChangesGuard({ confirm })
    expect(await guard.canLeave({ dirty: false, submitted: false })).toBe(true)
    expect(await guard.canLeave({ dirty: true, submitted: true })).toBe(true)
    expect(await guard.canLeave({ dirty: true, submitted: false })).toBe(true)
    expect(confirm).toHaveBeenCalledTimes(1)
  })
})
