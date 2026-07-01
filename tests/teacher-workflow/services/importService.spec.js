import { describe, expect, it } from 'vitest'
import { IMPORT_ROW_LIMIT, validateImportRows } from '@/modules/teacher-workflow/services/importService'

describe('importService validation', () => {
  it('accepts JSON row arrays from 1 to 500 rows', () => {
    expect(validateImportRows([{ student_profile_id: 'student-1' }])).toEqual({})
  })

  it('rejects empty and over-limit imports', () => {
    expect(validateImportRows([]).rows).toBeTruthy()
    expect(validateImportRows(Array.from({ length: IMPORT_ROW_LIMIT + 1 }, () => ({}))).rows).toBeTruthy()
  })
})
