import {
  mapRole,
  mapRoleCreateRequest,
  mapRoleUpdateRequest,
} from '@/contracts/admin-system/access'
import {
  createAdministrationResourceOperations,
  createAdministrationService,
} from './administration-service'

export function createRolesService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/roles',
    listOperationId: 'listRoles',
    createOperationId: 'createRole',
    mapRecord: mapRole,
    mapCreateRequest: mapRoleCreateRequest,
  })
  const operations = createAdministrationResourceOperations({
    client,
    endpoint: '/api/v1/roles',
    mapRecord: mapRole,
    mapUpdateRequest: mapRoleUpdateRequest,
    operations: {
      detail: 'getRole',
      update: 'updateRole',
      activate: 'activateRole',
      deactivate: 'deactivateRole',
      delete: 'deleteRole',
      restore: 'restoreRole',
      bulk: 'bulkLifecycleRoles',
    },
  })
  return {
    listRoles: service.list,
    createRole: service.create,
    getRole: operations.getOne,
    updateRole: operations.updateOne,
    activateRole: operations.activate,
    deactivateRole: operations.deactivate,
    deleteRole: operations.deleteOne,
    restoreRole: operations.restore,
    bulkLifecycleRoles: operations.bulkLifecycle,
  }
}

export const {
  listRoles,
  createRole,
  getRole,
  updateRole,
  activateRole,
  deactivateRole,
  deleteRole,
  restoreRole,
  bulkLifecycleRoles,
} = createRolesService()
