import { expect, test } from '@playwright/test'

const school = { id: 'school-1', name: 'North Campus', status: 'active' }
const emailedInvitationToken = 'email-invitation-token-abcdefghijklmnopqrstuvwxyz1234567890'
const permissions = [
  ['users.view', 'school'],
  ['users.manage', 'school'],
  ['roles.view', 'school'],
  ['account_lifecycle.manage', 'school'],
].map(([code, scope]) => ({ id: `${scope}-${code}`, code, scope, status: 'active' }))

function session(permissionRecords = permissions) {
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
      permissions: permissionRecords,
      resolved_school: school,
    },
  }
}

function user(id = 'user-1', status = 'active') {
  return {
    id,
    school_id: school.id,
    full_name: status === 'invited' ? 'Invited User' : 'Avery Stone',
    email: `${id}@example.test`,
    status,
    roles: [{ id: 'role-1', name: 'Teacher', scope: 'school', status: 'active' }],
  }
}

async function mockLifecycleApis(page, { denied = false } = {}) {
  const state = {
    users: [user()],
    lifecycleRequests: [],
    passwordDeliveryRequests: [],
    invitationRequests: 0,
    resendRequests: 0,
    userCreates: 0,
    lastUserCreateMode: null,
    setupRequests: 0,
    setupRequestBody: null,
    setupRequestPath: null,
    loginRequests: 0,
    hasSession: true,
  }
  const fulfill = (route, body, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()
    const schoolId = request.headers()['x-school-id'] ?? null

    if (path === '/api/v1/account-invitations/setup' && method === 'POST') {
      state.setupRequests += 1
      state.setupRequestBody = request.postDataJSON()
      state.setupRequestPath = path
      return fulfill(route, {
        data: { user_id: 'invited-1', school_id: school.id, status: 'active' },
      })
    }
    if (path === '/api/v1/auth/login' && method === 'POST') {
      state.loginRequests += 1
      state.hasSession = true
      return fulfill(route, session())
    }
    if (path === '/api/v1/auth/me') {
      if (!state.hasSession) {
        return fulfill(
          route,
          { error: { code: 'unauthenticated', message: 'Unauthenticated.', details: {} } },
          401,
        )
      }
      return fulfill(
        route,
        session(
          denied
            ? permissions.filter((entry) => entry.code !== 'account_lifecycle.manage')
            : permissions,
        ),
      )
    }
    if (path === '/api/v1/roles' && method === 'GET') {
      return fulfill(route, {
        data: [{ id: 'role-1', name: 'Teacher', scope: 'school', status: 'active' }],
        meta: { page: 1, per_page: 25, total: 1 },
      })
    }
    if (path === '/api/v1/users' && method === 'GET') {
      return fulfill(route, {
        data: state.users,
        meta: { page: 1, per_page: 25, total: state.users.length },
      })
    }
    if (path === '/api/v1/users' && method === 'POST') {
      state.userCreates += 1
      const body = request.postDataJSON()
      state.lastUserCreateMode = body.account_setup_mode
      const created = {
        ...user('invited-1', body.account_setup_mode === 'invitation' ? 'invited' : 'active'),
        full_name: body.full_name,
        email: body.email,
      }
      state.users.push(created)
      return fulfill(route, { data: created }, 201)
    }
    const detailMatch = path.match(/^\/api\/v1\/users\/([^/]+)$/)
    if (detailMatch && method === 'GET') {
      const found = state.users.find((entry) => entry.id === detailMatch[1])
      return found
        ? fulfill(route, { data: found })
        : fulfill(route, { error: { code: 'not_found' } }, 404)
    }
    const lockMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/account-lock$/)
    if (lockMatch) {
      state.lifecycleRequests.push({ path, method, schoolId })
      if (method === 'GET')
        return fulfill(route, {
          data: { user_id: lockMatch[1], school_id: school.id, status: 'none' },
        })
      if (method === 'POST')
        return fulfill(route, {
          data: {
            user_id: lockMatch[1],
            school_id: school.id,
            status: 'active',
            lock_type: 'administrative',
            locked_at: '2026-08-11T00:00:00Z',
          },
        })
      return fulfill(route, {
        data: { user_id: lockMatch[1], status: 'active', action: 'account_unlocked' },
      })
    }
    const passwordDeliveryMatch = path.match(/^\/api\/v1\/users\/([^/]+)\/password-delivery$/)
    if (passwordDeliveryMatch && method === 'POST') {
      state.passwordDeliveryRequests.push({
        path,
        method,
        schoolId,
        body: request.postData() ?? null,
      })
      return fulfill(
        route,
        {
          data: {
            status: 'requested',
            delivery_channel: 'email',
            delivery_requested_at: '2026-08-26T12:00:00Z',
            token: 'forbidden-delivery-token',
            password_url: 'https://private.test/forbidden-delivery-token',
            email: 'private-target@example.test',
            provider_diagnostic: 'private-provider-diagnostic',
          },
        },
        201,
      )
    }
    if (path === '/api/v1/account-invitations' && method === 'POST') {
      state.invitationRequests += 1
      return fulfill(
        route,
        {
          data: {
            id: 'invitation-1',
            user_id: 'invited-1',
            school_id: school.id,
            scope: 'school',
            status: 'pending',
            expires_at: '2026-08-18T00:00:00Z',
            delivery_channel: 'email',
            delivery_requested_at: '2026-08-11T00:00:00Z',
          },
        },
        201,
      )
    }
    if (path.includes('/resend')) state.resendRequests += 1
    return fulfill(route, { data: [] })
  })

  return state
}

