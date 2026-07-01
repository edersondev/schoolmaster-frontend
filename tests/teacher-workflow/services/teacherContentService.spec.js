import { describe, expect, it } from 'vitest'
import {
  MAX_TEACHER_CONTENT_FILE_BYTES,
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
})
