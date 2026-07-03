import { expect, test } from '@playwright/test'

const activeSchool = { id: 'school-1', name: 'North Campus', code: 'NC', status: 'active', timezone: 'America/Sao_Paulo' }
const catalog = {
  domains: [{ id: 'attendance', label: 'Attendance summary' }],
  fields: [{ id: 'student_name', label: 'Student name' }],
  filters: [{ id: 'academic_period_id', label: 'Academic period' }],
  operators: ['equals'],
  grouping: ['grade_level'],
  sorting: ['student_name'],
  output_formats: ['pdf', 'csv', 'xlsx'],
  complexity_limits: { fields: 25, filters: 10, grouping: 2, sorting: 3 },
}
const generatedRun = {
  id: 'run-generated',
  school_id: activeSchool.id,
  report_type: 'attendance',
  report_source: 'built-in',
  generation_status: 'generated',
  output_formats: ['pdf', 'csv', 'xlsx'],
  generated_at: '2026-07-03T12:00:00Z',
  output_expires_at: '2026-10-01T12:00:00Z',
  outputs: [
    { format: 'pdf', availability: 'available' },
    { format: 'csv', availability: 'expired' },
    { format: 'xlsx', availability: 'failed' },
  ],
}
const runs = [
  generatedRun,
  { ...generatedRun, id: 'run-requested', generation_status: 'requested', outputs: [{ format: 'pdf', availability: 'pending' }] },
  { ...generatedRun, id: 'run-generating', generation_status: 'generating', outputs: [{ format: 'pdf', availability: 'pending' }] },
  { ...generatedRun, id: 'run-failed', generation_status: 'failed', outputs: [{ format: 'pdf', availability: 'failed' }] },
  { ...generatedRun, id: 'run-canceled', generation_status: 'canceled', outputs: [{ format: 'pdf', availability: 'unsupported' }] },
]
const activeDefinition = {
  id: 'definition-1',
  school_id: activeSchool.id,
  name: 'Attendance custom',
  description: 'Attendance report',
  domain: 'attendance',
  fields: ['student_name'],
  filters: [],
  grouping: [],
  sorting: [],
  output_formats: ['pdf'],
  lifecycle_state: 'active',
}

function envelope(data) {
  return { data, meta: { page: 1, per_page: 25, total: Array.isArray(data) ? data.length : 1 } }
}

async function fulfill(route, json, status = 200, headers = {}) {
  await route.fulfill({
    status,
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof json === 'string' ? json : JSON.stringify(json),
  })
}

async function mockReportingApis(page) {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()

    if (path === '/api/v1/auth/me') {
      return fulfill(route, {
        data: {
          token: 'e2e-token',
          token_expires_at: '2026-12-31T23:59:59Z',
          user: { id: 'reporter-1', full_name: 'Reporting User', email: 'reporter@example.test', status: 'active' },
          roles: [{ id: 'role-1', code: 'reporting-user', name: 'Reporting User', scope: 'school', status: 'active' }],
          permissions: [
            { id: 'perm-1', code: 'reports.view', name: 'Reports', scope: 'school', status: 'active' },
            { id: 'perm-2', code: 'reports.lifecycle', name: 'Report lifecycle', scope: 'school', status: 'active' },
            { id: 'perm-3', code: 'reports.definitions', name: 'Report definitions', scope: 'school', status: 'active' },
          ],
          resolved_school: activeSchool,
        },
      })
    }
    if (path === '/api/v1/report-catalog') return fulfill(route, { data: catalog })
    if (path === '/api/v1/reports' && method === 'GET') return fulfill(route, envelope(runs))
    if (path === '/api/v1/reports' && method === 'POST') {
      return fulfill(route, { data: { ...generatedRun, id: 'run-new', generation_status: 'requested' } }, 202)
    }
    if (path === '/api/v1/reports/run-generated/download') {
      return route.fulfill({
        status: 200,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="attendance.pdf"',
        },
        body: 'PDF',
      })
    }
    if (path === '/api/v1/report-definitions' && method === 'GET') return fulfill(route, envelope([activeDefinition]))
    if (path === '/api/v1/report-definitions' && method === 'POST') return fulfill(route, { data: { ...activeDefinition, id: 'definition-new', lifecycle_state: 'draft' } }, 201)
    if (path.endsWith('/activate')) return fulfill(route, { data: { ...activeDefinition, lifecycle_state: 'active' } })
    if (path.endsWith('/deactivate')) return fulfill(route, { data: { ...activeDefinition, lifecycle_state: 'inactive' } })
    return fulfill(route, envelope([]))
  })
}

async function selectFirstOption(page, label) {
  await page.locator('.el-form-item', { hasText: label }).locator('.el-select').first().click()
  await page.locator('.el-select-dropdown__item').first().click()
}

test('reporting workspace timed usability and performance checks', async ({ page }) => {
  await mockReportingApis(page)
  const perf = {}

  perf.routeStart = performance.now()
  await page.goto('/reporting')
  await expect(page.getByRole('heading', { name: 'Report history' })).toBeVisible()
  perf.routeMs = performance.now() - perf.routeStart

  const expectedStates = ['Generated', 'Requested', 'Generating', 'Failed', 'Canceled']
  for (const state of expectedStates) {
    await expect(page.getByText(state, { exact: true }).first()).toBeVisible()
  }

  perf.downloadStart = performance.now()
  await page.getByRole('button', { name: 'Open' }).first().click()
  await expect(page.getByRole('heading', { name: 'attendance' }).first()).toBeVisible()
  await expect(page.getByText('Expired', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Download' }).first().click()
  await expect(page.getByText('Action completed.')).toBeVisible()
  perf.downloadMs = performance.now() - perf.downloadStart

  perf.requestStart = performance.now()
  await page.getByRole('button', { name: 'Report catalog' }).click()
  await expect(page.getByRole('heading', { name: 'Approved report catalog' })).toBeVisible()
  await selectFirstOption(page, 'Report type')
  await page.getByText('PDF').click()
  await page.getByRole('button', { name: 'Request report' }).click()
  await expect(page.getByRole('heading', { name: 'attendance' }).first()).toBeVisible()
  perf.requestMs = performance.now() - perf.requestStart

  perf.definitionStart = performance.now()
  await page.getByRole('button', { name: 'Custom definitions' }).click()
  await expect(page.getByText('Attendance custom')).toBeVisible()
  await page.getByRole('button', { name: 'Open' }).first().click()
  await page.getByRole('button', { name: 'Request report' }).click()
  await page.getByRole('button', { name: 'Request report' }).click()
  await expect(page.getByRole('heading', { name: 'attendance' }).first()).toBeVisible()
  perf.definitionMs = performance.now() - perf.definitionStart

  perf.renderMs = await page.evaluate(() => performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd)

  expect(perf.routeMs).toBeLessThan(2000)
  expect(perf.renderMs).toBeLessThan(1500)
  expect(perf.requestMs).toBeLessThan(180000)
  expect(perf.downloadMs).toBeLessThan(120000)
  expect(perf.definitionMs).toBeLessThan(300000)
})
