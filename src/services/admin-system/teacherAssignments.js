import { mapPaginatedEnvelope } from '@/contracts/admin-system/administration'
import {
  mapTeacherAssignment,
  mapTeacherAssignmentCreateRequest,
  mapTeacherAssignmentStatusRequest,
} from '@/contracts/admin-system/teacher-assignments'
import { authService } from '@/services/auth/authService'
import { administrationHttpClient } from './administration-service'
import { normalizeStudentEnrollmentRosterError } from './studentEnrollmentRosterErrorMapper'

const ENDPOINT = '/api/v1/teacher-assignments'

export function createTeacherAssignmentsService(
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
) {
  const config = (options = {}, params = {}) => ({
    params: cleanParams(params),
    headers: {
      ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      ...(options.schoolId ? { 'X-School-Id': options.schoolId } : {}),
    },
    ...(options.signal ? { signal: options.signal } : {}),
  })

  async function listTeacherAssignments(query = {}, options = {}) {
    try {
      const response = await client.get(
        ENDPOINT,
        config(options, {
          page: query.page,
          per_page: query.perPage,
          academicPeriodId: query.academicPeriodId,
          status: query.status,
        }),
      )
      const mapped = mapPaginatedEnvelope(response.data ?? response)
      return { ...mapped, items: mapped.items.map(mapTeacherAssignment) }
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'listTeacherAssignments' })
    }
  }

  async function createTeacherAssignment(form, options = {}) {
    try {
      const response = await client.post(ENDPOINT, mapTeacherAssignmentCreateRequest(form), config(options))
      return mapTeacherAssignment((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'createTeacherAssignment' })
    }
  }

  async function getTeacherAssignment(id, options = {}) {
    try {
      const response = await client.get(`${ENDPOINT}/${id}`, config(options))
      return mapTeacherAssignment((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'getTeacherAssignment' })
    }
  }

  async function updateTeacherAssignmentStatus(id, form, options = {}) {
    try {
      const response = await client.patch(`${ENDPOINT}/${id}/status`, mapTeacherAssignmentStatusRequest(form), config(options))
      return mapTeacherAssignment((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'updateTeacherAssignmentStatus' })
    }
  }

  return { listTeacherAssignments, createTeacherAssignment, getTeacherAssignment, updateTeacherAssignmentStatus }
}

function cleanParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))
}

export const {
  listTeacherAssignments,
  createTeacherAssignment,
  getTeacherAssignment,
  updateTeacherAssignmentStatus,
} = createTeacherAssignmentsService()
