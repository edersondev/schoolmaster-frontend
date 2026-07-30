import { expect, test } from '@playwright/test'

const systemAdministratorRole = {
  id: 'role-system-administrator',
  name: 'System Administrator',
  scope: 'platform',
  status: 'active',
  permissions: [],
}

const schools = Array.from({ length: 100 }, (_, index) => ({
  id: `school-${index + 1}`,
  name: index < 2 ? 'Central School' : `School ${index + 1}`,
  inep_code: String(10000000 + index),
  cnpj: '56563930000108',
  status: 1,
  address: { city: index === 0 ? 'Recife' : 'Olinda', state: 'PE' },
}))

function session(resolvedSchool = null) {
  return {
    data: {
      token: 'e2e-token',
      token_expires_at: '2026-12-31T23:59:59Z',
      user: { id: 'admin-1', full_name: 'System Admin', status: 'active' },
      roles: [systemAdministratorRole],
      permissions: [],
      resolved_school: resolvedSchool,
    },
  }
}

async function mockSelectionApis(page) {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const schoolId = request.headers()['x-school-id']

    if (url.pathname === '/api/v1/auth/me') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(session(schools.find((school) => school.id === schoolId) ?? null)),
      })
    }

    if (url.pathname === '/api/v1/schools') {
      const pageNumber = Number(url.searchParams.get('page') ?? 1)
      const name = url.searchParams.get('name')?.toLowerCase() ?? ''
      const inep = url.searchParams.get('inep_code') ?? ''
      const filtered = schools.filter(
        (school) => school.name.toLowerCase().includes(name) && school.inep_code.includes(inep),
      )
      const start = (pageNumber - 1) * 25
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filtered.slice(start, start + 25),
          meta: { page: pageNumber, per_page: 25, total: filtered.length },
        }),
      })
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { page: 1, per_page: 25, total: 0 } }),
    })
  })
}

const inactiveSchool = {
  id: 'school-inactive',
  name: 'Dormant Academy',
  inep_code: '20000001',
  cnpj: '56563930000108',
  status: 0,
  address: { city: 'Caruaru', state: 'PE' },
}

const schoolA = schools[0]
const schoolB = schools[2]
const lastApprovedSchoolKey = 'schoolmaster.auth.lastApprovedSchoolId'

