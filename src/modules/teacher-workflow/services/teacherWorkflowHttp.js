import { mapPaginatedEnvelope } from '@/contracts/admin-system/administration'
import { authService } from '@/services/auth/authService'
import { administrationHttpClient } from '@/services/admin-system/administration-service'
import { normalizeTeacherWorkflowError } from './teacherWorkflowFeedbackMapper'

export function cleanTeacherWorkflowParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export function mapPaginationQuery(query = {}) {
  return cleanTeacherWorkflowParams({
    page: query.page,
    per_page: query.perPage,
  })
}

export function createTeacherWorkflowConfig(options = {}, params = {}, getAccessToken = () => authService.getAccessToken()) {
  const accessToken = getAccessToken?.()
  return {
    params: cleanTeacherWorkflowParams(params),
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.schoolId ? { 'X-School-Id': options.schoolId } : {}),
      ...(options.headers ?? {}),
    },
    ...(options.signal ? { signal: options.signal } : {}),
  }
}

export function unwrapData(response) {
  const envelope = response?.data ?? response
  return envelope?.data ?? envelope
}

export function mapListEnvelope(response, mapRecord = (record) => record) {
  const mapped = mapPaginatedEnvelope(response?.data ?? response)
  return { ...mapped, items: mapped.items.map(mapRecord) }
}

export function createTeacherWorkflowHttp({
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
} = {}) {
  const config = (options = {}, params = {}) => createTeacherWorkflowConfig(options, params, getAccessToken)

  async function get(path, { params = {}, options = {}, operationId, map = unwrapData } = {}) {
    try {
      return map(await client.get(path, config(options, params)))
    } catch (error) {
      throw normalizeTeacherWorkflowError(error, { operationId })
    }
  }

  async function post(path, body, { params = {}, options = {}, operationId, map = unwrapData } = {}) {
    try {
      return map(await client.post(path, body, config(options, params)))
    } catch (error) {
      throw normalizeTeacherWorkflowError(error, { operationId })
    }
  }

  async function patch(path, body, { params = {}, options = {}, operationId, map = unwrapData } = {}) {
    try {
      return map(await client.patch(path, body, config(options, params)))
    } catch (error) {
      throw normalizeTeacherWorkflowError(error, { operationId })
    }
  }

  async function deleteRequest(path, { params = {}, options = {}, operationId, map = unwrapData } = {}) {
    try {
      return map(await client.delete(path, config(options, params)))
    } catch (error) {
      throw normalizeTeacherWorkflowError(error, { operationId })
    }
  }

  return { get, post, patch, delete: deleteRequest, config }
}

export const teacherWorkflowHttp = createTeacherWorkflowHttp()
