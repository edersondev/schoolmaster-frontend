import {
  mapUser,
  mapUserCreateRequest,
  mapUserUpdateRequest,
} from '@/contracts/admin-system/users'
import { authService } from '@/services/auth/authService'
import {
  administrationHttpClient,
  createAdministrationResourceOperations,
  createAdministrationService,
} from './administration-service'

const USER_ENDPOINT = '/api/v1/users'

export function createUsersService(
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
) {
  const service = createAdministrationService({
    client,
    endpoint: USER_ENDPOINT,
    listOperationId: 'listUsers',
    createOperationId: 'createUser',
    mapRecord: mapUser,
    mapCreateRequest: mapUserCreateRequest,
    getAccessToken,
  })

  const operations = createAdministrationResourceOperations({
    client,
    endpoint: USER_ENDPOINT,
    mapRecord: mapUser,
    mapUpdateRequest: mapUserUpdateRequest,
    operations: {
      detail: 'getUser',
      update: 'updateUser',
      activate: 'activateUser',
      deactivate: 'deactivateUser',
      delete: 'deleteUser',
      restore: 'restoreUser',
      bulk: 'bulkLifecycleUsers',
    },
    getAccessToken,
  })

  return {
    listUsers: service.list,
    createUser: service.create,
    getUser: operations.getOne,
    updateUser: operations.updateOne,
    activateUser: operations.activate,
    deactivateUser: operations.deactivate,
    deleteUser: operations.deleteOne,
    restoreUser: operations.restore,
    bulkLifecycleUsers: operations.bulkLifecycle,
  }
}

export const {
  listUsers,
  createUser,
  getUser,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
  restoreUser,
  bulkLifecycleUsers,
} = createUsersService()