function deferred() {
  let resolve
  const promise = new Promise((nextResolve) => {
    resolve = nextResolve
  })
  return { promise, resolve }
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function seedLastConfirmedSchool(page, school) {
  await page.addInitScript(
    ({ key, preference }) => {
      if (window.sessionStorage.getItem('schoolmaster.e2e.preference-seeded')) return
      window.localStorage.setItem(key, JSON.stringify(preference))
      window.sessionStorage.setItem('schoolmaster.e2e.preference-seeded', 'true')
    },
    {
      key: lastApprovedSchoolKey,
      preference: { schoolId: school.id, identityId: 'admin-1' },
    },
  )
}

function userForSchool(school, id = `user-${school.id}`) {
  return {
    id,
    school_id: school.id,
    full_name: `${school.name} User`,
    email: `${school.id}@example.test`,
    status: 'active',
    roles: [{ id: 'role-teacher', name: 'Teacher', status: 'active' }],
  }
}

async function mockSchoolContextApis(page, options = {}) {
  const schoolRecords = [{ ...inactiveSchool }, ...schools.map((school) => ({ ...school }))]
  const staleUserStarted = deferred()
  const staleUserRelease = deferred()
  const state = {
    activationConflicts: options.activationConflicts ?? 0,
    activationOccurred: false,
    authRequests: [],
    selectorRequests: 0,
    selectorRequestsAtActivation: null,
    staleUserStarted,
    staleUserRelease,
    userRequests: new Map(),
  }

  function findSchool(schoolId) {
    return schoolRecords.find((school) => school.id === schoolId) ?? null
  }

  function fulfill(route, body, status = 200) {
    return route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  }

  function paginated(items, pageNumber = 1, perPage = 25) {
    const start = (pageNumber - 1) * perPage
    return {
      data: items.slice(start, start + perPage),
      meta: { page: pageNumber, per_page: perPage, total: items.length },
    }
  }

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()
    const schoolId = request.headers()['x-school-id'] ?? null

    if (path === '/api/v1/auth/me') {
      state.authRequests.push(schoolId)
      if (options.delayAuthMs) await wait(options.delayAuthMs)
      const resolvedSchool = findSchool(schoolId)
      if (schoolId && (!resolvedSchool || Number(resolvedSchool.status) !== 1)) {
        return fulfill(
          route,
          { error: { code: 'tenant_mismatch', message: 'School context is unavailable.' } },
          403,
        )
      }
      return fulfill(route, session(resolvedSchool))
    }

    const lifecycleMatch = path.match(/^\/api\/v1\/schools\/([^/]+)\/(activate|deactivate)$/)
    if (lifecycleMatch && method === 'POST') {
      const [, targetId, action] = lifecycleMatch
      const target = findSchool(targetId)
      if (action === 'activate' && state.activationConflicts > 0) {
        state.activationConflicts -= 1
        return fulfill(
          route,
          { error: { code: 'stale_record', message: 'School changed before activation.' } },
          409,
        )
      }
      if (target) target.status = action === 'activate' ? 1 : 0
      if (action === 'activate') {
        state.activationOccurred = true
        state.selectorRequestsAtActivation = state.selectorRequests
      }
      return fulfill(route, {
        data: {
          resource_type: 'schools',
          resource_id: targetId,
          action,
          status: action === 'activate' ? 'active' : 'inactive',
          affected_ids: [targetId],
        },
      })
    }

    if (path === '/api/v1/schools' && method === 'GET') {
      if (options.delayListMs) await wait(options.delayListMs)
      const isSelectorRequest = new URL(page.url()).pathname === '/auth/school-selection'
      const pageNumber = Number(url.searchParams.get('page') ?? 1)
      const perPage = Number(url.searchParams.get('per_page') ?? 25)

      if (isSelectorRequest) {
        state.selectorRequests += 1
        const name = url.searchParams.get('name')?.toLowerCase() ?? ''
        const inep = url.searchParams.get('inep_code') ?? ''
        let available = schoolRecords.filter((school) => Number(school.status) === 1)
        if (
          options.holdActivatedSchoolUntilRefresh &&
          state.activationOccurred &&
          state.selectorRequests === state.selectorRequestsAtActivation + 1
        ) {
          available = available.filter((school) => school.id !== inactiveSchool.id)
        }
        available = available.filter(
          (school) => school.name.toLowerCase().includes(name) && school.inep_code.includes(inep),
        )
        return fulfill(route, paginated(available, pageNumber, perPage))
      }

      const requestedStatus = url.searchParams.get('status')
      const available = schoolRecords.filter(
        (school) => requestedStatus === null || String(school.status) === requestedStatus,
      )
      return fulfill(route, paginated(available, pageNumber, perPage))
    }

    if (path === '/api/v1/users' && method === 'GET') {
      const requestCount = (state.userRequests.get(schoolId) ?? 0) + 1
      state.userRequests.set(schoolId, requestCount)

      if (options.authoritativeInvalidation && schoolId === schoolA.id && requestCount === 1) {
        return fulfill(
          route,
          { error: { code: 'tenant_mismatch', message: 'School context changed.' } },
          403,
        )
      }

      if (options.staleUserError && schoolId === schoolA.id && requestCount === 2) {
        staleUserStarted.resolve()
        await staleUserRelease.promise
        return fulfill(
          route,
          { error: { code: 'inactive_school', message: 'School became inactive.' } },
          403,
        )
      }

      const activeSchool = findSchool(schoolId)
      return fulfill(route, paginated(activeSchool ? [userForSchool(activeSchool)] : []))
    }

    const userDetailMatch = path.match(/^\/api\/v1\/users\/([^/]+)$/)
    if (userDetailMatch && method === 'GET') {
      const activeSchool = findSchool(schoolId) ?? schoolA
      return fulfill(route, { data: userForSchool(activeSchool, userDetailMatch[1]) })
    }

    if (path === '/api/v1/roles' && method === 'GET') {
      return fulfill(
        route,
        paginated([{ id: 'role-teacher', name: 'Teacher', scope: 'school', status: 'active' }]),
      )
    }

    return fulfill(route, paginated([]))
  })

  return state
}

