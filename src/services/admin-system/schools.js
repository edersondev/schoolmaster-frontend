import {
  mapSchoolDeleteRequest,
  mapSchool,
  mapSchoolCreateRequest,
  mapSchoolUpdateRequest,
} from '@/contracts/admin-system/schools'
import { authService } from '@/services/auth/authService'
import { administrationHttpClient, createAdministrationService } from './administration-service'
import { normalizeAdministrationError } from './administration-error-mapper'

export const SCHOOL_ENDPOINT = '/api/v1/schools'

export function createSchoolsService(
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
) {
  const service = createAdministrationService({
    client,
    endpoint: SCHOOL_ENDPOINT,
    listOperationId: 'listSchools',
    createOperationId: 'createSchool',
    mapRecord: mapSchool,
    mapCreateRequest: mapSchoolCreateRequest,
    getAccessToken,
  })

  async function getSchool(schoolId, options = {}) {
    try {
      const accessToken = getAccessToken?.()
      const response = await client.get(`${SCHOOL_ENDPOINT}/${schoolId}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        ...(options.signal ? { signal: options.signal } : {}),
      })
      const envelope = response.data ?? response
      return mapSchool(envelope.data ?? envelope)
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: 'getSchool' })
    }
  }

  async function updateSchool(schoolId, form, options = {}) {
    try {
      const accessToken = getAccessToken?.()
      const response = await client.patch(
        `${SCHOOL_ENDPOINT}/${schoolId}`,
        mapSchoolUpdateRequest(form),
        {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          ...(options.signal ? { signal: options.signal } : {}),
        },
      )
      const envelope = response.data ?? response

      return mapSchool(envelope.data ?? envelope)
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: 'updateSchool' })
    }
  }

  async function deleteSchool(schoolId, form, options = {}) {
    try {
      const accessToken = getAccessToken?.()
      const response = await client.delete(`${SCHOOL_ENDPOINT}/${schoolId}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        data: mapSchoolDeleteRequest(form),
        ...(options.signal ? { signal: options.signal } : {}),
      })
      return response.data ?? response
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: 'deleteSchool' })
    }
  }

  return { listSchools: service.list, createSchool: service.create, getSchool, updateSchool, deleteSchool }
}

export const schoolsService = createSchoolsService()
export const { listSchools, createSchool, getSchool, updateSchool, deleteSchool } = schoolsService
