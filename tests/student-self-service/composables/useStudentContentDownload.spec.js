import { describe, expect, it, vi } from 'vitest'
import { useStudentContentDownload } from '@/composables/student/useStudentContentDownload'
import { activeStudentContext } from '../test-utils'

describe('useStudentContentDownload', () => {
  it('gates unavailable content before service request', async () => {
    const service = { downloadAssignedContent: vi.fn() }
    const composable = useStudentContentDownload({ context: activeStudentContext, service })
    await composable.download({ id: 'content-1', downloadAvailable: false })
    expect(service.downloadAssignedContent).not.toHaveBeenCalled()
    expect(composable.state.feedback.type).toBe('unavailable-content')
  })

  it('downloads available content and maps denied responses safely', async () => {
    const service = { downloadAssignedContent: vi.fn().mockResolvedValue({ data: new Blob(['ok']) }) }
    const composable = useStudentContentDownload({ context: activeStudentContext, service })
    await composable.download({ id: 'content-1', downloadAvailable: true })
    expect(service.downloadAssignedContent).toHaveBeenCalledWith(
      { contentItemId: 'content-1' },
      { schoolId: 'school-1' },
    )
    expect(composable.state.feedback.type).toBe('success')
  })
})
