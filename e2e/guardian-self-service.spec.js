import { expect, test } from '@playwright/test'

const activeSchool = { id: 'school-1', name: 'North Campus', code: 'NC', status: 'active' }
const currentPeriod = { id: 'period-2026', name: '2026 Term 1', status: 'active' }
const linkedStudent = {
  id: 'student-1',
  school_id: activeSchool.id,
  registration_number: 'REG-1001',
  full_name: 'Ada Student',
  status: 'active',
  relationship_label: 'Mother',
}
const detail = {
  ...linkedStudent,
  first_name: 'Ada',
  last_name: 'Student',
  date_of_birth: '2012-03-04',
  enrollment_summary: {
    grade_level: '7',
    academic_year_label: '2026',
  },
}
const academicSummary = {
  student: linkedStudent,
  academic_period_id: currentPeriod.id,
  grade_summary: { status: 'available', average: 92, scale: '100', last_updated_at: '2026-07-01' },
  attendance_summary: { status: 'available', total_absences: 1, total_tardies: 0, attendance_rate: 98 },
  learning_sets: [
    {
      learning_set_id: 'set-1',
      title: 'Algebra practice',
      status: 'in_progress',
      progress_percent: 50,
      last_activity_at: '2026-07-01',
    },
  ],
}
const contactView = {
  student: linkedStudent,
  guardian_contact: { name: 'Guardian One', email: 'guardian@example.test', phone: null },
  relationship_label: 'Mother',
  student_primary_contact: { name: 'School Office', email: null, phone: '555-0100' },
}

function envelope(data) {
  return { data, meta: { page: 1, per_page: 25, total: Array.isArray(data) ? data.length : 1 } }
}

async function fulfill(route, json, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(json),
  })
}

async function mockGuardianApis(page, options = {}) {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname

    if (path === '/api/v1/auth/me') {
      return fulfill(route, {
        data: {
          token: 'e2e-token',
          token_expires_at: '2026-12-31T23:59:59Z',
          user: {
            id: 'guardian-1',
            full_name: 'Guardian User',
            email: 'guardian@example.test',
            status: 'active',
            guardian_access_state: options.noGuardianLink ? 'no-guardian-link' : 'active',
          },
          roles: [{ id: 'role-1', code: 'guardian', name: 'Guardian', scope: 'school', status: 'active' }],
          permissions: [{ id: 'perm-all', code: '*', name: 'All', scope: 'platform', status: 'active' }],
          resolved_school: options.noActiveSchool ? null : activeSchool,
          current_academic_period: options.noAcademicPeriod ? null : currentPeriod,
        },
      })
    }

    if (path === '/api/v1/guardian/students') {
      return fulfill(route, envelope(options.emptyStudents ? [] : [linkedStudent]))
    }

    if (path === '/api/v1/guardian/students/student-1') return fulfill(route, { data: detail })
    if (path === '/api/v1/guardian/students/missing') return fulfill(route, { error: { code: 'NOT_FOUND' } }, 404)
    if (path === '/api/v1/guardian/students/student-1/academics') {
      return fulfill(route, { data: options.unavailableSummary ? { ...academicSummary, grade_summary: null, attendance_summary: null, learning_sets: [] } : academicSummary })
    }
    if (path === '/api/v1/guardian/students/student-1/contacts') return fulfill(route, { data: contactView })

    return fulfill(route, envelope([]))
  })
}

async function expectNoDocumentOverflow(page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(metrics.scrollWidth, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.clientWidth + 2)
}

async function expectKeyboardReachable(page) {
  const reachable = await page.evaluate(() => {
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
    const candidates = [...document.querySelectorAll(selector)].filter((element) => {
      const rect = element.getBoundingClientRect()
      const style = window.getComputedStyle(element)
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
    })
    return candidates.length > 0 && candidates.some((element) => {
      element.focus()
      return document.activeElement === element
    })
  })
  expect(reachable).toBe(true)
}

async function expectHeadingsAndLabels(page) {
  const audit = await page.evaluate(() => ({
    mainCount: document.querySelectorAll('main').length,
    headingCount: document.querySelectorAll('h1,h2,h3,h4,h5,h6').length,
    unlabeledControls: [...document.querySelectorAll('button,a[href],input,textarea,select')]
      .filter((element) => {
        const text = element.textContent?.trim()
        const label = element.getAttribute('aria-label') || element.getAttribute('title')
        return !text && !label
      }).length,
  }))
  expect(audit.mainCount).toBeGreaterThanOrEqual(1)
  expect(audit.headingCount).toBeGreaterThanOrEqual(1)
  expect(audit.unlabeledControls, JSON.stringify(audit)).toBe(0)
}

