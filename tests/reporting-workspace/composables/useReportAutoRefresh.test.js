import { describe, expect, it, vi } from 'vitest'
import { useReportAutoRefresh } from '@/composables/reporting/useReportAutoRefresh'

describe('useReportAutoRefresh', () => {
  it('announces meaningful state changes on manual refresh', async () => {
    const announce = vi.fn()
    const history = {
      state: { items: [{ id: 'run-1', generationStatus: 'requested', outputs: [] }] },
      load: vi.fn().mockImplementation(() => {
        history.state.items = [{ id: 'run-1', generationStatus: 'generated', outputs: [] }]
      }),
    }
    const refresh = useReportAutoRefresh({ history, announce })
    await refresh.refresh()
    expect(announce).toHaveBeenCalled()
  })
})
