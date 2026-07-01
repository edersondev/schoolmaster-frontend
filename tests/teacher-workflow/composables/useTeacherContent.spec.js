import { describe, expect, it } from 'vitest'
import { useTeacherContent } from '@/modules/teacher-workflow/composables/useTeacherContent'

describe('useTeacherContent', () => {
  it('maps empty list feedback', async () => {
    const service = {
      list: async () => ({ items: [], meta: { total: 0 } }),
    }
    const composable = useTeacherContent({ service })
    await composable.loadList()
    expect(composable.state.feedback.type).toBe('empty')
  })

  it('blocks invalid upload drafts before service call', async () => {
    const composable = useTeacherContent({ service: {} })
    await composable.upload()
    expect(composable.state.feedback.type).toBe('validation')
  })

  it('starts clean-file downloads after fetching the signed URL', async () => {
    const started = []
    const service = {
      download: async () => ({ url: 'https://example.test/download/content-1', fileName: 'content.pdf' }),
    }
    const composable = useTeacherContent({
      service,
      startDownload: (download) => {
        started.push(download.url)
        return true
      },
    })
    composable.state.detail = {
      id: 'content-1',
      status: 'active',
      scanStatus: 'clean',
      downloadAvailable: true,
    }

    await composable.downloadDetail()

    expect(started).toEqual(['https://example.test/download/content-1'])
  })
})
