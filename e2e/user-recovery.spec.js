import { expect, test } from '@playwright/test'

const school = { id: 'school-1', name: 'North Campus', status: 'active' }
const recoveryUserId = 'f34c45fe-7ee1-4bec-99b1-26cc2cad0456'
const permissions = [
  ['users.view', 'school'],
  ['users.manage', 'school'],
  ['roles.view', 'school'],
  ['account_lifecycle.manage', 'school'],
].map(([code, scope]) => ({ id: `${scope}-${code}`, code, scope, status: 'active' }))

function deferred() {
  let resolve
  const promise = new Promise((nextResolve) => {
    resolve = nextResolve
  })
  return { promise, resolve }
}

function session(activeSchool = school) {
  return {
    data: {
      token: 'e2e-token',
      token_expires_at: '2026-12-31T23:59:59Z',
      user: {
        id: 'admin-1',
        full_name: 'School Admin',
        email: 'admin@example.test',
        status: 'active',
      },
      roles: [{ id: 'admin-role', name: 'School Admin', scope: 'school', status: 'active' }],
      permissions,
      resolved_school: activeSchool,
    },
  }
}

function retainedUser() {
  return {
    id: recoveryUserId,
    school_id: school.id,
    full_name: 'Restored User',
    email: 'joao@test.com.br',
    status: 'active',
    roles: [{ id: 'role-1', name: 'Teacher', scope: 'school', status: 'active' }],
  }
}

async function mockRecoveryApis(page) {
  const state = {
    createCalls: 0,
    restoreCalls: 0,
    detailCalls: 0,
    events: [],
    restoreBody: null,
    restoreSchoolId: null,
    createMode: 'recoverable',
    createGate: null,
    activeSchool: school,
  }
  const fulfill = (route, body, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()

    if (path === '/api/v1/auth/me') return fulfill(route, session(state.activeSchool))
    if (path === '/api/v1/roles' && method === 'GET') {
      return fulfill(route, {
        data: [{ id: 'role-1', name: 'Teacher', scope: 'school', status: 'active' }],
        meta: { page: 1, per_page: 25, total: 1 },
      })
    }
    if (path === '/api/v1/users' && method === 'POST') {
      state.createCalls += 1
      if (state.createGate) await state.createGate.promise
      if (state.createMode === 'generic') {
        return fulfill(
          route,
          {
            error: {
              code: 'validation_failed',
              message: 'Unsafe duplicate message',
              details: { fields: { email: ['This email is unavailable.'] } },
            },
          },
          422,
        )
      }
      if (state.createMode === 'malformed') {
        return fulfill(
          route,
          {
            error: {
              code: 'recoverable_user_conflict',
              message: 'Unsafe retained account details',
              details: { user_id: 'not-a-uuid', recommended_action: 'restore' },
            },
          },
          409,
        )
      }
      state.events.push('create-conflict')
      return fulfill(
        route,
        {
          error: {
            code: 'recoverable_user_conflict',
            message: 'A retained user can be restored.',
            details: { user_id: recoveryUserId, recommended_action: 'restore' },
          },
        },
        409,
      )
    }
    if (path === `/api/v1/users/${recoveryUserId}/restore` && method === 'POST') {
      state.restoreCalls += 1
      state.events.push('restore')
      state.restoreBody = request.postDataJSON()
      state.restoreSchoolId = request.headers()['x-school-id'] ?? null
      return fulfill(route, { data: retainedUser() })
    }
    if (path === `/api/v1/users/${recoveryUserId}` && method === 'GET') {
      state.detailCalls += 1
      state.events.push('detail')
      return fulfill(route, { data: retainedUser() })
    }
    if (path === `/api/v1/users/${recoveryUserId}/account-lock` && method === 'GET') {
      return fulfill(route, {
        data: { user_id: recoveryUserId, school_id: school.id, status: 'none' },
      })
    }
    return fulfill(route, { data: [] })
  })

  return state
}

async function fillCreateForm(page, email = 'joao@test.com.br') {
  await page.getByLabel('Full name').fill('New Draft Name')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Roles').press('Enter')
  await page.getByRole('option', { name: 'Teacher' }).click()
  await page.keyboard.press('Escape')
}

