import {
  mapAcademicYear,
  mapAcademicYearCreateRequest,
  mapAcademicYearUpdateRequest,
} from '@/contracts/admin-system/academics'
import {
  createAdministrationResourceOperations,
  createAdministrationService,
} from './administration-service'

export function createAcademicYearsService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/academic-years',
    listOperationId: 'listAcademicYears',
    createOperationId: 'createAcademicYear',
    mapRecord: mapAcademicYear,
    mapCreateRequest: mapAcademicYearCreateRequest,
  })
  const operations = createAdministrationResourceOperations({
    client,
    endpoint: '/api/v1/academic-years',
    mapRecord: mapAcademicYear,
    mapUpdateRequest: mapAcademicYearUpdateRequest,
    operations: {
      detail: 'getAcademicYear',
      update: 'updateAcademicYear',
      activate: 'activateAcademicYear',
      deactivate: 'deactivateAcademicYear',
      delete: 'deleteAcademicYear',
      restore: 'restoreAcademicYear',
      bulk: 'bulkLifecycleAcademicYears',
    },
  })
  return {
    listAcademicYears: service.list,
    createAcademicYear: service.create,
    getAcademicYear: operations.getOne,
    updateAcademicYear: operations.updateOne,
    activateAcademicYear: operations.activate,
    deactivateAcademicYear: operations.deactivate,
    deleteAcademicYear: operations.deleteOne,
    restoreAcademicYear: operations.restore,
    bulkLifecycleAcademicYears: operations.bulkLifecycle,
  }
}

export const {
  listAcademicYears,
  createAcademicYear,
  getAcademicYear,
  updateAcademicYear,
  activateAcademicYear,
  deactivateAcademicYear,
  deleteAcademicYear,
  restoreAcademicYear,
  bulkLifecycleAcademicYears,
} = createAcademicYearsService()
