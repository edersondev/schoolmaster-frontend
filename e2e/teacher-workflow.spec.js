import { expect, test } from '@playwright/test'

const activeSchool = { id: 'school-1', name: 'North Campus', code: 'NC', status: 'active' }
const contentItem = {
  id: 'content-1',
  school_id: activeSchool.id,
  title: 'Algebra guide',
  description: 'Clean PDF material',
  content_type: 'pdf',
  scan_status: 'clean',
  status: 'active',
  download_available: true,
}
const contentStatusVariants = [
  contentItem,
  {
    ...contentItem,
    id: 'content-2',
    title: 'Pending scan guide',
    scan_status: 'pending',
    status: 'restored',
    download_available: false,
  },
  {
    ...contentItem,
    id: 'content-3',
    title: 'Failed scan guide',
    scan_status: 'failed',
    status: 'unavailable',
    download_available: false,
  },
  {
    ...contentItem,
    id: 'content-4',
    title: 'Conflict guide',
    scan_status: 'clean',
    status: 'conflict',
    download_available: false,
  },
]
const questionnaire = {
  id: 'questionnaire-1',
  school_id: activeSchool.id,
  title: 'Linear equations check',
  description: 'Formative activity',
  status: 'inactive',
  questions: [{ type: 'short_text', prompt: 'Solve x + 2 = 4', sequence: 1 }],
}
const learningSet = {
  id: 'learning-set-1',
  school_id: activeSchool.id,
  academic_period_id: 'period-2026',
  title: 'Week 1 algebra',
  description: 'Read-only detail',
  status: 'deleted',
  entries: [{ type: 'content_item', id: contentItem.id }],
  assignments: [{ student_profile_id: 'student-1' }],
}
const grade = {
  id: 'grade-1',
  school_id: activeSchool.id,
  student_profile_id: 'student-1',
  academic_period_id: 'period-2026',
  grade_value: 91,
  current_value: 91,
  original_value: 88,
  status: 'active',
  correction_history: [{ id: 'correction-1', reason_summary: 'Rounded rubric total', new_value: 91 }],
}
const attendance = {
  id: 'attendance-1',
  school_id: activeSchool.id,
  student_profile_id: 'student-1',
  academic_period_id: 'period-2026',
  attendance_date: '2026-07-01',
  attendance_status: 'present',
  current_value: 'present',
  original_value: 'late',
  status: 'inactive',
  correction_history: [],
}

function envelope(data) {
  return { data, meta: { page: 1, per_page: 15, total: Array.isArray(data) ? data.length : 1 } }
}

async function fulfill(route, json) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(json),
  })
}

async function mockTeacherWorkflowApis(page) {
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
          user: { id: 'teacher-1', full_name: 'Teacher User', email: 'teacher@example.test', status: 'active' },
          roles: [{ id: 'role-1', code: 'teacher', name: 'Teacher', scope: 'school', status: 'active' }],
          permissions: [{ id: 'perm-all', code: '*', name: 'All', scope: 'platform', status: 'active' }],
          resolved_school: activeSchool,
        },
      })
    }

    if (path === '/api/v1/academic-periods') {
      return fulfill(route, envelope([{ id: 'period-2026', name: '2026 Term 1', status: 'active', is_current: true }]))
    }

    if (path === '/api/v1/teacher-assignments') {
      return fulfill(route, envelope([{ id: 'assignment-1', class_section_id: 'class-1', academic_period_id: 'period-2026', status: 'active' }]))
    }

    if (path === '/api/v1/class-sections/class-1/memberships') {
      return fulfill(route, envelope([{ id: 'membership-1', student_profile_id: 'student-1', status: 'active' }]))
    }

    if (path === '/api/v1/teacher-content' && method === 'GET') return fulfill(route, envelope(contentStatusVariants))
    if (path === '/api/v1/teacher-content/content-1') return fulfill(route, { data: contentItem })
    if (path === '/api/v1/questionnaires' && method === 'GET') return fulfill(route, envelope([questionnaire]))
    if (path === '/api/v1/questionnaires/questionnaire-1') return fulfill(route, { data: questionnaire })
    if (path === '/api/v1/learning-sets/learning-set-1') return fulfill(route, { data: learningSet })
    if (path === '/api/v1/grades/grade-1') return fulfill(route, { data: grade })
    if (path === '/api/v1/attendance/attendance-1') return fulfill(route, { data: attendance })
    if (path === '/api/v1/grades' && method === 'POST') return fulfill(route, { data: grade })
    if (path === '/api/v1/attendance' && method === 'POST') return fulfill(route, { data: attendance })
    if (path === '/api/v1/grades/imports') return fulfill(route, { data: { id: 'import-1', accepted_count: 1, rejected_count: 0 } })
    if (path === '/api/v1/attendance/imports') return fulfill(route, { data: { id: 'import-2', accepted_count: 1, rejected_count: 0 } })

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

