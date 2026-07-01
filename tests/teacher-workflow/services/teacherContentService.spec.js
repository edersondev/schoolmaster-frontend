import { describe, expect, it } from 'vitest'
import {
  MAX_TEACHER_CONTENT_FILE_BYTES,
  createTeacherContentService,
  mapTeacherContent,
  mapTeacherContentUpdateRequest,
  validateTeacherContentUploadDraft,
} from '@/modules/teacher-workflow/services/teacherContentService'

describe('teacherContentService mappers', () => {
  it('maps content safely without private file paths', () => {
    expect(
      mapTeacherContent({
        id: 'content-1',
        title: 'Guide',
        content_type: 'pdf',
        scan_status: 'clean',
        status: 'active',
        private_path: '/secret/file.pdf',
        download_available: true,
      }),
    ).toMatchObject({
      id: 'content-1',
      title: 'Guide',
      contentType: 'pdf',
      scanStatus: 'clean',
      status: 'active',
      downloadAvailable: true,
    })
  })

  it('limits update request to approved metadata', () => {
    expect(mapTeacherContentUpdateRequest({ title: 'A', description: 'B', file: 'nope' })).toEqual({
      title: 'A',
      description: 'B',
    })
  })

  it('validates upload draft size and content type', () => {
    const errors = validateTeacherContentUploadDraft({
      title: 'A',
      contentType: 'video',
      file: { size: MAX_TEACHER_CONTENT_FILE_BYTES + 1 },
    })
    expect(errors.contentType).toBeTruthy()
    expect(errors.file).toBeTruthy()
  })

  it('clears the inherited JSON content type for multipart uploads', async () => {
    const calls = []
    const service = createTeacherContentService({
      post: async (...args) => {
        calls.push(args)
        return { data: { id: 'content-1', title: 'Guide' } }
      },
    })

    await service.create({ title: 'Guide', contentType: 'pdf', file: new File(['x'], 'guide.pdf') })

    expect(calls[0][2].options.headers['Content-Type']).toBe(false)
  })
})