test('authorized lifecycle detail uses exact school mode and remains responsive', async ({
  page,
}) => {
  const state = await mockLifecycleApis(page)
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/admin/users/user-1?user_mode=school')
    await expect(page.getByRole('heading', { name: 'Avery Stone' })).toBeVisible()
    await expect(page.getByText('Account lifecycle actions')).toBeVisible()
    expect(state.lifecycleRequests.at(-1)).toMatchObject({ method: 'GET', schoolId: school.id })
    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      rootOverflowX: getComputedStyle(document.documentElement).overflowX,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      offenders: [...document.querySelectorAll('body *')]
        .filter((element) => {
          const rect = element.getBoundingClientRect()
          return (
            rect.left < -2 ||
            rect.right > document.documentElement.clientWidth + 2 ||
            element.scrollWidth > element.clientWidth + 2
          )
        })
        .slice(0, 8)
        .map((element) => ({
          tag: element.tagName,
          className: element.className?.toString?.() ?? '',
          left: element.getBoundingClientRect().left,
          right: element.getBoundingClientRect().right,
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
        })),
    }))
    expect(overflow.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(
      overflow.clientWidth + 2,
    )
    expect(['hidden', 'clip']).not.toContain(overflow.rootOverflowX)
    expect(['hidden', 'clip']).not.toContain(overflow.bodyOverflowX)

    if (width === 390) {
      const lockButton = page.getByRole('button', { name: 'Lock account' })
      await lockButton.focus()
      await page.keyboard.press('Enter')
      const dialog = page.getByRole('dialog', { name: 'Lock account' })
      await expect(dialog).toBeVisible()
      await expect(dialog.getByLabel('Reason')).toBeVisible()
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(
        true,
      )
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(lockButton).toBeFocused()
    }
  }
  expect(state.resendRequests).toBe(0)
})

test('denied lifecycle authority unmounts sections and sends zero lifecycle requests', async ({
  page,
}) => {
  const state = await mockLifecycleApis(page, { denied: true })
  await page.goto('/admin/users/user-1?user_mode=school')
  await expect(page.getByRole('heading', { name: 'Avery Stone' })).toBeVisible()
  await expect(page.getByText('Account lifecycle actions')).toHaveCount(0)
  await expect(page.getByText('Account lock')).toHaveCount(0)
  expect(state.lifecycleRequests).toHaveLength(0)
  expect(state.passwordDeliveryRequests).toHaveLength(0)
})

