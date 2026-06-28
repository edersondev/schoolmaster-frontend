import {
  mapAcademicPeriod,
  mapAcademicPeriodCreateRequest,
  mapAcademicPeriodUpdateRequest,
} from '@/contracts/admin-system/academics'
import {
  createAdministrationResourceOperations,
  createAdministrationService,
} from './administration-service'

export function createAcademicPeriodsService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/academic-periods',
    listOperationId: 'listAcademicPeriods',
    createOperationId: 'createAcademicPeriod',
    mapRecord: mapAcademicPeriod,
    mapCreateRequest: mapAcademicPeriodCreateRequest,
  })
  const operations = createAdministrationResourceOperations({
    client,
    endpoint: '/api/v1/academic-periods',
    mapRecord: mapAcademicPeriod,
    mapUpdateRequest: mapAcademicPeriodUpdateRequest,
    operations: {
      detail: 'getAcademicPeriod',
      update: 'updateAcademicPeriod',
      activate: 'activateAcademicPeriod',
      deactivate: 'deactivateAcademicPeriod',
      delete: 'deleteAcademicPeriod',
      restore: 'restoreAcademicPeriod',
      bulk: 'bulkLifecycleAcademicPeriods',
    },
  })
  return {
    listAcademicPeriods: service.list,
    createAcademicPeriod: service.create,
    getAcademicPeriod: operations.getOne,
    updateAcademicPeriod: operations.updateOne,
    activateAcademicPeriod: operations.activate,
    deactivateAcademicPeriod: operations.deactivate,
    deleteAcademicPeriod: operations.deleteOne,
    restoreAcademicPeriod: operations.restore,
    bulkLifecycleAcademicPeriods: operations.bulkLifecycle,
  }
}

export const {
  listAcademicPeriods,
  createAcademicPeriod,
  getAcademicPeriod,
  updateAcademicPeriod,
  activateAcademicPeriod,
  deactivateAcademicPeriod,
  deleteAcademicPeriod,
  restoreAcademicPeriod,
  bulkLifecycleAcademicPeriods,
} = createAcademicPeriodsService()
