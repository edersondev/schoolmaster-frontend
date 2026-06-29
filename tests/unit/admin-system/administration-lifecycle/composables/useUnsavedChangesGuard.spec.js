import { describe, expect, it, vi } from 'vitest'
import { createUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'

describe('lifecycle unsaved changes guard', () => {
  it('requires confirmation for dirty edit or open lifecycle confirmation', async () => {
    const confirm = vi.fn(() => true)
    const guard = createUnsavedChangesGuard({ confirm })
    await expect(guard.canLeave({ dirty: true, submitted: false })).resolves.toBe(true)
    expect(confirm).toHaveBeenCalledTimes(1)
  })
})
