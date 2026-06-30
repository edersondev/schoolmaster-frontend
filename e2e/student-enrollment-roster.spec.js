import { expect, test } from '@playwright/test'

const apiMeta = { page: 1, per_page: 25, total: 1 }

const activeSchool = {
  id: 'school-1',
  name: 'North Campus',
  code: 'NC',
  status: 'active',
}

const student = {
  id: 'student-1',
  user_id: 'user-student-1',
  registration_number: 'REG-1001',
  first_name: 'Ana',
  last_name: 'Silva',
  full_name: 'Ana Silva',
  date_of_birth: '2014-04-12',
  current_academic_year_id: 'year-2026',
  status: 'active',
  enrolled_at: '2026-02-01',
  status_effective_at: '2026-02-01',
  guardian_associations: [],
  enrollment_history: [{ status: 'active', effective_at: '2026-02-01', reason: 'Enrollment' }],
}

const classSection = {
  id: 'class-1',
  academic_period_id: 'period-2026',
  code: '6A-MATH',
  name: 'Grade 6A Mathematics',
  course: 'Mathematics',
  classroom: 'Room 204',
  section: 'A',
  group: 'Morning',
  status: 'active',
}

const membership = {
  id: 'membership-1',
  school_id: activeSchool.id,
  class_section_id: classSection.id,
  student_profile_id: student.id,
  academic_period_id: 'period-2026',
  status: 'active',
  effective_start_date: '2026-02-01',
  effective_end_date: null,
}

const teacherAssignment = {
  id: 'assignment-1',
  school_id: activeSchool.id,
  class_section_id: classSection.id,
  teacher_user_id: 'teacher-1',
  academic_period_id: 'period-2026',
  status: 'active',
  effective_start_date: '2026-02-01',
  teacher_name: 'Marcos Pereira',
  class_section_name: classSection.name,
}

function envelope(data, meta = apiMeta) {
  return { data, meta: { ...meta, total: Array.isArray(data) ? data.length : 1 } }
}

async function fulfill(route, json) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(json),
  })
}

async function mockRosterApis(page) {
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
          user: {
            id: 'admin-1',
            full_name: 'System Admin',
            email: 'admin@example.test',
            status: 'active',
            roles: [],
          },
          roles: [
            {
              id: 'role-1',
              code: 'system-administrator',
              name: 'System Administrator',
              scope: 'platform',
              status: 'active',
              permissions: [],
            },
          ],
          permissions: [{ id: 'perm-all', code: '*', name: 'All', scope: 'platform', status: 'active' }],
          resolved_school: activeSchool,
        },
      })
    }

    if (path === '/api/v1/academic-periods') {
      return fulfill(route, envelope([
        {
          id: 'period-2026',
          name: '2026 Term 1',
          status: 'active',
          is_current: true,
        },
      ]))
    }

    if (path === '/api/v1/student-profiles' && method === 'GET') {
      return fulfill(route, envelope([student]))
    }

    if (path === '/api/v1/student-profiles/student-1' && method === 'GET') {
      return fulfill(route, { data: student })
    }

    if (path === '/api/v1/student-profiles/student-1/status' && method === 'PATCH') {
      return fulfill(route, { data: { student_profile: student, effective_at: '2026-03-01', status: 'inactive' } })
    }

    if (path === '/api/v1/student-profiles/student-1/transfer' && method === 'POST') {
      return fulfill(route, { data: { student_profile: { ...student, status: 'transferred' } } })
    }

    if (path === '/api/v1/class-sections' && method === 'GET') {
      return fulfill(route, envelope([classSection]))
    }

    if (path === '/api/v1/class-sections/class-1' && method === 'GET') {
      return fulfill(route, { data: classSection })
    }

    if (path === '/api/v1/class-sections/class-1' && method === 'PATCH') {
      return fulfill(route, { data: classSection })
    }

    if (path === '/api/v1/class-sections/class-1/memberships' && method === 'GET') {
      return fulfill(route, envelope([membership]))
    }

    if (path === '/api/v1/class-sections/class-1/memberships' && ['POST', 'PATCH'].includes(method)) {
      return fulfill(route, { data: { succeeded: true, memberships: [membership], rejected: [] } })
    }

    if (path === '/api/v1/teacher-assignments' && method === 'GET') {
      return fulfill(route, envelope([teacherAssignment]))
    }

    if (path === '/api/v1/teacher-assignments' && method === 'POST') {
      return fulfill(route, { data: teacherAssignment })
    }

    if (path === '/api/v1/teacher-assignments/assignment-1' && method === 'GET') {
      return fulfill(route, { data: teacherAssignment })
    }

    if (path === '/api/v1/teacher-assignments/assignment-1/status' && method === 'PATCH') {
      return fulfill(route, { data: { ...teacherAssignment, status: 'inactive' } })
    }

    return fulfill(route, envelope([]))
  })
}

