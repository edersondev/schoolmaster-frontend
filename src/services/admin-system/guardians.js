import {
  mapGuardian,
  mapGuardianCreateRequest,
  mapGuardianUpdateRequest,
} from '@/contracts/admin-system/guardians'
import {
  createAdministrationResourceOperations,
  createAdministrationService,
} from './administration-service'

export function createGuardiansService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/guardians',
    listOperationId: 'listGuardians',
    createOperationId: 'createGuardian',
    mapRecord: mapGuardian,
    mapCreateRequest: mapGuardianCreateRequest,
  })
  const operations = createAdministrationResourceOperations({
    client,
    endpoint: '/api/v1/guardians',
    mapRecord: mapGuardian,
    mapUpdateRequest: mapGuardianUpdateRequest,
    operations: {
      detail: 'getGuardian',
      update: 'updateGuardian',
      activate: 'activateGuardian',
      deactivate: 'deactivateGuardian',
      delete: 'deleteGuardian',
      restore: 'restoreGuardian',
      bulk: 'bulkLifecycleGuardians',
    },
  })
  return {
    listGuardians: service.list,
    createGuardian: service.create,
    getGuardian: operations.getOne,
    updateGuardian: operations.updateOne,
    activateGuardian: operations.activate,
    deactivateGuardian: operations.deactivate,
    deleteGuardian: operations.deleteOne,
    restoreGuardian: operations.restore,
    bulkLifecycleGuardians: operations.bulkLifecycle,
  }
}

export const {
  listGuardians,
  createGuardian,
  getGuardian,
  updateGuardian,
  activateGuardian,
  deactivateGuardian,
  deleteGuardian,
  restoreGuardian,
  bulkLifecycleGuardians,
} = createGuardiansService()
