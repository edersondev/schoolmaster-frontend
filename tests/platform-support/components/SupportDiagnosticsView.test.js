import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SupportDiagnosticGroups from '@/components/platform-support/SupportDiagnosticGroups.vue'
import SupportDiagnosticsGate from '@/components/platform-support/SupportDiagnosticsGate.vue'
import SupportUnsupportedActionsGuard from '@/components/platform-support/SupportUnsupportedActionsGuard.vue'
import { diagnosticsRecord, supportDecisionRecord } from '../fixtures/platformSupportFixtures'
import { globalMountOptions } from './testUtils'

describe('Support Diagnostics view components', () => {
  it('renders redacted diagnostics, suppression, and active decision context', () => {
    const diagnostics = {
      groups: diagnosticsRecord.groups,
      redactedFields: diagnosticsRecord.redacted_fields,
      suppressed: diagnosticsRecord.suppressed,
    }
    expect(mount(SupportDiagnosticGroups, { props: { diagnostics }, ...globalMountOptions() }).text()).toContain('private_path')
    expect(
      mount(SupportDiagnosticsGate, {
        props: { decision: { ...supportDecisionRecord(), state: 'approved', optInState: 'active', platformApprovalState: 'active' } },
        ...globalMountOptions(),
      }).text(),
    ).toContain('approved')
  })

  it('renders blocked unsupported actions without sensitive output', () => {
    const text = mount(SupportUnsupportedActionsGuard, globalMountOptions()).text()
    expect(text).toContain('raw-report-output')
    expect(text).not.toContain('token')
  })
})

