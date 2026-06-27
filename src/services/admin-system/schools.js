import {
  mapSchool,
  mapSchoolCreateRequest,
  mapSchoolUpdateRequest,
} from '@/contracts/admin-system/schools'
import { authService } from '@/services/auth/authService'
import { administrationHttpClient, createAdministrationService } from './administration-service'

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

  async function updateSchool(schoolId, form, options = {}) {
    const accessToken = getAccessToken?.()
    const response = await client.patch(`${SCHOOL_ENDPOINT}/${schoolId}`, mapSchoolUpdateRequest(form), {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      ...(options.signal ? { signal: options.signal } : {}),
    })
    const envelope = response.data ?? response

    return mapSchool(envelope.data ?? envelope)
  }

  return { listSchools: service.list, createSchool: service.create, updateSchool }
}

export const schoolsService = createSchoolsService()
export const { listSchools, createSchool, updateSchool } = schoolsService
