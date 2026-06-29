import { describe, expect, it } from 'vitest'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'

describe('lifecycle privacy', () => {
  it('does not copy lifecycle reason text into normalized diagnostics', () => {
    const normalized = normalizeAdministrationError({ response: { status: 422, data: { error: { code: 'validation_failed', message: 'private reason text' } } } })
    expect(JSON.stringify(normalized)).not.toContain('private reason text')
  })
})