async function expectReadableContrast(page) {
  const failures = await page.evaluate(() => {
    function channel(value) {
      value /= 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    }
    function luminance(rgb) {
      return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
    }
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    function oklchToRgb(value) {
      const [lRaw, cRaw, hRaw = 0] = value
        .replace(/oklch\(|\)/g, '')
        .split(/\s+/)
        .filter((part) => part && part !== '/')
        .slice(0, 3)
      const L = lRaw.endsWith('%') ? Number.parseFloat(lRaw) / 100 : Number.parseFloat(lRaw)
      const C = Number.parseFloat(cRaw)
      const h = Number.parseFloat(hRaw) * Math.PI / 180
      const a = C * Math.cos(h)
      const b = C * Math.sin(h)
      const lPrime = L + 0.3963377774 * a + 0.2158037573 * b
      const mPrime = L - 0.1055613458 * a - 0.0638541728 * b
      const sPrime = L - 0.0894841775 * a - 1.291485548 * b
      const l = lPrime ** 3
      const m = mPrime ** 3
      const s = sPrime ** 3
      const linear = [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
      ]
      return linear.map((channelValue) => {
        const clamped = Math.min(1, Math.max(0, channelValue))
        const srgb = clamped <= 0.0031308
          ? 12.92 * clamped
          : 1.055 * (clamped ** (1 / 2.4)) - 0.055
        return Math.round(srgb * 255)
      })
    }
    function parseRgb(value) {
      if (value.startsWith('oklch(')) return oklchToRgb(value)
      context.fillStyle = '#000000'
      context.fillStyle = value
      const normalized = context.fillStyle
      if (normalized.startsWith('#')) {
        const hex = normalized.slice(1)
        if (hex.length === 6) {
          return [
            Number.parseInt(hex.slice(0, 2), 16),
            Number.parseInt(hex.slice(2, 4), 16),
            Number.parseInt(hex.slice(4, 6), 16),
          ]
        }
      }
      return normalized.match(/\d+(\.\d+)?/g)?.slice(0, 3).map(Number) ?? [0, 0, 0]
    }
    function effectiveBackground(element) {
      let current = element
      while (current) {
        const bg = window.getComputedStyle(current).backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg
        current = current.parentElement
      }
      return 'rgb(255,255,255)'
    }
    function contrast(fg, bg) {
      const lighter = Math.max(luminance(fg), luminance(bg))
      const darker = Math.min(luminance(fg), luminance(bg))
      return (lighter + 0.05) / (darker + 0.05)
    }
    return [...document.body.querySelectorAll('main *')]
      .filter((element) => element.children.length === 0 && element.textContent.trim().length > 0)
      .map((element) => {
        const style = window.getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return {
          text: element.textContent.trim().slice(0, 80),
          ratio: contrast(parseRgb(style.color), parseRgb(effectiveBackground(element))),
          fontSize: Number.parseFloat(style.fontSize),
          width: rect.width,
          height: rect.height,
        }
      })
      .filter((entry) => entry.width > 0 && entry.height > 0)
      .filter((entry) => entry.ratio < (entry.fontSize >= 18 ? 3 : 4.5))
      .slice(0, 5)
  })
  expect(failures, JSON.stringify(failures)).toEqual([])
}

async function gotoTimed(page, path, text) {
  const startedAt = await page.evaluate(() => performance.now())
  await page.goto(path)
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible()
  return (await page.evaluate(() => performance.now())) - startedAt
}

test.beforeEach(async ({ page }) => {
  await mockGuardianApis(page)
})

test('guardian routes meet responsive, keyboard, heading, label, and contrast checks', async ({ page }) => {
  const routes = [
    ['/guardian/workspace/students', 'Linked students'],
    ['/guardian/workspace/students/student-1', 'Ada Student'],
    ['/guardian/workspace/students/student-1/academics', 'Grade summary'],
    ['/guardian/workspace/students/student-1/contacts', 'Guardian contact'],
  ]

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 920 })
    for (const [path, text] of routes) {
      await page.goto(path)
      await expect(page.getByText(text, { exact: false }).first()).toBeVisible()
      await expectNoDocumentOverflow(page)
      await expectKeyboardReachable(page)
      await expectHeadingsAndLabels(page)
      await expectReadableContrast(page)
    }
  }
})

test('guardian workflows meet timed usability and render budgets', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 920 })

  const listMs = await gotoTimed(page, '/guardian/workspace/students', 'Ada Student')
  expect(listMs).toBeLessThan(1500)

  const detailWorkflowStart = await page.evaluate(() => performance.now())
  await page.getByRole('button', { name: 'Open' }).click()
  await expect(page.getByText('Limited guardian-visible profile')).toBeVisible()
  const detailWorkflowMs = (await page.evaluate(() => performance.now())) - detailWorkflowStart
  expect(detailWorkflowMs).toBeLessThan(120_000)
  expect(detailWorkflowMs).toBeLessThan(2000)

  const academicsMs = await gotoTimed(page, '/guardian/workspace/students/student-1/academics', 'Algebra practice')
  expect(academicsMs).toBeLessThan(180_000)
  expect(academicsMs).toBeLessThan(2000)

  const contactsMs = await gotoTimed(page, '/guardian/workspace/students/student-1/contacts', 'School Office')
  expect(contactsMs).toBeLessThan(120_000)
  expect(contactsMs).toBeLessThan(2000)
})

test('guardian state distinction proxy covers empty, gates, unavailable, and not-found states', async ({ browser }) => {
  const scenarios = [
    { options: { emptyStudents: true }, path: '/guardian/workspace/students', text: 'No linked students' },
    { options: { noGuardianLink: true }, path: '/guardian/workspace/students', text: 'No approved guardian link' },
    { options: { noAcademicPeriod: true }, path: '/guardian/workspace/students/student-1/academics', text: 'No current academic period' },
    { options: { unavailableSummary: true }, path: '/guardian/workspace/students/student-1/academics', text: 'Academic summary values are unavailable' },
    { options: {}, path: '/guardian/workspace/students/missing', text: 'requested student is unavailable' },
    { options: {}, path: '/guardian/workspace/students/student-1/contacts', text: 'Not provided' },
  ]

  for (const scenario of scenarios) {
    const context = await browser.newContext()
    const page = await context.newPage()
    await mockGuardianApis(page, scenario.options)
    await page.goto(scenario.path)
    await expect(page.getByText(scenario.text, { exact: false }).first()).toBeVisible()
    await context.close()
  }
})
