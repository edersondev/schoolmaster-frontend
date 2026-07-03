import { describe, expect, it } from 'vitest'
import { createReportingAccessState } from '@/composables/reporting/useReportingAccess'
import { activeReportingSession } from '../fixtures/reportingFixtures'

describe('useReportingAccess', () => {
  it('resolves active school, timezone, and reporting permission gates', () => {
    const state = createReportingAccessState(activeReportingSession)
    expect(state.schoolId.value).toBe('school-1')
    expect(state.schoolTimezone.value).toBe('America/Sao_Paulo')
    expect(state.hasReportAccess.value).toBe(true)
    expect(state.hasLifecycleAccess.value).toBe(true)
    expect(state.hasDefinitionAccess.value).toBe(true)
  })

  it('distinguishes no active school and denied access', () => {
    expect(createReportingAccessState({ permissions: [] }).workspaceStatus.value).toBe('no-active-school')
    expect(createReportingAccessState({ activeSchool: { id: 'school-1' }, permissions: [] }).workspaceStatus.value).toBe('forbidden')
  })
})
