import { describe, expect, it } from 'vitest'
import { useTeacherWorkflowImports } from '@/modules/teacher-workflow/composables/useTeacherWorkflowImports'

describe('useTeacherWorkflowImports', () => {
  it('denies unauthorized import actors', async () => {
    const composable = useTeacherWorkflowImports({ canImport: false })
    await composable.submit()
    expect(composable.state.feedback.type).toBe('forbidden')
  })

  it('parses valid JSON rows', () => {
    const composable = useTeacherWorkflowImports()
    composable.state.json = '[{"student_profile_id":"student-1"}]'
    expect(composable.parseJson()).toBe(true)
    expect(composable.rowCount.value).toBe(1)
  })
})
