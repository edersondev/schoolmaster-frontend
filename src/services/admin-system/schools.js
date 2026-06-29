import {
  mapSchool,
  mapSchoolCreateRequest,
  mapSchoolUpdateRequest,
} from '@/contracts/admin-system/schools'
import { authService } from '@/services/auth/authService'
import {
  administrationHttpClient,
  createAdministrationResourceOperations,
  createAdministrationService,
} from './administration-service'

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

  const operations = createAdministrationResourceOperations({
    client,
    endpoint: SCHOOL_ENDPOINT,
    mapRecord: mapSchool,
    mapUpdateRequest: mapSchoolUpdateRequest,
    operations: {
      detail: 'getSchool',
      update: 'updateSchool',
      activate: 'activateSchool',
      deactivate: 'deactivateSchool',
      delete: 'deleteSchool',
      restore: 'restoreSchool',
    },
    getAccessToken,
  })

  return {
    listSchools: service.list,
    createSchool: service.create,
    getSchool: operations.getOne,
    updateSchool: operations.updateOne,
    activateSchool: operations.activate,
    deactivateSchool: operations.deactivate,
    deleteSchool: operations.deleteOne,
    restoreSchool: operations.restore,
  }
}

export const schoolsService = createSchoolsService()
export const {
  listSchools,
  createSchool,
  getSchool,
  updateSchool,
  activateSchool,
  deactivateSchool,
  deleteSchool,
  restoreSchool,
} = schoolsService
