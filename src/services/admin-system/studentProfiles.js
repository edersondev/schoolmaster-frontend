import {
  mapStudentLifecycleResult,
  mapStudentProfile,
  mapStudentProfileCreateRequest,
  mapStudentStatusRequest,
  mapStudentTransferRequest,
} from '@/contracts/admin-system/student-profiles'
import { mapPaginatedEnvelope } from '@/contracts/admin-system/administration'
import { authService } from '@/services/auth/authService'
import { administrationHttpClient } from './administration-service'
import { normalizeStudentEnrollmentRosterError } from './studentEnrollmentRosterErrorMapper'

const ENDPOINT = '/api/v1/student-profiles'

export function createStudentProfilesAdminService(
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

  async function listStudentProfiles(query = {}, options = {}) {
    try {
      const response = await client.get(
        ENDPOINT,
        config(options, {
          page: query.page,
          per_page: query.perPage,
          status: query.status,
          search: query.search,
          sort: query.sort,
        }),
      )
      const mapped = mapPaginatedEnvelope(response.data ?? response)
      return { ...mapped, items: mapped.items.map(mapStudentProfile) }
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'listStudentProfiles' })
    }
  }

  async function createStudentProfile(form, options = {}) {
    try {
      const response = await client.post(ENDPOINT, mapStudentProfileCreateRequest(form), config(options))
      return mapStudentProfile((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'createStudentProfile' })
    }
  }

  async function getStudentProfile(id, options = {}) {
    try {
      const response = await client.get(`${ENDPOINT}/${id}`, config(options))
      return mapStudentProfile((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'getStudentProfile' })
    }
  }

  async function updateStudentProfileStatus(id, form, options = {}) {
    try {
      const response = await client.patch(`${ENDPOINT}/${id}/status`, mapStudentStatusRequest(form), config(options))
      return mapStudentLifecycleResult((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'updateStudentProfileStatus' })
    }
  }

  async function transferStudentProfile(id, form, options = {}) {
    try {
      const response = await client.post(`${ENDPOINT}/${id}/transfer`, mapStudentTransferRequest(form), config(options))
      return mapStudentLifecycleResult((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'transferStudentProfile' })
    }
  }

  return {
    listStudentProfiles,
    createStudentProfile,
    getStudentProfile,
    updateStudentProfileStatus,
    transferStudentProfile,
  }
}

function cleanParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))
}

export const {
  listStudentProfiles,
  createStudentProfile,
  getStudentProfile,
  updateStudentProfileStatus,
  transferStudentProfile,
} = createStudentProfilesAdminService()
