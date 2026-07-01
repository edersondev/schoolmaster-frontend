import { mapListEnvelope, mapPaginationQuery, teacherWorkflowHttp, unwrapData } from './teacherWorkflowHttp'
import { TEACHER_WORKFLOW_OPERATIONS } from './teacherWorkflowContract'

const ENDPOINT = '/api/v1/teacher-content'
export const TEACHER_CONTENT_TYPES = Object.freeze(['pdf', 'image', 'text', 'office_document'])
export const MAX_TEACHER_CONTENT_FILE_BYTES = 25 * 1024 * 1024

export function mapTeacherContent(record = {}) {
  return {
    id: record.id ?? record.content_item_id ?? '',
    schoolId: record.school_id ?? null,
    ownerUserId: record.owner_user_id ?? record.teacher_user_id ?? null,
    folderId: record.folder_id ?? null,
    title: record.title ?? '',
    description: record.description ?? '',
    contentType: record.content_type ?? '',
    declaredContentType: record.declared_content_type ?? record.content_type ?? '',
    detectedContentType: record.detected_content_type ?? null,
    fileSizeBytes: record.file_size_bytes ?? 0,
    scanStatus: record.scan_status ?? 'unavailable',
    status: record.status ?? 'unavailable',
    downloadAvailable: record.download_available === true,
    createdAt: record.created_at ?? null,
    updatedAt: record.updated_at ?? null,
  }
}

export function mapTeacherContentCreateRequest(form = {}) {
  const body = new FormData()
  if (form.folderId) body.append('folder_id', form.folderId)
  body.append('title', form.title ?? '')
  if (form.description) body.append('description', form.description)
  body.append('content_type', form.contentType ?? '')
  if (form.file) body.append('file', form.file)
  return body
}

export function validateTeacherContentUploadDraft(form = {}) {
  const errors = {}
  if (!form.title) errors.title = ['Title is required.']
  if (!TEACHER_CONTENT_TYPES.includes(form.contentType)) {
    errors.contentType = ['Choose an approved content type.']
  }
  if (!form.file) errors.file = ['File is required.']
  if (form.file?.size > MAX_TEACHER_CONTENT_FILE_BYTES) {
    errors.file = ['File must be 25 MB or smaller.']
  }
  return errors
}

export function mapTeacherContentUpdateRequest(form = {}) {
  return {
    ...(form.folderId !== undefined ? { folder_id: form.folderId || null } : {}),
    ...(form.title !== undefined ? { title: form.title } : {}),
    ...(form.description !== undefined ? { description: form.description ?? null } : {}),
  }
}

export function mapTeacherWorkflowStatusRequest(status) {
  return { status }
}

export function mapTeacherContentDownload(record = {}) {
  return {
    url: record.url ?? record.download_url ?? null,
    expiresAt: record.expires_at ?? record.download_expires_at ?? null,
    fileName: record.file_name ?? null,
  }
}

export function createTeacherContentService(http = teacherWorkflowHttp) {
  return {
    list: (query = {}, options = {}) =>
      http.get(ENDPOINT, {
        params: mapPaginationQuery(query),
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.listTeacherContent,
        map: (response) => mapListEnvelope(response, mapTeacherContent),
      }),
    create: (form, options = {}) =>
      http.post(ENDPOINT, mapTeacherContentCreateRequest(form), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.createTeacherContent,
        map: (response) => mapTeacherContent(unwrapData(response)),
      }),
    get: (id, options = {}) =>
      http.get(`${ENDPOINT}/${id}`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.getTeacherContent,
        map: (response) => mapTeacherContent(unwrapData(response)),
      }),
    update: (id, form, options = {}) =>
      http.patch(`${ENDPOINT}/${id}`, mapTeacherContentUpdateRequest(form), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.updateTeacherContent,
        map: (response) => mapTeacherContent(unwrapData(response)),
      }),
    updateStatus: (id, status, options = {}) =>
      http.patch(`${ENDPOINT}/${id}/status`, mapTeacherWorkflowStatusRequest(status), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.updateTeacherContentStatus,
        map: (response) => mapTeacherContent(unwrapData(response)),
      }),
    delete: (id, options = {}) =>
      http.delete(`${ENDPOINT}/${id}`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.deleteTeacherContent,
      }),
    restore: (id, options = {}) =>
      http.post(`${ENDPOINT}/${id}/restore`, {}, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.restoreTeacherContent,
        map: (response) => mapTeacherContent(unwrapData(response)),
      }),
    download: (id, options = {}) =>
      http.get(`${ENDPOINT}/${id}/download`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.downloadTeacherContent,
        map: (response) => mapTeacherContentDownload(unwrapData(response)),
      }),
  }
}

export const teacherContentService = createTeacherContentService()
