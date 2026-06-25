import { mapSchool, mapSchoolCreateRequest } from '@/contracts/admin-system/schools'
import { createAdministrationService } from './administration-service'

export const SCHOOL_ENDPOINT = '/api/v1/schools'

export function createSchoolsService(client, getAccessToken) {
  const service = createAdministrationService({
    client,
    endpoint: SCHOOL_ENDPOINT,
    listOperationId: 'listSchools',
    createOperationId: 'createSchool',
    mapRecord: mapSchool,
    mapCreateRequest: mapSchoolCreateRequest,
    getAccessToken,
  })
  return { listSchools: service.list, createSchool: service.create }
}

export const schoolsService = createSchoolsService()
export const { listSchools, createSchool } = schoolsService
