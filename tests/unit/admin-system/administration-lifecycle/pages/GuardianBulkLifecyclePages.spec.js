import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = (path) => readFileSync(`${process.cwd()}/${path}`, 'utf8')

describe('guardian bulk lifecycle pages', () => {
  it('wires guardians to bulk lifecycle without guardian user-link behavior', () => {
    const guardians = source('src/pages/admin-system/guardians/GuardiansListPage.vue')

    expect(guardians).toContain('bulkLifecycleGuardians')
    expect(guardians).toContain('<AdminBulkActionBar')
    expect(guardians).toContain('bulk-enabled')
    expect(guardians).toContain('bulk.clearSelection')
    expect(guardians).not.toContain('userLink')
    expect(guardians).not.toContain('linkUser')
  })
})
