import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('UserDetail account lifecycle integration', () => {
  it('composes panels without direct account lifecycle HTTP calls', () => {
    const path = join(globalThis.process.cwd(), 'src/pages/admin-system/users/UserDetailPage.vue')
    const source = readFileSync(path, 'utf8')

    expect(source).toContain('UserInvitationPanel')
    expect(source).toContain('AccountLockPanel')
    expect(source).toContain('AccountLifecycleActions')
    expect(source).toContain('useAccountLifecycleActions')
    expect(source).not.toContain('axios')
  })
})