test('authorized password delivery stays secret-free and clears on target route change', async ({
  page,
}) => {
  const state = await mockLifecycleApis(page)
  state.users.push(user('user-2'))
  await page.goto('/admin/users/user-1?user_mode=school')

  const deliveryButton = page.getByRole('button', { name: 'Send password link' })
  await deliveryButton.focus()
  await page.keyboard.press('Enter')
  const deliveryResult = page.locator('[data-test="password-delivery-result"]')
  await expect(deliveryResult).toContainText('Password email submission accepted.')
  await expect(deliveryButton).toBeFocused()

  expect(state.passwordDeliveryRequests).toEqual([
    {
      path: '/api/v1/users/user-1/password-delivery',
      method: 'POST',
      schoolId: school.id,
      body: null,
    },
  ])
  const forbidden = [
    'forbidden-delivery-token',
    'private-target@example.test',
    'private-provider-diagnostic',
    'password_url',
  ]
  const rendered = await page.locator('body').innerText()
  const browserStorage = await page.evaluate(() =>
    JSON.stringify({ ...window.localStorage, ...window.sessionStorage }),
  )
  for (const value of forbidden) {
    expect(rendered).not.toContain(value)
    expect(browserStorage).not.toContain(value)
    expect(page.url()).not.toContain(value)
  }

  await page.goto('/admin/users/user-2?user_mode=school')
  await expect(page.getByRole('heading', { name: 'Avery Stone' })).toBeVisible()
  await expect(deliveryResult).toHaveCount(0)
})

test('invitation-mode create persists once, invites explicitly, and reloads by UUID only', async ({
  page,
}) => {
  const state = await mockLifecycleApis(page)
  await page.goto('/admin/users/create')
  await page.getByLabel('Full name').fill('Invited User')
  await page.getByLabel('Email').fill('invited@example.test')
  await expect(page.getByLabel('Account setup')).toHaveCount(0)
  await expect(page.getByText('Active immediately')).toHaveCount(0)
  await page.getByLabel('Roles').press('Enter')
  await page.getByRole('option', { name: 'Teacher' }).click()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.getByText('The invited user was saved')).toBeVisible()
  expect(state.userCreates).toBe(1)
  expect(state.lastUserCreateMode).toBe('invitation')
  expect(state.invitationRequests).toBe(0)
  await page.getByRole('button', { name: 'Create invitation' }).click()
  await expect(page.getByText('pending')).toBeVisible()
  expect(state.invitationRequests).toBe(1)
  expect(state.resendRequests).toBe(0)
  const rendered = await page.locator('body').innerText()
  expect(rendered).not.toContain('delivery_metadata')
  expect(rendered.toLowerCase()).not.toContain('resend')
  expect(rendered).not.toContain('invitationToken')
  const browserStorage = await page.evaluate(() =>
    JSON.stringify({ ...window.localStorage, ...window.sessionStorage }),
  )
  expect(browserStorage).not.toContain('invited@example.test')
  expect(browserStorage).not.toContain('delivery_metadata')

  await page.reload()
  await expect(page.getByText('The invited user was saved')).toBeVisible()
  expect(state.userCreates).toBe(1)
})

test('emailed setup link activates account before normal sign in', async ({ page }) => {
  const state = await mockLifecycleApis(page)

  await page.goto(`/auth/account-invitations/setup#token=${emailedInvitationToken}`)
  await expect(page).toHaveURL(/\/auth\/account-invitations\/setup$/)
  await page.getByLabel('Password').fill('correct-horse-battery-staple')
  await page.getByRole('button', { name: 'Set password' }).click()
  await expect(page.getByText('Password setup complete')).toBeVisible()
  expect(state.setupRequests).toBe(1)
  expect(state.setupRequestPath).toBe('/api/v1/account-invitations/setup')
  expect(state.setupRequestBody).toEqual({
    invitation_token: emailedInvitationToken,
    password: 'correct-horse-battery-staple',
  })

  state.hasSession = false
  await page.goto('/auth/login')
  await page.getByLabel('Email address').fill('invited@example.test')
  await page.getByLabel('Password').fill('correct-horse-battery-staple')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect.poll(() => state.loginRequests).toBe(1)
})