async function chooseSchool(page, school) {
  await page.getByRole('button', { name: 'Choose school' }).click()
  await expect(page.getByRole('heading', { name: 'Choose a school' })).toBeVisible()
  await page
    .getByRole('button', {
      name: new RegExp(`Select ${school.name}, INEP ${school.inep_code}`),
    })
    .click()
}

async function launchSchoolLifecycle(page, schoolName, action) {
  const row = page.getByRole('row').filter({ hasText: schoolName }).first()
  await row.getByRole('button', { name: 'Actions' }).click()
  await page.getByRole('menuitem', { name: action }).click()
  const dialog = page.getByRole('dialog', { name: new RegExp(`${action} ${schoolName}`, 'i') })
  await expect(dialog).toBeVisible()
  await dialog.locator('textarea').fill(`E2E ${action.toLowerCase()} reason`)
  return dialog
}

for (const width of [390, 768, 1440]) {
  test(`searches 100 active schools and confirms an exact duplicate-name choice at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    await mockSelectionApis(page)
    await page.goto('/admin/users')

    await expect(page.getByRole('heading', { name: 'Choose a school' })).toBeVisible()
    await expect(page.getByText('56563930000108')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Select Central School/ })).toHaveCount(2)
    await expect(page.locator('.el-pagination')).toBeVisible()
    await page.locator('.el-pager li').filter({ hasText: '2' }).click()
    await expect(page.getByRole('button', { name: /Select School 26/ })).toBeVisible()

    await page.getByLabel('INEP code').fill('10000001')
    await page.getByLabel('INEP code').press('Enter')
    const exactChoice = page.getByRole('button', {
      name: /Select Central School, INEP 10000001/,
    })
    await expect(exactChoice).toBeFocused()
    await exactChoice.click()

    await expect(page).toHaveURL(/\/admin\/users/)
    await expect(page.getByText('Central School').first()).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true)
  })
}

test('restores a valid preference and clears an invalid preference with one headerless retry', async ({
  page,
}) => {
  const state = await mockSchoolContextApis(page)
  await seedLastConfirmedSchool(page, schoolA)
  await page.goto('/admin/users')

  await expect(page.getByText(schoolA.name).first()).toBeVisible()
  expect(state.authRequests[0]).toBe(schoolA.id)

  await page.evaluate((key) => {
    window.localStorage.setItem(
      key,
      JSON.stringify({ schoolId: 'school-inactive', identityId: 'admin-1' }),
    )
  }, lastApprovedSchoolKey)
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Choose a school' })).toBeVisible()
  expect(state.authRequests.slice(-2)).toEqual([inactiveSchool.id, null])
  await expect(
    page.evaluate((key) => window.localStorage.getItem(key), lastApprovedSchoolKey),
  ).resolves.toBeNull()
})

test('switches a safe list route, clears old data, and ignores a stale authoritative response', async ({
  page,
}) => {
  const state = await mockSchoolContextApis(page, { staleUserError: true })
  await seedLastConfirmedSchool(page, schoolA)
  await page.goto('/admin/users')

  await expect(page.getByText(`${schoolA.name} User`)).toBeVisible()
  const statusCombobox = page.getByRole('combobox', { name: 'Status' })
  await page.locator('.el-select__wrapper').filter({ has: statusCombobox }).click()
  await page.getByRole('option', { name: 'Active', exact: true }).click()
  await state.staleUserStarted.promise

  await chooseSchool(page, schoolB)
  await expect(page).toHaveURL(/\/admin\/users/)
  await expect(page.getByText(`${schoolB.name} User`)).toBeVisible()
  await expect(page.getByText(`${schoolA.name} User`)).toHaveCount(0)

  state.staleUserRelease.resolve()
  await page.waitForTimeout(100)
  await expect(page.getByText(schoolB.name).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Choose a school' })).toHaveCount(0)
})

test('falls back from unsafe detail identifiers and retains platform routes while switching', async ({
  page,
}) => {
  await mockSchoolContextApis(page)
  await seedLastConfirmedSchool(page, schoolA)
  await page.goto('/admin/users/user-a')

  await expect(page.getByText(schoolA.name).first()).toBeVisible()
  await chooseSchool(page, schoolB)
  await expect(page).toHaveURL(/\/admin\/?$/)

  await page.goto('/admin/schools?status=1')
  await chooseSchool(page, schoolA)
  await expect(page).toHaveURL(/\/admin\/schools\?status=1/)
  await expect(page.getByText(schoolA.name).first()).toBeVisible()
})

test('cancels selector navigation before dirty edits can clear current context', async ({
  page,
}) => {
  await mockSchoolContextApis(page)
  await seedLastConfirmedSchool(page, schoolA)
  await page.goto('/admin/users/user-a/edit')

  const fullName = page.getByLabel('Full name')
  await expect(fullName).toBeVisible()
  await fullName.fill('Unsaved administrator edit')
  await page.getByRole('button', { name: 'Choose school' }).click()
  await expect(page.getByText('Discard unsaved changes?')).toBeVisible()
  await page.getByRole('button', { name: 'Stay' }).click()

  await expect(page).toHaveURL(/\/admin\/users\/user-a\/edit/)
  await expect(fullName).toHaveValue('Unsaved administrator edit')
  await expect(page.getByText(schoolA.name).first()).toBeVisible()
})

test('matching authoritative invalidation clears context but preserves the signed-in identity', async ({
  page,
}) => {
  await mockSchoolContextApis(page, { authoritativeInvalidation: true })
  await seedLastConfirmedSchool(page, schoolA)
  await page.goto('/admin/users')

  await expect(page.getByRole('heading', { name: 'Choose a school' })).toBeVisible()
  await expect(
    page.evaluate((key) => window.localStorage.getItem(key), lastApprovedSchoolKey),
  ).resolves.toBeNull()
  await expect(page.getByRole('button', { name: /Select Central School/ })).toHaveCount(2)
})

test('activates an inactive school, exposes it only after refresh, then selects it', async ({
  page,
}) => {
  await mockSchoolContextApis(page, { holdActivatedSchoolUntilRefresh: true })
  await page.goto('/admin/users')

  await expect(page.getByRole('heading', { name: 'Choose a school' })).toBeVisible()
  await page.getByRole('button', { name: 'Open School administration' }).click()
  await expect(page).toHaveURL(/\/admin\/schools/)

  const dialog = await launchSchoolLifecycle(page, inactiveSchool.name, 'Activate')
  await dialog.getByRole('button', { name: 'Confirm action' }).click()
  await expect(dialog).toBeHidden()

  await page.getByRole('button', { name: 'Choose school' }).click()
  await expect(page.getByRole('button', { name: new RegExp(inactiveSchool.name) })).toHaveCount(0)
  await page.getByRole('button', { name: 'Refresh active schools' }).click()
  const target = page.getByRole('button', {
    name: new RegExp(`Select ${inactiveSchool.name}, INEP ${inactiveSchool.inep_code}`),
  })
  await expect(target).toBeVisible()
  await target.click()

  await expect(page).toHaveURL(/\/admin\/schools/)
  await expect(page.getByText(inactiveSchool.name).first()).toBeVisible()
})

test('keeps a conflicted activation unavailable for selection', async ({ page }) => {
  await mockSchoolContextApis(page, { activationConflicts: 1 })
  await page.goto('/admin/users')
  await page.getByRole('button', { name: 'Open School administration' }).click()

  const dialog = await launchSchoolLifecycle(page, inactiveSchool.name, 'Activate')
  await dialog.getByRole('button', { name: 'Confirm action' }).click()
  await expect(dialog.getByText('This record changed after the page loaded.')).toBeVisible()
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await page.getByRole('button', { name: 'Choose school' }).click()

  await expect(
    page.getByRole('button', {
      name: new RegExp(`Select ${inactiveSchool.name}, INEP ${inactiveSchool.inep_code}`),
    }),
  ).toHaveCount(0)
})

test('deactivating the current school clears context without leaving the platform route', async ({
  page,
}) => {
  await mockSchoolContextApis(page)
  await seedLastConfirmedSchool(page, schoolA)
  await page.goto('/admin/schools')

  const dialog = await launchSchoolLifecycle(page, schoolA.name, 'Deactivate')
  await dialog.getByRole('button', { name: 'Confirm action' }).click()
  await expect(dialog).toBeHidden()

  await expect(page).toHaveURL(/\/admin\/schools/)
  await expect(page.getByText('No school selected')).toBeVisible()
  await expect(
    page.evaluate((key) => window.localStorage.getItem(key), lastApprovedSchoolKey),
  ).resolves.toBeNull()
})

test('completes at least 95 of 100 explicit selections within two seconds', async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== 'chromium', 'SC-004 performance protocol requires Chromium.')
  test.setTimeout(180_000)
  await mockSchoolContextApis(page, { delayAuthMs: 300, delayListMs: 300 })
  await seedLastConfirmedSchool(page, schoolA)
  await page.goto('/admin')

  const timings = []
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const target = attempt % 2 === 0 ? schoolB : schoolA
    await page.getByRole('button', { name: 'Choose school' }).click()
    const choice = page.getByRole('button', {
      name: new RegExp(`Select ${target.name}, INEP ${target.inep_code}`),
    })
    await expect(choice).toBeVisible()
    const startedAt = Date.now()
    await choice.click()
    await expect(page.getByRole('heading', { name: 'Choose a school' })).toHaveCount(0)
    await expect(page.getByText(target.name).first()).toBeVisible()
    timings.push(Date.now() - startedAt)
  }

  const withinTarget = timings.filter((duration) => duration <= 2_000).length
  const sorted = [...timings].sort((left, right) => left - right)
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1]
  test.info().annotations.push({
    type: 'SC-004 selection',
    description: `${withinTarget}/100 within 2s; p95=${p95}ms`,
  })
  expect(withinTarget).toBeGreaterThanOrEqual(95)
})

test('completes at least 95 of 100 restorations within two seconds', async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== 'chromium', 'SC-004 performance protocol requires Chromium.')
  test.setTimeout(120_000)
  await mockSchoolContextApis(page, { delayAuthMs: 300, delayListMs: 300 })
  await seedLastConfirmedSchool(page, schoolA)
  await page.goto('/admin/users')

  const timings = []
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const startedAt = Date.now()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Choose a school' })).toHaveCount(0)
    await expect(page.getByText(schoolA.name).first()).toBeVisible()
    timings.push(Date.now() - startedAt)
  }

  const withinTarget = timings.filter((duration) => duration <= 2_000).length
  const sorted = [...timings].sort((left, right) => left - right)
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1]
  test.info().annotations.push({
    type: 'SC-004 restoration',
    description: `${withinTarget}/100 within 2s; p95=${p95}ms`,
  })
  expect(withinTarget).toBeGreaterThanOrEqual(95)
})