async function timedGoto(page, path, visibleText) {
  const startedAt = await page.evaluate(() => performance.now())
  await page.goto(path)
  await expect(page.getByText(visibleText, { exact: false }).first()).toBeVisible()
  const endedAt = await page.evaluate(() => performance.now())
  return endedAt - startedAt
}

async function expectKeyboardReachable(page) {
  const focused = await page.evaluate(() => {
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
    const elements = [...document.querySelectorAll(selector)]
    const candidates = elements.filter((element) => {
      const rect = element.getBoundingClientRect()
      const style = window.getComputedStyle(element)
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
    })
    if (!candidates.length) return 'none'
    return candidates.some((element) => {
      element.focus()
      return document.activeElement === element
    })
  })

  if (focused === 'none') {
    expect(focused).toBe('none')
    return
  }
  expect(focused).toBe(true)
}

test.beforeEach(async ({ page }) => {
  await mockTeacherWorkflowApis(page)
})

test('teacher workflow routes fit responsive and keyboard audit viewports', async ({ page }) => {
  const routes = [
    ['/teacher/workspace/content', 'Teacher content'],
    ['/teacher/workspace/content/content-1', 'Algebra guide'],
    ['/teacher/workspace/questionnaires', 'Questionnaires'],
    ['/teacher/workspace/questionnaires/questionnaire-1', 'Linear equations check'],
    ['/teacher/workspace/learning-sets', 'Learning sets'],
    ['/teacher/workspace/learning-sets/learning-set-1', 'Week 1 algebra'],
    ['/teacher/workspace/grades', 'Grades'],
    ['/teacher/workspace/attendance', 'Attendance'],
    ['/admin/teacher-workflow/materials', 'Teacher materials'],
    ['/admin/teacher-workflow/academic-records', 'Academic records'],
    ['/admin/teacher-workflow/imports', 'Grade and attendance imports'],
  ]

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 920 })
    for (const [path, text] of routes) {
      await page.goto(path)
      await expect(page.getByText(text, { exact: false }).first()).toBeVisible()
      await expectNoDocumentOverflow(page)
      await expectKeyboardReachable(page)
    }
  }
})

test('teacher and administrator workflows meet timed usability budgets', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 920 })

  const learningSetMs = await timedGoto(page, '/teacher/workspace/learning-sets/learning-set-1', 'Week 1 algebra')
  expect(learningSetMs).toBeLessThan(120_000)

  const contentStartedAt = await page.evaluate(() => performance.now())
  await page.goto('/teacher/workspace/content')
  await expect(page.getByText('Algebra guide')).toBeVisible()
  await page.goto('/teacher/workspace/questionnaires')
  await expect(page.getByText('Linear equations check')).toBeVisible()
  await page.goto('/teacher/workspace/learning-sets')
  await expect(page.getByText('Learning-set create blocked')).toBeVisible()
  const contentWorkflowMs = (await page.evaluate(() => performance.now())) - contentStartedAt
  expect(contentWorkflowMs).toBeLessThan(360_000)

  const gradeStartedAt = await page.evaluate(() => performance.now())
  await page.goto('/teacher/workspace/grades')
  await page.getByLabel('Grade value').fill('101')
  await expect(page.getByText('Scoped grade list blocked')).toBeVisible()
  const gradeWorkflowMs = (await page.evaluate(() => performance.now())) - gradeStartedAt
  expect(gradeWorkflowMs).toBeLessThan(240_000)
})

test('status and blocked-state language is distinguishable for UAT proxy evidence', async ({ page }) => {
  await page.goto('/teacher/workspace/content')
  await expect(page.getByText('Active').first()).toBeVisible()
  await expect(page.getByText('Scan: Clean').first()).toBeVisible()
  await expect(page.getByText('Restored').first()).toBeVisible()
  await expect(page.getByText('Scan: Pending').first()).toBeVisible()
  await expect(page.getByText('Unavailable').first()).toBeVisible()
  await expect(page.getByText('Scan: Failed').first()).toBeVisible()
  await expect(page.getByText('Conflict').first()).toBeVisible()

  await page.goto('/teacher/workspace/questionnaires')
  await expect(page.getByText('Inactive').first()).toBeVisible()

  await page.goto('/teacher/workspace/learning-sets')
  await expect(page.getByText('Contract support required')).toBeVisible()

  await page.goto('/teacher/workspace/learning-sets/learning-set-1')
  await expect(page.getByText('Deleted').first()).toBeVisible()
  await expect(page.getByText('Read-only legacy direct assignments')).toBeVisible()

  await page.goto('/admin/teacher-workflow/imports')
  await expect(page.getByText('Structured JSON only')).toBeVisible()
  await expect(page.getByText('CSV, spreadsheet, archive, and file-upload imports are not available.')).toBeVisible()
})