async function expectNoDocumentOverflow(page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: [...document.body.querySelectorAll('*')]
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          tag: element.tagName.toLowerCase(),
          className: element.className,
          text: element.textContent?.trim().slice(0, 60),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        }
      })
      .filter((entry) => entry.right > document.documentElement.clientWidth + 2)
      .slice(0, 8),
  }))

  expect(metrics.scrollWidth, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.clientWidth + 2)
}

async function expectFocusInside(locator) {
  const focusedInside = await locator.evaluate((element) => element.contains(document.activeElement))
  expect(focusedInside).toBe(true)
}

test.beforeEach(async ({ page }) => {
  await mockRosterApis(page)
})

test('student enrollment roster pages fit responsive audit viewports', async ({ page }) => {
  const routes = [
    ['/admin/students', 'Student profiles'],
    ['/admin/students/student-1', 'Ana Silva'],
    ['/admin/class-sections?academicPeriodId=period-2026', 'Class sections'],
    ['/admin/class-sections/class-1?academicPeriodId=period-2026', 'Grade 6A Mathematics'],
    ['/admin/teacher-assignments?academicPeriodId=period-2026', 'Teacher assignments'],
    ['/admin/teacher-assignments/assignment-1?academicPeriodId=period-2026', 'Deactivate assignment'],
  ]

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 920 })

    for (const [path, text] of routes) {
      await page.goto(path)
      await expect(page.getByText(text, { exact: false }).first()).toBeVisible()
      await expectNoDocumentOverflow(page)
    }
  }
})

test('dialogs, form labels, status tags, and batch controls are keyboard reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 920 })
  await page.goto('/admin/students/student-1')
  await expect(page.locator('.el-tag__content').filter({ hasText: /^Active$/ }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Transfer' }).click()

  const transferDialog = page.getByRole('dialog', { name: 'Transfer student' })
  await expect(transferDialog).toBeVisible()
  await page.keyboard.press('Tab')
  await expectFocusInside(transferDialog)
  await page.keyboard.press('Escape')
  await expect(transferDialog).toBeHidden()

  await page.goto('/admin/class-sections/class-1?academicPeriodId=period-2026')
  await page.getByLabel('Student profile IDs').fill('student-2')
  await page.getByLabel('Academic period').last().fill('period-2026')
  await page.getByRole('button', { name: 'Review add batch' }).click()

  const addDialog = page.getByRole('dialog', { name: 'Add memberships' })
  await expect(addDialog).toBeVisible()
  await expect(addDialog.getByText('1 selected of 100')).toBeVisible()
  await expect(addDialog.getByRole('button', { name: 'Submit' })).toBeEnabled()
  await page.keyboard.press('Escape')
  await expect(addDialog).toBeHidden()

  await page.locator('.el-table__body .el-checkbox').first().click()
  await page.getByRole('button', { name: 'Review end batch' }).click()

  const endDialog = page.getByRole('dialog', { name: 'End memberships' })
  await expect(endDialog).toBeVisible()
  await expect(endDialog.getByText('1 selected of 100')).toBeVisible()
  await page.keyboard.press('Tab')
  await expectFocusInside(endDialog)
  await page.keyboard.press('Escape')
  await expect(endDialog).toBeHidden()

  await page.goto('/admin/teacher-assignments/assignment-1?academicPeriodId=period-2026')
  await page.getByRole('button', { name: 'Deactivate assignment' }).click()

  const deactivateDialog = page.getByRole('dialog', { name: 'Deactivate assignment' })
  await expect(deactivateDialog).toBeVisible()
  await page.keyboard.press('Tab')
  await expectFocusInside(deactivateDialog)
  await deactivateDialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(deactivateDialog).toBeHidden()
})