test('recoverable conflict needs two deliberate actions and restores exactly once', async ({
  page,
}) => {
  const state = await mockRecoveryApis(page)
  await page.goto('/admin/users/create')
  await fillCreateForm(page)
  await page.getByRole('button', { name: 'Create' }).click()

  const warning = page.getByRole('status')
  await expect(warning).toContainText('An existing user can be restored.')
  await expect(
    page.getByText('This operation conflicts with the current record state.'),
  ).toHaveCount(0)

  let deliberateActions = 0
  await warning.getByRole('button', { name: 'Restore existing user' }).click()
  deliberateActions += 1

  const dialog = page.getByRole('dialog', { name: 'Restore existing user' })
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Effective date').fill('2026-08-23')
  await dialog.getByLabel('Reason').fill('Approved identity recovery')
  await dialog.getByRole('button', { name: 'Confirm action' }).click()
  deliberateActions += 1

  await expect(page).toHaveURL(new RegExp(`/admin/users/${recoveryUserId}\\?user_mode=school$`))
  await expect(page.getByRole('heading', { name: 'Restored User' })).toBeVisible()
  expect(deliberateActions).toBeLessThanOrEqual(2)
  expect(state.createCalls).toBe(1)
  expect(state.restoreCalls).toBe(1)
  expect(state.detailCalls).toBe(1)
  expect(state.events).toEqual(['create-conflict', 'restore', 'detail'])
  expect(state.restoreBody).toEqual({
    effective_at: '2026-08-23',
    reason: 'Approved identity recovery',
  })
  expect(state.restoreSchoolId).toBe(school.id)
})

test('generic and malformed duplicates never expose recovery or discovery', async ({ page }) => {
  const state = await mockRecoveryApis(page)

  for (const mode of ['generic', 'malformed']) {
    state.createMode = mode
    await page.goto('/admin/users/create')
    await fillCreateForm(page)
    await page.getByRole('button', { name: 'Create' }).click()

    await expect(page.getByRole('button', { name: 'Restore existing user' })).toHaveCount(0)
    await expect(page.getByText('Unsafe duplicate message')).toHaveCount(0)
    await expect(page.getByText('Unsafe retained account details')).toHaveCount(0)
    const rendered = await page.locator('body').innerText()
    expect(rendered).not.toContain(recoveryUserId)
    expect(
      JSON.stringify(await page.evaluate(() => ({ ...localStorage, ...sessionStorage }))),
    ).not.toContain(recoveryUserId)
  }

  expect(state.restoreCalls).toBe(0)
  expect(state.detailCalls).toBe(0)
})

test('repeated create and stale email, school, and route results remain inert', async ({
  page,
}) => {
  const state = await mockRecoveryApis(page)
  state.createGate = deferred()
  await page.goto('/admin/users/create')
  await fillCreateForm(page)
  const createButton = page.getByRole('button', { name: 'Create' })
  await createButton.evaluate((button) => {
    button.click()
    button.click()
  })
  await page.getByLabel('Email').fill('edited@test.com.br')
  state.createGate.resolve()

  await expect(page.getByRole('button', { name: 'Restore existing user' })).toHaveCount(0)
  expect(state.createCalls).toBe(1)

  state.createGate = deferred()
  await page.getByLabel('Email').fill('joao@test.com.br')
  await createButton.click()
  state.activeSchool = { id: 'school-2', name: 'South Campus', status: 'active' }
  const reload = page.reload()
  state.createGate.resolve()
  await reload
  await expect(page.getByText('South Campus')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Restore existing user' })).toHaveCount(0)

  state.createGate = deferred()
  await fillCreateForm(page, 'route-change@test.com.br')
  await page.getByRole('button', { name: 'Create' }).click()
  await page.goto('/admin/users')
  state.createGate.resolve()
  await expect(page).toHaveURL(/\/admin\/users$/)
  await expect(page.getByRole('button', { name: 'Restore existing user' })).toHaveCount(0)
  expect(state.restoreCalls).toBe(0)
  expect(state.detailCalls).toBe(0)
})

test('warning and dialog keep responsive keyboard and focus behavior', async ({ page }) => {
  const state = await mockRecoveryApis(page)

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    state.createGate = deferred()
    await page.goto('/admin/users/create')
    await fillCreateForm(page)
    const createButton = page.getByRole('button', { name: 'Create' })
    await createButton.click()
    const emailField = page.getByLabel('Email')
    await emailField.focus()
    await expect(emailField).toBeFocused()
    state.createGate.resolve()

    const warning = page.getByRole('status')
    await expect(warning).toHaveAttribute('aria-live', 'polite')
    await expect(warning).toHaveAttribute('aria-atomic', 'true')
    await expect(emailField).toBeFocused()
    expect(await warning.innerText()).not.toContain(recoveryUserId)
    expect(await warning.innerHTML()).not.toContain(recoveryUserId)
    const restoreButton = warning.getByRole('button', { name: 'Restore existing user' })
    await restoreButton.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Restore existing user' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(warning).toBeHidden()

    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2)
  }
})
