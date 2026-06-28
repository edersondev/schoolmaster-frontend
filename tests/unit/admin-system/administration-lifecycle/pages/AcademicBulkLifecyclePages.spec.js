import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = (path) => readFileSync(`${process.cwd()}/${path}`, 'utf8')

describe('academic bulk lifecycle pages', () => {
  it('wires academic years and periods to bulk lifecycle services and context resets', () => {
    const years = source('src/pages/admin-system/academic-years/AcademicYearsListPage.vue')
    const periods = source('src/pages/admin-system/academic-periods/AcademicPeriodsListPage.vue')

    expect(years).toContain('bulkLifecycleAcademicYears')
    expect(years).toContain("resource: 'academicYears'")
    expect(years).toContain('<AdminBulkActionBar')
    expect(years).toContain('bulk.clearSelection')
    expect(periods).toContain('bulkLifecycleAcademicPeriods')
    expect(periods).toContain("resource: 'academicPeriods'")
    expect(periods).toContain('list.query.value.academicYearId')
    expect(periods).toContain('bulk.clearSelection')
  })
})
