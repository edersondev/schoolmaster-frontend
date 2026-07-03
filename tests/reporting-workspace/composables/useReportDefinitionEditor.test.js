import { describe, expect, it, vi } from 'vitest'
import { useReportDefinitionEditor } from '@/composables/reporting/useReportDefinitionEditor'
import { createReportingAccessState } from '@/composables/reporting/useReportingAccess'
import { activeReportingSession, definitionRecord } from '../fixtures/reportingFixtures'
import { mapReportDefinition } from '@/contracts/reporting/reportingContract'

describe('useReportDefinitionEditor', () => {
  it('enforces complexity limits and active metadata edit boundary', async () => {
    const definitions = { applyDefinition: vi.fn() }
    const editor = useReportDefinitionEditor({
      access: createReportingAccessState(activeReportingSession),
      definitions,
      service: { updateReportDefinition: vi.fn().mockResolvedValue(mapReportDefinition(definitionRecord)) },
    })
    editor.edit({ ...mapReportDefinition(definitionRecord), lifecycleState: 'active' })
    expect(editor.isActive.value).toBe(true)
    editor.state.draft.fields = Array.from({ length: 26 }, (_, index) => `field-${index}`)
    expect(editor.canSubmit.value).toBe(false)
    editor.state.draft.fields = ['student_name']
    await editor.submit()
    expect(definitions.applyDefinition).toHaveBeenCalled()
  })
})
