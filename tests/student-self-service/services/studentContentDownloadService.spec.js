import { describe, expect, it, vi } from 'vitest'
import { createStudentSelfServiceService } from '@/services/student/studentSelfServiceService'
import { normalizeStudentSelfServiceError } from '@/services/student/studentSelfServiceFeedbackMapper'

describe('student content download service', () => {
  it('requests binary assigned content through approved student endpoint', async () => {
    const blob = new Blob(['ok'])
    const client = {
      get: vi.fn().mockResolvedValue({
        data: blob,
        headers: { 'content-type': 'application/pdf' },
      }),
    }
    const service = createStudentSelfServiceService({ client, getAccessToken: () => 'token' })
    const result = await service.downloadAssignedContent(
      { contentItemId: 'content-1' },
      { schoolId: 'school-1' },
    )
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/student/teacher-content/content-1/download',
      expect.objectContaining({ responseType: 'blob' }),
    )
    expect(result).toMatchObject({ data: blob, contentType: 'application/pdf' })
  })

  it('normalizes unavailable and not-found failures without private diagnostics', () => {
    const error = {
      response: {
        status: 404,
        data: { error: { code: 'NOT_FOUND', message: 'private /path token' } },
        headers: { 'x-request-id': 'request-1' },
      },
    }
    const normalized = normalizeStudentSelfServiceError(error, {
      operationId: 'downloadStudentTeacherContent',
    })
    expect(normalized.type).toBe('not-found')
    expect(normalized.diagnostic).toEqual({
      operationId: 'downloadStudentTeacherContent',
      requestId: 'request-1',
      status: 404,
      code: 'NOT_FOUND',
      gate: null,
      routeName: null,
    })
  })
})
