import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { administrationRoutes } from '@/router/modules/administration.routes'

const source = (path) => readFileSync(`${process.cwd()}/${path}`, 'utf8')

describe('lifecycle scope absence', () => {
  it('does not register out-of-scope account, support, reporting, purge, or student routes', () => {
    const routeNames = administrationRoutes.map((route) => String(route.name))
    const joined = routeNames.join(' ')

    expect(joined).not.toMatch(/invitation|password|lock|reactivation|purge/i)
    expect(joined).not.toMatch(/student|report|support/i)
  })

  it('keeps out-of-scope lifecycle behaviors absent from lifecycle pages', () => {
    const files = [
      'src/pages/admin-system/users/UsersListPage.vue',
      'src/pages/admin-system/users/UserDetailPage.vue',
      'src/pages/admin-system/guardians/GuardiansListPage.vue',
      'src/pages/admin-system/guardians/GuardianDetailPage.vue',
    ]
    const combined = files.map(source).join('\n')

    expect(combined).not.toMatch(/invite|password|lock|reactivat|permanent|purge/i)
    expect(combined).not.toMatch(/student|report|support|userLink|linkUser/i)
  })
})
